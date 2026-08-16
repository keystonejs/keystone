import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text, image, file } from '@keystone-6/core/fields'
import fs from 'node:fs/promises'
import path from 'node:path'

import type { Lists } from './generated/keystone/types'

/**
 * Security: Validate that the key doesn't contain path traversal sequences
 * Prevents attackers from writing files outside the intended directory
 */
function validateStorageKey(key: string, baseDir: string): string {
  // Reject absolute paths
  if (path.isAbsolute(key)) {
    throw new Error('Storage key cannot be an absolute path')
  }

  // Normalize and resolve the full path
  const normalizedKey = path.normalize(key).replace(/^(\.\.(\/|\\|$))+/, '')
  const fullPath = path.resolve(baseDir, normalizedKey)
  const normalizedBase = path.resolve(baseDir)

  // Ensure the resolved path is within the base directory
  if (!fullPath.startsWith(normalizedBase + path.sep) && fullPath !== normalizedBase) {
    throw new Error('Storage key contains invalid path traversal')
  }

  // Additional checks for dangerous patterns
  if (
    key.includes('..') ||
    key.includes('\\..') ||
    key.includes('../') ||
    key.includes('..\\')
  ) {
    throw new Error('Storage key contains path traversal sequence')
  }

  return normalizedKey
}

export const lists = {
  Post: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      content: text(),
      banner: image({
        storage: {
          async put(key, stream) {
            // SECURITY FIX: Validate key before use to prevent path traversal
            const safeKey = validateStorageKey(key, 'public/images')
            await fs.writeFile(`public/images/${safeKey}`, stream)
          },
          async delete(key) {
            // SECURITY FIX: Validate key before use to prevent path traversal
            const safeKey = validateStorageKey(key, 'public/images')
            await fs.unlink(`public/images/${safeKey}`)
          },
          url(key) {
            // SECURITY FIX: Validate key before use to prevent path traversal
            const safeKey = validateStorageKey(key, 'public/images')
            return `http://localhost:3000/images/${safeKey}`
          },
        },
      }),
      attachment: file({
        storage: {
          async put(key, stream) {
            // SECURITY FIX: Validate key before use to prevent path traversal
            const safeKey = validateStorageKey(key, 'public/files')
            await fs.writeFile(`public/files/${safeKey}`, stream)
          },
          async delete(key) {
            // SECURITY FIX: Validate key before use to prevent path traversal
            const safeKey = validateStorageKey(key, 'public/files')
            await fs.unlink(`public/files/${safeKey}`)
          },
          url(key) {
            // SECURITY FIX: Validate key before use to prevent path traversal
            const safeKey = validateStorageKey(key, 'public/files')
            return `http://localhost:3000/files/${safeKey}`
          },
        },
      }),
    },
  }),
} satisfies Lists
