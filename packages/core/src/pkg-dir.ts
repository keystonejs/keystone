import path from 'path'
import { createRequire } from 'node:module'

export const pkgDir = path.dirname(
  createRequire(__dirname).resolve('@keystone-6/core/package.json')
)
