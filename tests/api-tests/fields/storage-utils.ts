import type { BaseKeystoneTypeInfo, StorageStrategy } from '@keystone-6/core/types'
import type { Readable } from 'node:stream'
import path from 'node:path'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
// @ts-expect-error
import Upload from 'graphql-upload/Upload.js'
import mime from 'mime'

export async function collectStream(stream: Readable) {
  let chunks = []
  for await (const chunk of stream) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

export function inMemoryStorageStrategy(): {
  storage: StorageStrategy<BaseKeystoneTypeInfo>
  files: Map<string, Uint8Array>
} {
  const files = new Map<string, Uint8Array>()
  return {
    files,
    storage: {
      async put(key, stream, meta) {
        if (files.has(key)) throw new Error(`${key} already exists`)
        files.set(key, await collectStream(stream))
      },
      async delete(key) {
        if (!files.has(key)) throw new Error(`${key} does not exist`)
        files.delete(key)
      },
      url(key) {
        return 'http://localhost:3000/files/' + key
      },
    },
  }
}

type NoopStorageState = { state: 'uploading' | 'done'; bytesSeen: number }

export function noopStorageStrategy(): {
  storage: StorageStrategy<BaseKeystoneTypeInfo>
  files: Map<string, NoopStorageState>
} {
  const files = new Map<string, NoopStorageState>()
  return {
    files,
    storage: {
      async put(key, stream, meta) {
        if (files.has(key)) throw new Error(`${key} already exists`)
        let state: NoopStorageState = { state: 'uploading', bytesSeen: 0 }
        files.set(key, state)
        for await (const chunk of stream) {
          state.bytesSeen += chunk.length
        }
        state.state = 'done'
      },
      async delete(key) {
        if (!files.has(key)) throw new Error(`${key} does not exist`)
        files.delete(key)
      },
      url(key) {
        return 'http://localhost:3000/files/' + key
      },
    },
  }
}

const testFiles = path.resolve(__dirname, 'test-files')

export function prepareTestFile(_filePath: string) {
  const filePath = path.resolve(testFiles, _filePath)
  const upload = new Upload()
  upload.resolve({
    createReadStream: () => fs.createReadStream(filePath),
    filename: path.basename(filePath),
    mimetype: mime.getType(filePath),
    encoding: 'utf-8',
  })
  return { upload }
}

export async function readTestFile(_filePath: string) {
  return await fsp.readFile(path.resolve(testFiles, _filePath))
}
