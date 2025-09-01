import { trace } from '@opentelemetry/api'
import type { Span } from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'

// WARNING: this open-telemetry example is for demonstration purposes only
//   it has not been written for any particular usage

function pinoSpanLogger() {
  return {
    onEnd(span: Span) {
      const scope = span.instrumentationScope.name
      if (
        !(
          scope in
          {
            keystone: true,
            'my-application': true,
          }
        )
      )
        return

      const [seconds, nanoseconds] = span.duration
      const duration = Math.ceil(seconds * 1e3 + nanoseconds / 1e6) // milliseconds
      const { traceId, spanId } = span.spanContext()
      const attrs = Object.keys(span.attributes).length ? span.attributes : undefined
      const time = Date.now()

      console.log(
        JSON.stringify({
          time,
          trace: traceId,
          span: spanId,
          scope,
          name: span.name,
          attrs,
          duration,
        })
      )
    },

    onStart() {},
    async forceFlush() {},
    async shutdown() {},
  }
}

export function init() {
  const provider = new NodeTracerProvider({
    spanProcessors: [pinoSpanLogger()],
  })

  provider.register()
}

export const tracer = trace.getTracer('my-application')
