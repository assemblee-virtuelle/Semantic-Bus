// -----------------------------------------------------------------------------
// Tests d'intégration du eval-service (container d'évaluation isolé).
//
// Nécessite le container eval-service démarré :
//   docker compose up -d eval-service
// puis : npx jest packages/eval-service/__tests__/eval-service.integration.test.js
//
// Couvre les cas RÉELS de production (extraits de la base semantic-bus-prod-all) :
// dayjs, moment/this.moment, he.decode, crypto, eval('new '+...), Buffer.from,
// clés unicode, $where, et la sécurité (require/process inaccessibles, signature).
// -----------------------------------------------------------------------------

const hmac = require('@semantic-bus/core/lib/hmac_lib');

const URL = process.env.EVAL_SERVICE_URL || 'http://localhost:8083';
const SIGN_COMPONENT = 'eval';

async function call(route, body, sign = true) {
  const headers = { 'Content-Type': 'application/json' };
  // Corps sérialisé UNE FOIS puis signé sur ses octets bruts (signBuffer),
  // conformément au protocole du eval-service (verifyBuffer).
  const rawBody = Buffer.from(JSON.stringify(body), 'utf8');
  if (sign) {
    const { signature, timestamp } = hmac.signBuffer(SIGN_COMPONENT, rawBody);
    headers[hmac.HMAC_HEADER] = signature;
    headers[hmac.HMAC_TIMESTAMP_HEADER] = timestamp;
  }
  const res = await fetch(URL + route, { method: 'POST', headers, body: rawBody });
  return { status: res.status, data: await res.json() };
}

