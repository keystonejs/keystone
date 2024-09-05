import { type BuildOptions } from 'esbuild'

export default function (defaults: BuildOptions) {
  return {
    ...defaults,
    logLevel: 'verbose'
  }
}
