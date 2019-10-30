// flow-typed signature: c0a247c13aec79d77053b130b7a57ff6
// flow-typed version: fixturez_v1.1.0/flow_v0.110.0

/**
 * Once filled out, we encourage you to share your work with the
 * community by sending a pull request to:
 * https://github.com/flowtype/flow-typed
 */

declare module 'fixturez' {
  declare type Opts = {
    glob?: string | Array<string>,
    root?: string,
    cleanup?: boolean,
  };

  declare type fixturez = (
    cwd: string,
    opts?: Opts
  ) => {
    find: (name: string) => string,
    temp: () => string,
    copy: (name: string) => string,
    cleanup: () => void,
  };

  declare module.exports: fixturez;
}
