// @flow
import build from "../";
import fixturez from "fixturez";
import path from "path";
import {
  snapshotDistFiles,
  snapshotDirectory,
  install
} from "../../../test-utils";

const f = fixturez(__dirname);

jest.setTimeout(10000);

let unsafeRequire = require;

jest.mock("../../prompt");

test("source entrypoint option", async () => {
  let tmpPath = f.copy("source-entrypoint-option");

  await build(tmpPath);

  await snapshotDistFiles(tmpPath);
});

test("source entrypoint option flow", async () => {
  let tmpPath = f.copy("source-entrypoint-option-flow");

  await install(tmpPath);

  await build(tmpPath);

  await snapshotDistFiles(tmpPath);
});

test("multiple entrypoints", async () => {
  let tmpPath = f.copy("multiple-entrypoints");

  await build(tmpPath);

  await snapshotDirectory(tmpPath);
});

test("two entrypoints, one module, one not", async () => {
  let tmpPath = f.copy("two-entrypoints-one-module-one-not");
  try {
    await build(tmpPath);
  } catch (err) {
    expect(err).toMatchInlineSnapshot(
      `[Error: two-entrypoints-one-module-one-not/multiply has a module build but two-entrypoints-one-module-one-not does not have a module build. Entrypoints in a package must either all have a particular build type or all not have a particular build type.]`
    );
    return;
  }
  expect(true).toBe(false);
});

test("two entrypoints with a common dependency", async () => {
  let tmpPath = f.copy("common-dependency-two-entrypoints");

  await build(tmpPath);

  await snapshotDirectory(tmpPath);
});

test("two entrypoints where one requires the other entrypoint", async () => {
  let tmpPath = f.copy("importing-another-entrypoint");

  await build(tmpPath);

  await snapshotDirectory(tmpPath);

  let { identity } = unsafeRequire(tmpPath);
  expect(identity(20)).toBe(20);

  let { multiply } = unsafeRequire(path.join(tmpPath, "multiply"));

  expect(multiply(2, 3)).toBe(6);
});
