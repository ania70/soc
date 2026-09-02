/* KubeShield — UI Prototype Logic */

// ==================== Mock Data ====================
const PROCESSES = ['nginx', 'kubelet', 'containerd', 'etcd', 'kube-apiserver', 'curl', 'python3', 'node', 'redis-server', 'postgres'];
const POD_NAMES = ['nginx-7f9b6b-x2k4f', 'api-deploy-5c8d9f-m1n3p', 'redis-master-0', 'worker-batch-8h2j1', 'kube-proxy-9s8d7', 'coredns-6d4c8b-q1w2e', 'fluentd-aggregator-3r4t5'];
const NODES = [
  { name: 'worker-node-01', ip: '10.0.1.15', status: 'active', lastReport: null },
  { name: 'worker-node-02', ip: '10.0.1.16', status: 'active', lastReport: null },
  { name: 'worker-node-03', ip: '10.0.1.17', status: 'active', lastReport: null },
  { name: 'control-plane-01', ip: '10.0.1.10', status: 'inactive', lastReport: null },
];
const NAMESPACES = ['default', 'kube-system', 'monitoring', 'production', 'staging'];
const SYSCALLS = ['execve', 'openat', 'connect'];
const FILE_PATHS = ['/etc/passwd', '/var/log/app.log', '/etc/nginx/nginx.conf', '/tmp/sensitive.dat', '/proc/1/fd/0', '/var/run/docker.sock'];
const EXEC_PATHS = ['/usr/bin/curl', '/usr/bin/python3', '/bin/sh', '/usr/local/bin/node', '/usr/bin/redis-cli'];
const CONNECT_TARGETS = ['10.0.2.50:443', '169.254.169.254:80', '8.8.8.8:53', '10.0.1.20:6379', 'api.internal:8080'];

let events = [];
let histFiltered = [];
let histPage = 1;
const HIST_PER_PAGE = 50;
const MAX_LIVE = 500;
let liveInterval = null;
let eventRateCount = 0;
let lastRateTime = Date.now();

// ==================== Auth ====================
function doLogin() {
  const u = document.getElementById('login-username').value.trim();
  const p = document.getElementById('login-password').value.trim();
  if ((u === 'admin' && p === 'admin') || (u === '' && p === '')) {
    document.getElementById('login-error').classList.add('hidden');
    document.getElementById('screen-login').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');
    initApp();
  } else {
    document.getElementById('login-error').classList.remove('hidden');
  }
}

function doLogout() {
  stopLiveStream();
  events = [];
  document.getElementById('app-shell').classList.add('hidden');
  document.getElementById('screen-login').classList.remove('hidden');
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
}

// ==================== Navigation ====================
function showScreen(screen) {
  const screens = ['live', 'historical', 'nodes'];
  screens.forEach(s => {
    const el = document.getElementById('screen-' + s);
    const nav = document.getElementById('nav-' + s);
    if (s === screen) {
      el.classList.remove('hidden');
      nav.classList.add('kb-nav-active');
    } else {
      el.classList.add('hidden');
      nav.classList.remove('kb-nav-active');
    }
  });
  if (screen === 'historical') renderHistorical();
  if (screen === 'nodes') renderNodes();
  if (screen === 'live') startLiveStream(); else stopLiveStream();
}

