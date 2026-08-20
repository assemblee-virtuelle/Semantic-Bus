// -----------------------------------------------------------------------------
// Tests unitaires du workerPool (sans container — nécessite les libs
// locales du package).
//
// Couvre le comportement du pool :
//   - exécution simple d'un eval et d'un $where ;
//   - AUCUN passage d'état entre deux jobs sur le MÊME worker (contexte vm
//     neuf par job) ;
//   - file d'attente FIFO quand tous les workers sont occupés ;
//   - timeout -> worker terminé et remplacé (le pool reste fonctionnel) ;
//   - file pleine -> rejet immédiat ;
//   - worker crash -> remplacé, job en cours rejeté.
// -----------------------------------------------------------------------------

const { WorkerPool } = require('../workerPool.js');

// Pool "normal" : recycleAfter élevé → les workers sont réutilisés (permet de
// tester la file d'attente et le comportement de réutilisation).
function makeEvalPool(size = 1) {
  return new WorkerPool({ script: 'evalWorker.js', size, recycleAfter: 1000 });
}

// Pool "sécurisé" : recycleAfter = 1 → worker recyclé après chaque job.
function makeEvalPoolSecure(size = 1) {
  return new WorkerPool({ script: 'evalWorker.js', size, recycleAfter: 1 });
}

function makeWherePool(size = 1) {
  // Le $where utilise désormais le worker ATOMIQUE (evalWorker.js) avec
  // variables.obj = item — pas de worker dédié, pas de boucle côté worker.
  return new WorkerPool({ script: 'evalWorker.js', size });
}

