// @flow
import { readFileSync } from "fs";
import * as fs from "fs-extra";

type Desync<Return> = {
  sync: () => Return,
  async: () => Promise<Return>
};

function run<Return>(resync: Desync<Return>): Generator<any, Return, any> {
  return (function*() {
    let val = yield resync;
    return val;
  })();
}

export let readFile = (filename: string) =>
  run({
    sync: () => readFileSync(filename, "utf8"),
    async: () => fs.readFile(filename, "utf8")
  });

export function resync<Args: $ReadOnlyArray<mixed>, Return>(
  fn: (...Args) => Generator<any, Return, any>
): (...Args) => Desync<Return> {
  return (...args) => ({
    sync: () => {
      let gen = fn(...args);
      let current = gen.next();
      while (!current.done) {
        current = gen.next(current.value.sync());
      }
      // $FlowFixMe
      return current.value;
    },
    async: async () => {
      let gen = fn(...args);
      let current = gen.next();
      while (!current.done) {
        current = gen.next(await current.value.async());
      }
      // $FlowFixMe
      return current.value;
    }
  });
}
