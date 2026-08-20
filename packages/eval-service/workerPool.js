'use strict';

// -----------------------------------------------------------------------------
// workerPool — pool de worker_threads PERSISTANTS pour le eval-service.
//
// Chaque worker est créé au boot et traite les jobs reçus par postMessage
// (script evalWorker.js ou whereWorker.js). Comportement :
//   - tous les workers occupés -> file FIFO en mémoire (volatile) ;
//   - un job qui dépasse son timeout : le worker est terminé et remplacé
//     (filet de sécurité : termine aussi une regex native catastrophique que le
//     timeout vm ne peut pas interrompre) ;
//   - un worker qui meurt (crash) : remplacé, son job en cours est rejeté ;
//   - pas de recyclage périodique : l'isolation entre jobs est assurée par un
//     contexte vm NEUF à CHAQUE job (voir evalWorker.js / whereWorker.js).
// -----------------------------------------------------------------------------

const path = require('path');
const { Worker } = require('worker_threads');

class WorkerPool {
  /**
   * @param {string} script nom du script worker (ex. 'evalWorker.js')
   * @param {number} size nombre de workers créés au boot
   */
  constructor({ script, size, recycleAfter = 100000 }) {
    if (!Number.isInteger(size) || size < 1) {
      throw new Error(`Invalid pool size: ${size}`);
    }
    this.script = script;
    this.size = size;
    this.recycleAfter = recycleAfter;
    this.idle = []; // workers libres
    this.jobs = new Map(); // jobId -> { jobId, payload, resolve, reject, timer, wrapper }
    this.queue = []; // jobs en attente (tous workers occupés)
    this.nextId = 0;
    this.closed = false;
    for (let i = 0; i < size; i++) this.spawn();
  }

  spawn() {
    const wrapper = {
      worker: new Worker(path.join(__dirname, this.script)),
      busy: false,
      jobId: null,
      dead: false,
      jobsDone: 0
    };
    wrapper.worker.on('message', (msg) => this.onMessage(wrapper, msg));
    wrapper.worker.on('error', (err) => this.onWorkerDead(wrapper, err));
    // Un worker persistant ne doit JAMAIS sortir de lui-même (code 0 compris) :
    // c'est un évènement inattendu -> on rejette son job et on le remplace.
    // (killAndReplace / close posent `dead`/`closed` pour éviter le double spawn.)
    wrapper.worker.on('exit', () => this.onWorkerDead(wrapper, new Error('worker exited unexpectedly')));
    this.idle.push(wrapper);
    return wrapper;
  }

  /**
   * Soumet un job au pool. Le timeout couvre l'attente en file + l'exécution.
   * @param {Object} payload contenu du message worker (expression, variables, items, ...)
   * @param {number} timeoutMs délai maximal avant terminaison du worker
   * @param {number} [maxQueue] longueur max de la file d'attente
   * @returns {Promise<*>} résultat du job
   */
  exec(payload, timeoutMs = payload && payload.timeoutMs, maxQueue = 200) {
    return new Promise((resolve, reject) => {
      const jobId = ++this.nextId;
      const job = { jobId, payload, resolve, reject, timer: null, wrapper: null };
      job.timer = setTimeout(() => {
        const live = this.jobs.get(jobId);
        if (!live) return;
        this.jobs.delete(jobId);
        const qi = this.queue.indexOf(job);
        if (qi !== -1) this.queue.splice(qi, 1);
        if (job.wrapper) this.killAndReplace(job.wrapper);
        reject(new Error(`eval timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      this.jobs.set(jobId, job);
      if (this.idle.length > 0) {
        this.dispatch(this.idle.shift(), job);
      } else if (this.queue.length >= maxQueue) {
        this.jobs.delete(jobId);
        clearTimeout(job.timer);
        reject(new Error(`eval queue full (max ${maxQueue} pending jobs)`));
      } else {
        this.queue.push(job);
      }
    });
  }

  dispatch(wrapper, job) {
    wrapper.busy = true;
    wrapper.jobId = job.jobId;
    job.wrapper = wrapper;
    wrapper.worker.postMessage({ type: 'job', jobId: job.jobId, ...job.payload });
  }

  onMessage(wrapper, msg) {
    if (!msg || msg.type !== 'result') return;
    const job = this.jobs.get(msg.jobId);
    if (!job) return; // déjà traité (timeout, pool fermé)
    this.jobs.delete(msg.jobId);
    clearTimeout(job.timer);
    if (msg.ok === true) {
      job.resolve(msg.result !== undefined ? msg.result : msg.matches);
    } else {
      job.reject(new Error(msg.error || 'worker error'));
    }
    this.free(wrapper);
  }

  free(wrapper) {
    wrapper.busy = false;
    wrapper.jobId = null;
    wrapper.jobsDone++;

    // Sécurité optionnelle : recycler le worker après `recycleAfter` jobs.
    // NB : le bypass connu (lodash.template → host realm) est NEUTRALISÉ par le
    // validateur + le lodash épuré du scope, PAS par le recyclage. Un recyclage
    // fréquent rechargerait les libs à chaque job (~448ms/éval vs ~21ms) et
    // annulerait le gain du pool. On garde donc un recyclage très rare (valeur
    // haute) comme simple filet de secours, configurable via EVAL_RECYCLE_AFTER.
    if (wrapper.jobsDone >= (this.recycleAfter || 100000)) {
      this.killAndReplace(wrapper);
      return;
    }

    if (this.queue.length > 0) {
      this.dispatch(wrapper, this.queue.shift());
    } else {
      this.idle.push(wrapper);
    }
  }

  killAndReplace(wrapper) {
    if (wrapper.dead) return;
    wrapper.dead = true;
    if (wrapper.jobId != null) {
      const job = this.jobs.get(wrapper.jobId);
      if (job) {
        this.jobs.delete(wrapper.jobId);
        clearTimeout(job.timer);
        job.reject(new Error('worker terminated'));
      }
      wrapper.jobId = null;
    }
    try {
      wrapper.worker.terminate();
    } catch (e) {
      /* déjà mort */
    }
    if (!this.closed) this.spawn();
  }

  onWorkerDead(wrapper, err) {
    if (wrapper.dead) return; // déjà remplacé
    wrapper.dead = true;
    if (wrapper.busy && wrapper.jobId != null) {
      const job = this.jobs.get(wrapper.jobId);
      if (job) {
        this.jobs.delete(wrapper.jobId);
        clearTimeout(job.timer);
        job.reject(err);
      }
      wrapper.jobId = null;
    } else {
      this.idle = this.idle.filter((w) => w !== wrapper);
    }
    if (!this.closed) this.spawn();
  }

  close() {
    this.closed = true;
    for (const w of this.idle) {
      try {
        w.worker.terminate();
      } catch (e) {
        /* déjà mort */
      }
    }
    this.idle = [];
    for (const job of this.queue) {
      clearTimeout(job.timer);
      job.reject(new Error('pool closed'));
    }
    this.queue = [];
    for (const [, job] of this.jobs) {
      clearTimeout(job.timer);
      job.reject(new Error('pool closed'));
    }
    this.jobs.clear();
  }
}

module.exports = { WorkerPool };