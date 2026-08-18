const { runWhereInWorker } = require('../../utils/evalSecurity.js');

describe('runWhereInWorker - évaluation $where en worker terminable', () => {
  test('retourne les indices des items matchant (== true)', async () => {
    const items = [{ age: 10 }, { age: 25 }, { age: 18 }];
    const matches = await runWhereInWorker('obj.age >= 18', items);
    expect(matches).toEqual([1, 2]);
  });

  test('`this` réécrit en `obj` conserve la sémantique', async () => {
    const items = [{ name: 'a' }, { name: 'b' }];
    const matches = await runWhereInWorker("obj.name == 'a'", items);
    expect(matches).toEqual([0]);
  });

  test('aucun match -> tableau vide', async () => {
    const matches = await runWhereInWorker('obj.age > 100', [{ age: 1 }]);
    expect(matches).toEqual([]);
  });

  test('condition utilisant une expression valide complexe', async () => {
    const items = [{ x: 1 }, { x: 2 }, { x: 3 }];
    const matches = await runWhereInWorker('obj.x % 2 === 1', items);
    expect(matches).toEqual([0, 2]);
  });

  test('expression invalide -> rejet', async () => {
    await expect(runWhereInWorker('obj.', [{ x: 1 }])).rejects.toThrow();
  });

  test('entrée non tableau -> rejet', async () => {
    await expect(runWhereInWorker('obj.x', 'nope')).rejects.toThrow(/must be an array/);
  });

  test('expression bloquante (ReDoS) interrompue par timeout', async () => {
    // (a+)+$ sur une chaîne longue est un backtracking exponentiel.
    const items = [{ s: 'a'.repeat(50) + '!' }];
    let error;
    try {
      await runWhereInWorker('new RegExp("(a+)+$").test(obj.s)', items, 150);
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(`${error.message}`).toMatch(/timed out/);
  }, 5000);
});
