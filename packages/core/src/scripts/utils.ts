export class ExitError extends Error {
  code: number;
  constructor(code: number) {
    super(`The process should exit with ${code}`);
    this.code = code;
  }
}
