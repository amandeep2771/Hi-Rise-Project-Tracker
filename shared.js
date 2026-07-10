// HRC Ledger — shared config, Supabase client, and small helpers used by every page.
// Loaded before each page's own <script> block.

// ====== CONFIG — fill these in after creating your Supabase project ======
const SUPABASE_URL = 'https://cldrppygnocudcwwzwll.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ZvpNH9xY7BhXr5A3__X79w_-oTelZ2M';
const ATTACHMENTS_BUCKET = 'attachments';
// ============================================================================

const CATEGORIES = ['Materials','Labor','Software','Equipment','Travel','Subcontractor','Office','Other'];

let configOk = SUPABASE_URL.indexOf('YOUR_SUPABASE') === -1 && SUPABASE_ANON_KEY.indexOf('YOUR_SUPABASE') === -1;
let sb = null;
let configError = null;
if (configOk) {
  try {
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (e) {
    configOk = false;
    configError = e && e.message ? e.message : String(e);
  }
}

// Show a friendly message instead of a silently frozen page if something throws
// before our own error handling kicks in.
window.addEventListener('error', function (ev) {
  const app = document.getElementById('app');
  if (app && app.querySelector('.loading') && !app.querySelector('.fatal-shown')) {
    app.innerHTML = `
      <div class="loading fatal-shown" style="max-width:520px;margin:60px auto;text-align:left;">
        <div style="font-family:'Fraunces',serif;font-size:18px;font-style:italic;color:var(--rust);margin-bottom:10px;">Something went wrong loading the page</div>
        <div>${escapeHtml(ev.message || 'Unknown script error')}</div>
        <div style="margin-top:10px;">Check that SUPABASE_URL and SUPABASE_ANON_KEY near the top of shared.js are both filled in correctly, with the quotes intact, and that you're opening this file through a web server / GitHub Pages (not a text editor).</div>
      </div>
    `;
  }
});

function configErrorHtml() {
  return `
    <div class="loading" style="max-width:520px;margin:60px auto;text-align:left;">
      <div style="font-family:'Fraunces',serif;font-size:18px;font-style:italic;color:var(--ink);margin-bottom:10px;">Almost there</div>
      <div>This app needs your Supabase project connection details before it can run. Open <code>shared.js</code> and set <code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code> near the top, then reload the page. See SETUP.md for step-by-step instructions.</div>
      ${configError ? `<div style="margin-top:10px;color:var(--rust);">Error detail: ${escapeHtml(configError)}</div>` : ''}
    </div>
  `;
}

function loadErrorHtml(err) {
  return `
    <div class="loading" style="max-width:520px;margin:60px auto;text-align:left;">
      <div style="font-family:'Fraunces',serif;font-size:18px;font-style:italic;color:var(--rust);margin-bottom:10px;">Couldn't load data</div>
      <div>${escapeHtml(err && err.message ? err.message : 'Unknown error')}</div>
      <div style="margin-top:10px;">Double-check schema.sql has been run in your Supabase project (including any newer sections), and that SUPABASE_URL / SUPABASE_ANON_KEY in shared.js are correct.</div>
    </div>
  `;
}

function fmt(n) {
  const num = Number(n) || 0;
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
function fmtBytes(b) {
  if (!b && b !== 0) return '';
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(0) + ' KB';
  return (b / (1024 * 1024)).toFixed(1) + ' MB';
}
function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

function escapeHtml(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
function escapeAttr(str) { return escapeHtml(str); }

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove('show'), 2600);
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// Renders the shared header (logo + tagline + nav). `active` is one of
// 'dashboard' | 'materials' to highlight the current section.
function renderTopNav(active) {
  return `
    <header class="top">
      <a class="brand-link" href="index.html">
        <img class="logo" src="assets/logo.png" alt="Hi Rise Construction Ltd">
      </a>
      <nav class="top-nav">
        <a href="index.html" class="${active === 'dashboard' ? 'active' : ''}">Projects</a>
        <a href="materials.html" class="${active === 'materials' ? 'active' : ''}">Master price list</a>
      </nav>
    </header>
  `;
}

// Formats a vendor label for a material/price-list row, e.g. "ABC Supply" or "No vendor".
function vendorLabel(vendorId, vendors) {
  if (!vendorId) return null;
  const v = (vendors || []).find(v => v.id === vendorId);
  return v ? v.name : null;
}