describe('WorkerPool — eval', () => {
  test('exécute une évaluation simple', async () => {
    const pool = makeEvalPool(1);
    try {
      const r = await pool.exec({ expression: '1 + 2', variables: {}, timeoutMs: 5000 });
      expect(r).toBe(3);
    } finally {
      pool.close();
    }
  });

  test('expose les libs (dayjs) et les variables', async () => {
    const pool = makeEvalPool(1);
    try {
      const r = await pool.exec({
        expression: 'dayjs(vD).add(1, "day").format("YYYY-MM-DD")',
        variables: { vD: '2020-01-01' },
        timeoutMs: 5000
      });
      expect(r).toBe('2020-01-02');
    } finally {
      pool.close();
    }
  });

  test('AUCUN passage d\'état entre deux jobs du MÊME worker', async () => {
    const pool = makeEvalPool(1); // 1 seul worker -> les 2 jobs passent dessus
    try {
      const r1 = await pool.exec({ expression: 'globalThis.leak1 = 123; x = 41; this.leak2 = "hack"; 1', variables: {}, timeoutMs: 5000 });
      expect(r1).toBe(1);

      const r2 = await pool.exec({ expression: 'typeof globalThis.leak1', variables: {}, timeoutMs: 5000 });
      expect(r2).toBe('undefined');

      const r3 = await pool.exec({ expression: 'typeof leak1', variables: {}, timeoutMs: 5000 });
      expect(r3).toBe('undefined');

      const r4 = await pool.exec({ expression: 'typeof leak2', variables: {}, timeoutMs: 5000 });
      expect(r4).toBe('undefined');

      // Une mutation d'un helper ne doit pas persister non plus.
      await pool.exec({ expression: 'dayjs.mutated = "x"; lodash.mutated = 1', variables: {}, timeoutMs: 5000 });
      const r5 = await pool.exec({ expression: 'typeof dayjs.mutated', variables: {}, timeoutMs: 5000 });
      expect(r5).toBe('undefined');
    } finally {
      pool.close();
    }
  });

  test('variables d\'un job ne fuient pas dans le suivant', async () => {
    const pool = makeEvalPool(1);
    try {
      await pool.exec({ expression: 'vOnly = 99', variables: { vOnly: 99 }, timeoutMs: 5000 });
      const r = await pool.exec({ expression: 'typeof vOnly', variables: {}, timeoutMs: 5000 });
      expect(r).toBe('undefined');
    } finally {
      pool.close();
    }
  });

  test('file FIFO : les jobs attendent quand le worker est occupé', async () => {
    const pool = makeEvalPool(1); // 1 worker -> 3 jobs sérialisés
    try {
      const started = Date.now();
      const jobs = [0, 1, 2].map((i) =>
        pool.exec({
          // petite boucle CPU pour occuper le worker
          expression: `(() => { const t = Date.now(); while (Date.now() - t < 30) {} return ${i}; })()`,
          variables: {},
          timeoutMs: 5000
        })
      );
      const results = await Promise.all(jobs);
      expect(results).toEqual([0, 1, 2]); // ordre FIFO préservé
      expect(Date.now() - started).toBeGreaterThanOrEqual(80); // sérialisés (~3×30ms)
    } finally {
      pool.close();
    }
  });

  test('timeout -> worker terminé et remplacé, pool toujours fonctionnel', async () => {
    const pool = makeEvalPool(1);
    try {
      await expect(
        pool.exec({ expression: 'while (true) {}', variables: {}, timeoutMs: 300 })
      ).rejects.toThrow(/timed out/);

      // Le worker a été tué puis remplacé : une nouvelle éval doit fonctionner.
      const r = await pool.exec({ expression: '6 * 7', variables: {}, timeoutMs: 5000 });
      expect(r).toBe(42);
    } finally {
      pool.close();
    }
  });

  test('file pleine -> rejet immédiat', async () => {
    const pool = makeEvalPool(1);
    try {
      // 1 worker occupé + 1 en file = capacité queue=1 -> la 3e est rejetée
      const busy = pool.exec({
        expression: '(() => { const t = Date.now(); while (Date.now() - t < 100) {} return 1; })()',
        variables: {},
        timeoutMs: 5000
      });
      const queued = pool.exec({ expression: '2', variables: {}, timeoutMs: 5000 });
      await expect(pool.exec({ expression: '3', variables: {}, timeoutMs: 5000 }, 5000, 1)).rejects.toThrow(/queue full/);
      await expect(busy).resolves.toBe(1);
      await expect(queued).resolves.toBe(2);
    } finally {
      pool.close();
    }
  });

  test('worker qui meurt -> remplacé et job en cours rejeté', async () => {
    const pool = makeEvalPool(1);
    try {
      // Dispatch synchrone : le job est déjà attribué à un worker.
      const jobP = pool.exec({ expression: '1 + 1', variables: {}, timeoutMs: 5000 }, 5000);
      const wrapper = [...pool.jobs.values()][0].wrapper;
      expect(wrapper).toBeDefined();
      // Simule un crash brutal du worker en cours de job
      wrapper.worker.terminate();
      await expect(jobP).rejects.toThrow();
      // Le pool a remplacé le worker : le service reste utilisable.
      const r = await pool.exec({ expression: '40 + 2', variables: {}, timeoutMs: 5000 }, 5000);
      expect(r).toBe(42);
    } finally {
      pool.close();
    }
  });

  test('recyclage : worker recréé après chaque job (recycleAfter=1)', async () => {
    const pool = makeEvalPoolSecure(1);
    try {
      const w1 = pool.idle[0];
      await pool.exec({ expression: '1+1', variables: {}, timeoutMs: 5000 }, 5000);
      // après le job, le worker a été recyclé (terminé + remplacé)
      const w2 = pool.idle[0];
      expect(w2).not.toBe(w1); // un NOUVEAU worker
      // et il fonctionne encore
      const r = await pool.exec({ expression: '6*7', variables: {}, timeoutMs: 5000 }, 5000);
      expect(r).toBe(42);
    } finally {
      pool.close();
    }
  });
});

describe('WorkerPool — $where atomique (retour Loki)', () => {
  test('évalue une condition $where atomiquement (variables.obj = item)', async () => {
    const pool = makeWherePool(1);
    try {
      // Chaque job = une évaluation atomique sur un item (obj).
      const r1 = await pool.exec({ expression: 'obj.age >= 18', variables: { obj: { age: 25 } }, timeoutMs: 5000 }, 5000);
      expect(r1).toBe(true);
      const r2 = await pool.exec({ expression: 'obj.age >= 18', variables: { obj: { age: 10 } }, timeoutMs: 5000 }, 5000);
      expect(r2).toBe(false);
    } finally {
      pool.close();
    }
  });

  test('aucun passage d\'état entre deux jobs $where', async () => {
    const pool = makeWherePool(1);
    try {
      await pool.exec({ expression: 'globalThis.leakW = 1', variables: { obj: {} }, timeoutMs: 5000 }, 5000);
      const r = await pool.exec({
        expression: 'typeof globalThis.leakW === "undefined" && obj.age >= 18',
        variables: { obj: { age: 18 } },
        timeoutMs: 5000
      }, 5000);
      expect(r).toBe(true);
    } finally {
      pool.close();
    }
  });
});