import path from 'path'
import { fileURLToPath } from 'url'

export const pkgDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
