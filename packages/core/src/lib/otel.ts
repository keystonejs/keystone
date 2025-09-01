import { SpanStatusCode, trace, type AttributeValue, type Span } from '@opentelemetry/api'

const tracer = trace.getTracer('keystone')

export function withSpanSync<T>(
  name: string,
  fn: (span: Span) => T,
  attrs: Record<string, AttributeValue> = {}
): T {
  return tracer.startActiveSpan(name, { attributes: attrs }, span => {
    try {
      const result = fn(span)
      span.setStatus({ code: SpanStatusCode.OK })
      return result
    } catch (err) {
      span.recordException(err instanceof Error ? err : { message: String(err) })
      span.setStatus({ code: SpanStatusCode.ERROR })
      throw err
    } finally {
      span.end()
    }
  })
}

export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T> | T,
  attrs?: Record<string, AttributeValue>
): Promise<T> {
  return tracer.startActiveSpan(name, { attributes: attrs }, async span => {
    try {
      const result = await fn(span)
      span.setStatus({ code: SpanStatusCode.OK })
      return result
    } catch (err) {
      span.recordException(err instanceof Error ? err : { message: String(err) })
      span.setStatus({ code: SpanStatusCode.ERROR })
      throw err
    } finally {
      span.end()
    }
  })
}
