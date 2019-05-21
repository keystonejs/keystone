// @flow

export class FatalError extends Error {
  item: { +name: string };
  constructor(message: string, item: { +name: string }) {
    super(message);
    this.item = item;
  }
}

export class ValidationError extends Error {}

export class MissingDependency extends Error {}

export class FixableError extends FatalError {}
