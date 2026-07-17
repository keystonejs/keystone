import _createNextServer from 'next'
import type { NextBundlerOptions, NextServer, NextServerOptions } from 'next/dist/server/next.js'

// 'next' types are wrong under moduleResolution: nodenext
// the .d.ts files declare a ESM -> CJS style file with the default export being available under `.default`
// in CJS but the actual runtime code does a `module.exports = createServer`
export const createNextServer = (
  'default' in _createNextServer ? _createNextServer.default : _createNextServer
) as (options: NextServerOptions & NextBundlerOptions) => NextServer

export type { NextServer }
