import {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} from 'node:worker_threads';
import { allGenerators } from './generators/index.mjs';

// If inside a worker thread, perform the generator logic here
if (!isMainThread) {
  const { name, dependencyOutput, extra } = workerData;
  const generator = allGenerators[name];

  // Execute the generator and send the result or error back to the parent thread
  generator
    .generate(dependencyOutput, extra)
    .then(result => parentPort.postMessage(result))
    .catch(error => parentPort.postMessage({ error }));
}

/**
 * WorkerPool class to manage a pool of worker threads
 */
export class WorkerPool {
  /** @private {number} - Number of active threads */
  activeThreads = 0;
  /** @private {Array<Function>} - Queue of pending tasks */
  queue = [];

  /**
   * Runs a generator within a worker thread.
   * @param {string} name - The name of the generator to execute
   * @param {any} dependencyOutput - Input data for the generator
   * @param {number} threads - Maximum number of threads to run concurrently
   * @param {Object} extra - Additional options for the generator
   * @returns {Promise<any>} Resolves with the generator result, or rejects with an error
   */
  run(name, dependencyOutput, threads, extra) {
    return new Promise((resolve, reject) => {
      /**
       * Function to run the generator in a worker thread
       */
      const run = () => {
        this.activeThreads++;

        // Create and start the worker thread
        const worker = new Worker(new URL(import.meta.url), {
          workerData: { name, dependencyOutput, extra },
        });

        // Handle worker thread messages (result or error)
        worker.on('message', result => {
          this.activeThreads--;
          this.processQueue(threads);

          if (result?.error) {
            reject(result.error);
          } else {
            resolve(result);
          }
        });

        // Handle worker thread errors
        worker.on('error', err => {
          this.activeThreads--;
          this.processQueue(threads);
          reject(err);
        });
      };

      // If the active thread count exceeds the limit, add the task to the queue
      if (this.activeThreads >= threads) {
        this.queue.push(run);
      } else {
        run();
      }
    });
  }

  /**
   * Process the worker thread queue to start the next available task
   * when there is room for more threads.
   * @param {number} threads - Maximum number of threads to run concurrently
   * @private
   */
  processQueue(threads) {
    if (this.queue.length > 0 && this.activeThreads < threads) {
      const next = this.queue.shift();
      if (next) next();
    }
  }
}
