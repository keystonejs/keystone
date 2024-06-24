export class ExitError extends Error {
  code: number
  constructor (code: number) {
    super(`The process exited with Error ${code}`)
    this.code = code
  }
}