describe('eval-service — cas réels de production', () => {
  test('dayjs format (prod)', async () => {
    const { data } = await call('/eval', { expression: 'dayjs(vStart).format("DD-MM-YYYY")', variables: { vStart: '2020-01-01' } });
    expect(data.ok).toBe(true);
    expect(data.result).toBe('01-01-2020');
  });

  test('dayjs diff (prod)', async () => {
    const { data } = await call('/eval', {
      expression: 'dayjs(vEnd).diff(dayjs(vStart), "minute")',
      variables: { vStart: '2020-01-01', vEnd: '2020-01-01 01:30' }
    });
    expect(data.ok).toBe(true);
    expect(data.result).toBe(90);
  });

  test('this.moment conditionnel (prod)', async () => {
    const { data } = await call('/eval', {
      expression: 'vDate!==undefined?this.moment(vDate,"YYYY-MM-DD").format("DD/MM/YYYY"):undefined',
      variables: { vDate: '2020-05-01' }
    });
    expect(data.ok).toBe(true);
    expect(data.result).toBe('01/05/2020');
  });

  test('he.decode (prod)', async () => {
    const { data } = await call('/eval', { expression: 'he.decode(vPairs)', variables: { vPairs: 'a&amp;b' } });
    expect(data.ok).toBe(true);
    expect(data.result).toBe('a&b');
  });

  test('crypto.createHash (prod)', async () => {
    const { data } = await call('/eval', { expression: 'crypto.createHash("sha256").update(vS).digest("hex")', variables: { vS: 'hello' } });
    expect(data.ok).toBe(true);
    expect(data.result).toMatch(/^[0-9a-f]{64}$/);
  });

  test('eval("new "+...) pour construire une Date (prod)', async () => {
    const { data } = await call('/eval', { expression: '(eval("new " + vDate)).getDate()', variables: { vDate: 'Date("2020-01-15")' } });
    expect(data.ok).toBe(true);
    expect(data.result).toBe(15);
  });

  test('Buffer.from(...).toString("base64") (prod)', async () => {
    const { data } = await call('/eval', { expression: 'Buffer.from(vS).toString("base64")', variables: { vS: '2020-01-15' } });
    expect(data.ok).toBe(true);
    expect(data.result).toBe(Buffer.from('2020-01-15').toString('base64'));
  });

  test('clés unicode préservées', async () => {
    const { data } = await call('/eval', { expression: 'vObj', variables: { vObj: { 'clé émoji☺': 'valeur éàü' } } });
    expect(data.ok).toBe(true);
    expect(data.result).toEqual({ 'clé émoji☺': 'valeur éàü' });
  });

  test('variable source/tableau (map)', async () => {
    const { data } = await call('/eval', { expression: 'source.data.map(d => d * factor)', variables: { factor: 2, source: { data: [1, 2, 3] } } });
    expect(data.ok).toBe(true);
    expect(data.result).toEqual([2, 4, 6]);
  });

  test('/eval évalue une condition $where atomiquement (obj = item)', async () => {
    // Le eval-service est atomique : /eval avec variables.obj = item (le code
    // appelant — filter.js, comme Loki — itère sur les items).
    const r1 = await call('/eval', { expression: 'obj.age >= 18', variables: { obj: { age: 25 } } });
    expect(r1.data.ok).toBe(true);
    expect(r1.data.result).toBe(true);

    const r2 = await call('/eval', { expression: 'obj.age >= 18', variables: { obj: { age: 10 } } });
    expect(r2.data.ok).toBe(true);
    expect(r2.data.result).toBe(false);
  });

  test('sécurité : eval(require) inaccessible (pas de RCE)', async () => {
    const { data } = await call('/eval', { expression: 'eval("require(\'fs\').readFileSync(\'/etc/passwd\')")', variables: {} });
    expect(data.ok).toBe(false);
  });

  test('sécurité : lodash.template retiré du scope (RCE host realm bloquée)', async () => {
    // Bypass signalé par le chercheur : lodash.template compilait son corps avec
    // un Function du host realm, échappant au vm. Le worker expose désormais un
    // lodash sans template/templateSettings.
    const r = await call('/eval', { expression: 'typeof lodash.template', variables: {} });
    expect(r.data.ok).toBe(true);
    expect(r.data.result).toBe('undefined');
  });

  test('sécurité : import() dynamique rejeté dans le worker', async () => {
    const r = await call('/eval', { expression: 'import("fs")', variables: {} });
    // soit erreur, soit "function" (mais pas de chargement effectif)
    expect(r.data.ok).toBe(false);
  });

  test('sécurité : eval(process) inaccessible', async () => {
    const { data } = await call('/eval', { expression: 'eval("process.env")', variables: {} });
    expect(data.ok).toBe(false);
  });

  test('sécurité : signature manquante -> 401', async () => {
    const { status } = await call('/eval', { expression: '1+1', variables: {} }, false);
    expect(status).toBe(401);
  });

  test('sécurité : fetch/WebSocket strippés (pas d\'egress réseau)', async () => {
    const r1 = await call('/eval', { expression: 'typeof fetch', variables: {} });
    expect(r1.data.ok).toBe(true);
    expect(r1.data.result).toBe('undefined');

    const r2 = await call('/eval', { expression: 'typeof WebSocket', variables: {} });
    expect(r2.data.ok).toBe(true);
    expect(r2.data.result).toBe('undefined');
  });

  test('sécurité : Buffer réduit (seul from exposé, pas alloc/prototype)', async () => {
    const r1 = await call('/eval', { expression: 'typeof Buffer.alloc', variables: {} });
    expect(r1.data.ok).toBe(true);
    expect(r1.data.result).toBe('undefined');

    const r2 = await call('/eval', { expression: 'typeof Buffer.prototype', variables: {} });
    expect(r2.data.ok).toBe(true);
    expect(r2.data.result).toBe('undefined');

    // Buffer.from reste fonctionnel (cas prod)
    const r3 = await call('/eval', { expression: 'Buffer.from("x").toString("base64")', variables: {} });
    expect(r3.data.ok).toBe(true);
    expect(r3.data.result).toBe(Buffer.from('x').toString('base64'));
  });

  test('sécurité : expression ReDoS interrompue par timeout (eval)', async () => {
    // regex catastrophique (backtracking exponentiel) -> doit être interrompue
    const t0 = await call('/eval', {
      expression: 'new RegExp("(a+)+$").test("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!")',
      variables: {},
      timeoutMs: 300
    });
    expect(t0.data.ok).toBe(false);

    // le service reste disponible après
    const after = await call('/eval', { expression: '6 * 7', variables: {} });
    expect(after.data.ok).toBe(true);
    expect(after.data.result).toBe(42);
  });

  test('pool : aucun passage d\'état entre deux évals (contexte vm neuf)', async () => {
    const r1 = await call('/eval', { expression: 'globalThis.leakPool = 123; 1', variables: {} });
    expect(r1.data.ok).toBe(true);

    const r2 = await call('/eval', { expression: 'typeof globalThis.leakPool', variables: {} });
    expect(r2.data.ok).toBe(true);
    expect(r2.data.result).toBe('undefined');
  });

  test('pool : une boucle infinie est interrompue (timeout) et le service reste dispo', async () => {
    const t0 = await call('/eval', { expression: 'while (true) {}', variables: {}, timeoutMs: 400 });
    expect(t0.data.ok).toBe(false);

    const after = await call('/eval', { expression: '6 * 7', variables: {} });
    expect(after.data.ok).toBe(true);
    expect(after.data.result).toBe(42);
  });
});
