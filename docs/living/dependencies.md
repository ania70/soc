<!--
  dependencies.md — the ONE living record of this product's external services.
  Dependencies are DECIDED at /idea-core, each with a ranked list of fallbacks;
  /deps only makes the chosen one usable, and swaps to the next one if it fails.
  Part A is yours (the AI): how the app talks to each external.
  Part B is the user's: where to sign up, what to obtain, which .env name it maps to.
  Put the matching variable NAMES (no values) in .env.example and in
  secrets/secrets.local.md.example. Real values are written by the USER into
  secrets/secrets.local.md — never asked for in the chat.
  If the product has no externals, say so plainly and leave the rest empty.
-->

# وابستگی‌های بیرونی

> تنها مرجعِ سرویس‌های بیرونیِ این محصول. سرور و آدرسِ عمومی وابستگی نیستند — در گامِ استقرار تعیین می‌شوند.

## این محصول به چه سرویس‌های بیرونی نیاز دارد؟
<!-- فهرست کن، یا بنویس «هیچ وابستگیِ بیرونی‌ای لازم نیست». -->

---

## بخش الف — یادداشت‌های اتصال (کارِ دستیار)
<!-- برای هر سرویس: محصول چطور صدایش می‌زند؛ اگر مستنداتی در docs/external-docs/ هست، اشاره کن. -->

### سرویس: ______
- نحوهٔ اتصال:
- مستنداتِ لازم در `docs/external-docs/`:
- نامِ متغیرهای لازم:

---

## بخش ب — چک‌لیستِ راه‌اندازی (کارِ تو)
<!-- برای هر سرویس: کجا ثبت‌نام، چه چیزی بگیر، در کدام نام می‌نشیند. -->

### سرویس: ______
- این برای چه کاری است:
- کجا ثبت‌نام کن یا چه بساز:
- چه مقداری بگیر:
- در کدام نام می‌نشیند:
- **اگر نشد، جایگزینِ بعدی:**  ← از `/idea-core` می‌آید
- **اگر هیچ‌کدام نشد:**  ← راهِ دستی، و اینکه چه چیزی از محصول کم می‌شود

> مقدارها را **خودت** در فایلِ `secrets/secrets.local.md` می‌نویسی. آن فایل روی کامپیوترِ خودت می‌ماند و در گیت نمی‌رود. هیچ‌وقت رمز و کلید را در گفت‌وگو نچسبان.