// ==================== Event Generation ====================
function generateEvent() {
  const syscall = SYSCALLS[Math.floor(Math.random() * SYSCALLS.length)];
  const hasPod = Math.random() > 0.15;
  const process = PROCESSES[Math.floor(Math.random() * PROCESSES.length)];
  const pod = hasPod ? POD_NAMES[Math.floor(Math.random() * POD_NAMES.length)] : null;
  const node = NODES[Math.floor(Math.random() * NODES.length)].name;
  const ns = hasPod ? NAMESPACES[Math.floor(Math.random() * NAMESPACES.length)] : null;
  const pid = Math.floor(Math.random() * 65000) + 1;
  const containerId = hasPod ? Array.from({length: 12}, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('') : null;
  const now = new Date();
  const ts = now.toISOString();

  let args;
  if (syscall === 'execve') {
    const execPath = EXEC_PATHS[Math.floor(Math.random() * EXEC_PATHS.length)];
    const argCount = Math.floor(Math.random() * 3) + 1;
    const argList = Array.from({length: argCount}, () => ['--verbose', '-c', '/etc/config.yaml', 'localhost:8080', '--debug'][Math.floor(Math.random() * 5)]);
    args = { executable: execPath, arguments: argList };
  } else if (syscall === 'openat') {
    const path = FILE_PATHS[Math.floor(Math.random() * FILE_PATHS.length)];
    const flags = ['O_RDONLY', 'O_WRONLY', 'O_RDWR', 'O_CREAT'][Math.floor(Math.random() * 4)];
    args = { path: path, flags: flags };
  } else {
    const target = CONNECT_TARGETS[Math.floor(Math.random() * CONNECT_TARGETS.length)];
    const [addr, port] = target.split(':');
    args = { address: addr, port: parseInt(port) };
  }

  return {
    id: events.length > 0 ? events[0].id + 1 : 1,
    syscall, timestamp: ts, pid, process, pod, node, namespace: ns,
    containerId, args
  };
}

function startLiveStream() {
  if (liveInterval) return;
  // Seed with some initial events
  if (events.length === 0) {
    for (let i = 0; i < 20; i++) {
      const ev = generateEvent();
      ev.id = 20 - i;
      events.push(ev);
    }
  }
  liveInterval = setInterval(() => {
    const ev = generateEvent();
    events.unshift(ev);
    if (events.length > MAX_LIVE) events.pop();
    eventRateCount++;
    renderLive();
    updateRate();
  }, 800 + Math.random() * 1200);
}

function stopLiveStream() {
  if (liveInterval) {
    clearInterval(liveInterval);
    liveInterval = null;
  }
}

function updateRate() {
  const now = Date.now();
  const elapsed = (now - lastRateTime) / 1000;
  if (elapsed >= 1) {
    document.getElementById('event-rate').textContent = (eventRateCount / elapsed).toFixed(1);
    eventRateCount = 0;
    lastRateTime = now;
  }
}

// ==================== Live Rendering ====================
function renderLive() {
  const filtered = filterEvents(events, 'filter-syscall', 'filter-pod', 'filter-namespace');
  document.getElementById('event-count').textContent = filtered.length;

  const tbody = document.getElementById('live-tbody');
  const empty = document.getElementById('live-empty');
  const table = document.getElementById('live-table');

  if (filtered.length === 0) {
    empty.classList.remove('hidden');
    table.classList.add('hidden');
    return;
  }
  empty.classList.add('hidden');
  table.classList.remove('hidden');

  tbody.innerHTML = filtered.slice(0, MAX_LIVE).map(ev => renderRow(ev)).join('');
}

function renderRow(ev) {
  const badgeClass = `kb-badge kb-badge-${ev.syscall}`;
  const podText = ev.pod || '<span class="text-kb-muted">—</span>';
  const nsText = ev.namespace || '<span class="text-kb-muted">—</span>';
  const time = formatTime(ev.timestamp);
  return `<tr class="kb-row" onclick="showDetail(${ev.id})">
    <td class="py-2 pr-4 text-kb-muted font-mono text-xs">${time}</td>
    <td class="py-2 pr-4"><span class="${badgeClass}">${ev.syscall}</span></td>
    <td class="py-2 pr-4">${ev.process}</td>
    <td class="py-2 pr-4 font-mono text-xs text-kb-muted">${ev.pid}</td>
    <td class="py-2 pr-4 text-xs">${podText}</td>
    <td class="py-2 pr-4 text-xs">${ev.node}</td>
    <td class="py-2 pr-4 text-xs">${nsText}</td>
  </tr>`;
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0');
}

// ==================== Filters ====================
function filterEvents(arr, syscallId, podId, nsId) {
  const sc = document.getElementById(syscallId).value;
  const pod = document.getElementById(podId).value.toLowerCase();
  const ns = document.getElementById(nsId).value.toLowerCase();
  return arr.filter(ev => {
    if (sc && ev.syscall !== sc) return false;
    if (pod && (!ev.pod || !ev.pod.toLowerCase().includes(pod))) return false;
    if (ns && (!ev.namespace || !ev.namespace.toLowerCase().includes(ns))) return false;
    return true;
  });
}

function applyFilters() { renderLive(); }
function clearFilters() {
  document.getElementById('filter-syscall').value = '';
  document.getElementById('filter-pod').value = '';
  document.getElementById('filter-namespace').value = '';
  renderLive();
}

// ==================== Historical ====================
function renderHistorical() {
  histFiltered = filterEvents(events, 'hist-filter-syscall', 'hist-filter-pod', 'hist-filter-namespace');
  histPage = 1;
  renderHistPage();
}

function renderHistPage() {
  const total = histFiltered.length;
  const pages = Math.max(1, Math.ceil(total / HIST_PER_PAGE));
  if (histPage > pages) histPage = pages;
  document.getElementById('hist-page').textContent = histPage;
  document.getElementById('hist-pages').textContent = pages;
  document.getElementById('hist-total').textContent = total;
  document.getElementById('hist-prev').disabled = histPage <= 1;
  document.getElementById('hist-next').disabled = histPage >= pages;

  const start = (histPage - 1) * HIST_PER_PAGE;
  const pageData = histFiltered.slice(start, start + HIST_PER_PAGE);

  const tbody = document.getElementById('hist-tbody');
  const empty = document.getElementById('hist-empty');
  const table = document.getElementById('hist-table');

  if (pageData.length === 0) {
    empty.classList.remove('hidden');
    table.classList.add('hidden');
    return;
  }
  empty.classList.add('hidden');
  table.classList.remove('hidden');

  tbody.innerHTML = pageData.map(ev => renderRow(ev)).join('');
}

function histPrev() { if (histPage > 1) { histPage--; renderHistPage(); } }
function histNext() { const pages = Math.ceil(histFiltered.length / HIST_PER_PAGE); if (histPage < pages) { histPage++; renderHistPage(); } }

function applyHistFilters() { renderHistorical(); }
function clearHistFilters() {
  document.getElementById('hist-filter-syscall').value = '';
  document.getElementById('hist-filter-pod').value = '';
  document.getElementById('hist-filter-namespace').value = '';
  renderHistorical();
}

// ==================== Nodes ====================
function renderNodes() {
  const tbody = document.getElementById('nodes-tbody');
  const empty = document.getElementById('nodes-empty');
  const table = document.getElementById('nodes-table');

  const activeCount = NODES.filter(n => n.status === 'active').length;
  const inactiveCount = NODES.filter(n => n.status === 'inactive').length;
  document.getElementById('nodes-active').textContent = activeCount;
  document.getElementById('nodes-inactive').textContent = inactiveCount;

  if (NODES.length === 0) {
    empty.classList.remove('hidden');
    table.classList.add('hidden');
    return;
  }
  empty.classList.add('hidden');
  table.classList.remove('hidden');

  tbody.innerHTML = NODES.map(n => {
    const statusDot = n.status === 'active'
      ? '<span class="kb-status-dot kb-status-active"></span>'
      : '<span class="kb-status-dot kb-status-inactive"></span>';
    const statusText = n.status === 'active' ? '<span class="text-kb-active">Active</span>' : '<span class="text-kb-inactive">Inactive</span>';
    const lastReport = n.status === 'active' ? new Date().toLocaleTimeString('en-US', { hour12: false }) : '2 min ago';
    return `<tr class="border-b border-kb-border/50">
      <td class="py-2 pr-4">${n.name}</td>
      <td class="py-2 pr-4 font-mono text-xs text-kb-muted">${n.ip}</td>
      <td class="py-2 pr-4"><div class="flex items-center gap-2">${statusDot} ${statusText}</div></td>
      <td class="py-2 pr-4 text-xs text-kb-muted">${lastReport}</td>
    </tr>`;
  }).join('');
}

// ==================== Event Detail Panel ====================
function showDetail(id) {
  const ev = events.find(e => e.id === id);
  if (!ev) return;

  const badgeClass = `kb-badge kb-badge-${ev.syscall}`;
  let argsHtml = '';

  if (ev.syscall === 'execve') {
    argsHtml = `
      <div><div class="kb-field-label">Executable</div><div class="kb-field-value kb-field-mono">${ev.args.executable}</div></div>
      <div><div class="kb-field-label">Arguments</div><div class="kb-field-value kb-field-mono">${ev.args.arguments.join(' ')}</div></div>`;
  } else if (ev.syscall === 'openat') {
    argsHtml = `
      <div><div class="kb-field-label">File Path</div><div class="kb-field-value kb-field-mono">${ev.args.path}</div></div>
      <div><div class="kb-field-label">Flags</div><div class="kb-field-value kb-field-mono">${ev.args.flags}</div></div>`;
  } else if (ev.syscall === 'connect') {
    argsHtml = `
      <div><div class="kb-field-label">Destination Address</div><div class="kb-field-value kb-field-mono">${ev.args.address}</div></div>
      <div><div class="kb-field-label">Port</div><div class="kb-field-value kb-field-mono">${ev.args.port}</div></div>`;
  }

  document.getElementById('detail-content').innerHTML = `
    <div>
      <div class="kb-field-label">Syscall</div>
      <span class="${badgeClass}">${ev.syscall}</span>
    </div>
    <div>
      <div class="kb-field-label">Timestamp</div>
      <div class="kb-field-value kb-field-mono">${ev.timestamp}</div>
    </div>
    <div>
      <div class="kb-field-label">PID</div>
      <div class="kb-field-value kb-field-mono">${ev.pid}</div>
    </div>
    <div>
      <div class="kb-field-label">Process</div>
      <div class="kb-field-value">${ev.process}</div>
    </div>
    <div>
      <div class="kb-field-label">Pod</div>
      <div class="kb-field-value">${ev.pod || '<span class="text-kb-muted">—</span>'}</div>
    </div>
    <div>
      <div class="kb-field-label">Namespace</div>
      <div class="kb-field-value">${ev.namespace || '<span class="text-kb-muted">—</span>'}</div>
    </div>
    <div>
      <div class="kb-field-label">Node</div>
      <div class="kb-field-value">${ev.node}</div>
    </div>
    <div>
      <div class="kb-field-label">Container ID</div>
      <div class="kb-field-value kb-field-mono">${ev.containerId || '<span class="text-kb-muted">—</span>'}</div>
    </div>
    <div class="border-t border-kb-border pt-4 space-y-3">
      <div class="text-sm font-semibold text-kb-muted">Syscall Arguments</div>
      ${argsHtml}
    </div>
  `;

  document.getElementById('detail-overlay').classList.remove('hidden');
}

function closeDetail() {
  document.getElementById('detail-overlay').classList.add('hidden');
}

// ==================== Init ====================
function initApp() {
  events = [];
  eventRateCount = 0;
  lastRateTime = Date.now();
  showScreen('live');
}

// Enter key on login
document.getElementById('login-password').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') doLogin();
});
document.getElementById('login-username').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') doLogin();
});

// Escape to close detail
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDetail();
});
