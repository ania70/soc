# هندآف — Handoff

> این فایل را یک توسعه‌دهندهٔ ماهر می‌خواند که پروژه را ندیده و نمی‌تواند از تو بپرسد. کوتاه است و به مستندات اشاره می‌کند، نه تکرارِ آنها.

## محصول چیست

یک داشبوردِ امنیتیِ کوبرنتیز که با eBPF رویدادهای سطحِ کرنل (execve, openat, connect) را ثبت و به‌صورتِ زنده و تاریخی نمایش می‌دهد. نسخهٔ ۰.۱ فقط ثبت و نمایش است — تشخیصِ ناهنجاری در نسخه‌های بعد. محصول دو بخش دارد: داشبوردِ وب (FastAPI + React) و پروبِ eBPF (Go).

## چیدمانِ فایل و پورت

پورت: **8001** (از `docs/profile.md` و `.env`).

```
backend/    FastAPI, SQLAlchemy, Alembic, tests
frontend/   React + Vite (TypeScript)
probe/      Go eBPF agent
deploy/     K8s DaemonSet manifests
data/       SQLite file (git-ignored)
run.sh      build + migrate + start
```

ساختار دقیقِ فایل‌ها و مدلِ داده در `docs/living/architecture.md` بخشِ «File layout» و «Data model» است.

## مدلِ داده (خلاصه)

سه جدول: `events` (رویدادهای syscall — BigInteger PK, syscall_type, timestamp, pid, process_name, pod_name, node_name, namespace, container_id, args JSON)، `users` (admin)، `nodes` (نودهای کلاستر با وضعیتِ پروب). جزئیاتِ ستون‌ها در `docs/living/architecture.md`.

## ترتیبِ ساخت

از چک‌لیستِ `docs/versions/0.1/checklist.md` از آیتمِ ۱ شروع کن. ترتیب مهم است:

۱. ابتدا backend (آیتم‌های ۱-۱۵): models، migration، auth، REST + WebSocket، background tasks، mock generator، static serving
۲. سپس frontend (آیتم‌های ۱۶-۲۶): pages، components، theme
۳. سپس integration (آیتم‌های ۲۷-۲۹): `run.sh`، tests، walk scenarios 1-15
۴. در آخر probe (آیتم‌های ۳۰-۳۲): Go agent، DaemonSet، walk scenarios 16-17

## نکاتِ غیربدیهی

- **eBPF روی macOS کار نمی‌کند.** داشبورد با `MOCK_EVENTS=true` در `.env` روی macOS تست می‌شود. پروب فقط روی لینوکس اجرا می‌شود. سناریوهای ۱۶-۱۷ فقط روی کلاسترِ واقعی قابلِ تست هستند.
- **Probe auth با JWT کاربر کار نمی‌کند.** پروب با یک shared key (`PROBE_API_KEY` در هدرِ `X-Probe-Key`) احرازِ هویت می‌کند — نه با JWT. این کلید باید در `secrets/secrets.local.md` و `.env` اضافه شود.
- **WebSocket auth از طریقِ query param است** (`?token=...`)، نه هدر — چون WebSocket API مرورگر هدرِ سفارشی در handshake نمی‌فرستد.
- **رویداد بدونِ پاد مجاز است.** اگر پردازش خارجِ پاد باشد، `pod_name` و `namespace` خالی (NULL) هستند. frontend باید «—» نمایش دهد.
- **events.node_name کلیدِ خارجیِ فیزیکی نیست** — نود ممکن است قبل یا بعد از رویداد ثبت شود. رابطه منطقی است.
- **Token در حافظه نگه داشته می‌شود (Zustand)، نه در localStorage** — تصمیمِ امنیتی.
- **`run.sh` تنها راهِ اجرای برنامه است.** چیزِ دیگری برای start/restart اختراع نکن.

## رمزها

در `secrets/secrets.local.md` (git-ignored):
- `SECRET_KEY` — تولید شده
- `ADMIN_USER` = `admin`
- `ADMIN_PASSWORD` — تولید شده
- `PROBE_API_KEY` — **هنوز تولید نشده.** در زمانِ ساخت اضافه کن: یک رشتهٔ تصادفی، در secrets و `.env` بنویس.

## «تمام‌شدن» یعنی چه

- هر آیتمِ چک‌لیست تیک خورده یا BLOCKED
- تمامِ تست‌های pytest پاس شده
- برنامه روی `http://localhost:8001` اجرا می‌شود
- سناریوهای ۱-۱۵ با `MOCK_EVENTS=true` پاس شده‌اند
- سناریوهای ۱۶-۱۷ روی کلاسترِ واقعی (اگر در دسترس باشد) پاس شده‌اند

**استقرار جزو ساخت نیست** — آن `/deploy` است، یک فازِ جداگانه. build نباید تلاش کند deploy کند.
