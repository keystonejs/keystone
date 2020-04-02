import Worker from 'jest-worker';

let worker;

export function createWorker() {
  worker = new Worker(require.resolve('./worker'));
}

export function destroyWorker() {
  if (worker !== undefined) {
    worker.end();

    worker = undefined;
  }
}

export function getWorker() {
  if (worker === undefined) {
    throw new Error('worker not defined');
  }
  return worker;
}
