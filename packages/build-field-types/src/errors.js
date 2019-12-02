export class FatalError extends Error {
  constructor(message, item) {
    super(message);
    this.item = item;
  }
}

export class ValidationError extends Error {}

export class MissingDependency extends Error {}

export class FixableError extends FatalError {}
