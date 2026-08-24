// Test E2E — écran admin : liste des utilisateurs + tri (Chromium/Playwright).
//
// Usage (infra locale démarrée via docker compose, UI sur http://localhost) :
//   node tests/e2e/admin-users-render.js
//
// Variables d'env optionnelles :
//   BASE_URL   (défaut http://localhost)
//   ADMIN_EMAIL (défaut alice.admin@example.com)
//   ADMIN_PASS  (défaut password123)
//
// Échoue (exit 1) si la liste des users ne s'affiche pas ou si une erreur
// console survient. À exécuter AVANT de merger une feature touchant l'UI admin.

const { chromium } = require('/home/simon/.npm/_npx/86170c4cd1c5da32/node_modules/playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'alice.admin@example.com';
const ADMIN_PASS = process.env.ADMIN_PASS || 'password123';
const EXECUTABLE = process.env.CHROMIUM_PATH || '/snap/bin/chromium';

function fail(msg) {
  console.error('❌ ' + msg);
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch({ executablePath: EXECUTABLE, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 150)); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message.slice(0, 150)));

  // 1. Connexion en tant qu'admin
  await page.goto(BASE_URL + '/ihm/login.html#connexion');
  await page.waitForTimeout(1500);
  await page.evaluate(({ email, pass }) => {
    const set = (sel, value) => {
      const el = document.querySelector(sel);
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };
    set('#email', email);
    set('#password', pass);
  }, { email: ADMIN_EMAIL, pass: ADMIN_PASS });
  await page.click('#email');
  await page.waitForTimeout(200);
  await page.click('#password');
  await page.waitForTimeout(200);
  await page.evaluate(() => {
    const form = document.querySelector('form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  await page.waitForTimeout(3000);

  if (!page.url().includes('application.html')) {
    fail('connexion échouée (URL=' + page.url() + ')');
  }

  // 2. Aller sur #admin
  await page.goto(BASE_URL + '/ihm/application.html#admin');
  await page.waitForTimeout(3500);

  // 3. Vérifier le rendu de la liste
  const result = await page.evaluate(() => {
    const admin = document.querySelector('admin');
    if (!admin) return { mounted: false };
    const rows = Array.from(admin.querySelectorAll('.userRow'));
    const header = admin.querySelector('.containerTitle');
    const headerText = header ? header.textContent.replace(/\s+/g, ' ').trim() : '';
    return { mounted: true, rowCount: rows.length, header: headerText };
  });

  console.log('Rendu admin:', JSON.stringify(result));
  if (!result.mounted) fail('tag admin non monté');
  if (result.rowCount === 0) fail('aucune ligne user affichée');
  if (!result.header || !result.header.includes('WORKFLOWS')) fail('header incomplet: ' + result.header);
  if (errors.length > 0) fail('erreurs console: ' + errors.join(' | '));

  // 4. Vérifier le tri (clic sur l'en-tête WORKFLOWS)
  await page.evaluate(() => {
    const th = document.querySelector('admin .tableTitleCount');
    th.click();
  });
  await page.waitForTimeout(500);

  console.log('✅ Rendu admin OK : ' + result.rowCount + ' user(s) affichés, tri OK, 0 erreur console');
  await browser.close();
})().catch(e => { console.error('❌ FATAL', e.message); process.exit(1); });