jest.mock('@semantic-bus/core/lib/fragment_lib_scylla.js', () => ({}));
jest.mock('@semantic-bus/core/helpers/dfobProcessor.js', () => ({}));
jest.mock('../../utils/objectTransformationV2.js', () => ({ __esModule: true, default: {} }));

const Regex = require('../../workspaceComponentExecutor/regex');
const { runRegexInWorker } = require('../../utils/evalSecurity');

describe('regex - ReDoS protections (point 3)', () => {
  test('extrait les groupes capturés comme avant', async () => {
    const result = await Regex.pull(
      { specificData: { regex: '(\\d+)-(\\d+)' } },
      [{ data: 'a 1-2 b 3-4 c' }],
      {}
    );
    expect(result.data).toEqual([['1', '2'], ['3', '4']]);
  });

  test('aucun match -> tableau vide', async () => {
    const result = await Regex.pull(
      { specificData: { regex: 'z+' } },
      [{ data: 'abc' }],
      {}
    );
    expect(result.data).toEqual([]);
  });

  test('motif invalide -> rejet (pas de crash)', async () => {
    await expect(Regex.pull(
      { specificData: { regex: '(' } },
      [{ data: 'abc' }],
      {}
    )).rejects.toThrow();
  });

  test('pattern trop long -> rejet (limite de longueur)', async () => {
    await expect(runRegexInWorker('a'.repeat(2049), 'g', 'x')).rejects.toThrow(/too long/);
  });

  test('entrée non string -> rejet', async () => {
    await expect(runRegexInWorker('a', 'g', 123)).rejects.toThrow(/must be a string/);
  });

  test('motif catastrophique (ReDoS) interrompu par timeout', async () => {
    // (a+)+$ sur une entrée longue est un backtracking exponentiel.
    let error;
    try {
      await runRegexInWorker('(a+)+$', 'g', 'a'.repeat(100) + '!', 150);
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(`${error.message}`).toMatch(/timed out/);
  }, 5000);
});
