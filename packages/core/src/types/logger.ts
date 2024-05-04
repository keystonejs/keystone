// The tricky part is to abide by some standart log methods, and allow to override
// NestJS https://github.com/nestjs/nest/blob/1db72fd96a965eed50e398040e8994d28f72454d/packages/common/services/logger.service.ts#L14-L28
// Winston https://github.com/winstonjs/winston#logging-levels
// Console https://developer.mozilla.org/en-US/docs/Web/API/console
// Pino https://github.com/pinojs/pino/blob/main/docs/api.md#logger
// Log4j https://en.wikipedia.org/wiki/Log4j#Features
export interface Logger {
  /**
   * Write a 'log' level log.
   */
  log(message: unknown, ...optionalParams: unknown[]): unknown;

  /**
   * Write an 'error' level log.
   */
  error(message: unknown, ...optionalParams: unknown[]): unknown;

  /**
   * Write a 'warn' level log.
   */
  warn(message: unknown, ...optionalParams: unknown[]): unknown;
}
