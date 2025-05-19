export class FieldDataError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FieldDataError'
  }
}
