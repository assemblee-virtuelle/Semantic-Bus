// -----------------------------------------------------------------------------
// Tests de l'évaluation ATOMIQUE du $where (retour au comportement Loki).
//
// Le eval-service ne fait AUCUNE boucle : `/eval` évalue une expression une
// seule fois avec variables.obj = item. C'est le code appelant (filter.js /
// arraySplitByCondition.js, comme Loki) qui ITÈRE sur les items.
//
// L'engine n'a AUCUNE méthode d'évaluation interne : toute évaluation passe par
// le eval-service (container). Deux volets :
//   1. La logique du CONTAINER (secureContext.js de l'eval-service) + la boucle
//      répliquée côté test (ce que filter.js fait).
//   2. Le contrat HTTP /eval de runEvalInRemote (avec node-fetch mocké).
// -----------------------------------------------------------------------------

const vm = require('vm');
const { createSecureContext } = require('../../../eval-service/secureContext.js');
const { runEvalInRemote } = require('../../utils/evalSecurity.js');
jest.mock('node-fetch', () => jest.fn());
const fetch = require('node-fetch');

// Réplique l'exécution d'un job du container (eval-service/evalWorker.js) :
// contexte vm neuf + injection des variables + runInContext avec timeout.
function evaluateInContainer(expression, variables, timeoutMs) {
  const ctx = createSecureContext();
  Object.assign(ctx, variables);
  return vm.runInContext(expression, ctx, { timeout: timeoutMs });
}

// Réplique la boucle que filter.js/arraySplitByCondition.js font (comme Loki) :
// évaluation atomique par item avec variables.obj = item.
async function evaluateWhereLocal(expression, items) {
  const matches = [];
  for (let i = 0; i < items.length; i++) {
    const res = evaluateInContainer(expression, { obj: items[i] }, 5000);
    if (res == true) matches.push(i);
  }
  return matches;
}

describe('évaluation $where atomique — logique du container eval-service', () => {
  test('retourne les indices des items matchant (== true)', async () => {
    const items = [{ age: 10 }, { age: 25 }, { age: 18 }];
    const matches = await evaluateWhereLocal('obj.age >= 18', items);
    expect(matches).toEqual([1, 2]);
  });

  test('`this` réécrit en `obj` conserve la sémantique', async () => {
    const items = [{ name: 'a' }, { name: 'b' }];
    const matches = await evaluateWhereLocal("obj.name == 'a'", items);
    expect(matches).toEqual([0]);
  });

  test('aucun match -> tableau vide', async () => {
    const matches = await evaluateWhereLocal('obj.age > 100', [{ age: 1 }]);
    expect(matches).toEqual([]);
  });

  test('condition utilisant une expression valide complexe', async () => {
    const items = [{ x: 1 }, { x: 2 }, { x: 3 }];
    const matches = await evaluateWhereLocal('obj.x % 2 === 1', items);
    expect(matches).toEqual([0, 2]);
  });

  test('expression invalide -> rejet (erreur vm du container)', async () => {
    expect(() => evaluateInContainer('obj.', { obj: { x: 1 } }, 5000)).toThrow();
  });
});

describe('runEvalInRemote - appel signé au eval-service (/eval)', () => {
  test('retourne le champ `result` de la réponse /eval', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, result: true })
    });
    const res = await runEvalInRemote('obj.age >= 18', { obj: { age: 20 } });
    expect(res).toBe(true);
  });

  test('réponse { ok:false, error } -> rejet', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: false, error: 'boom' })
    });
    await expect(runEvalInRemote('obj.x', { obj: { x: 1 } })).rejects.toThrow(/boom/);
  });

  test('HTTP non-OK -> rejet', async () => {
    fetch.mockResolvedValue({ ok: false, status: 500 });
    await expect(runEvalInRemote('obj.x', { obj: { x: 1 } })).rejects.toThrow(/eval-service HTTP 500/);
  });
});
