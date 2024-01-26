import type { Readable, Writable } from 'stream'
import type { ImageExtension, FileMetadata } from '../../types'

export type ImageAdapter = {
  download(filename: string, stream: Writable, headers: (key: string, value: string) => void): void
  upload(buffer: Buffer, id: string, extension: string): Promise<void>
  delete(id: string, extension: ImageExtension): Promise<void>
  url(id: string, extension: ImageExtension): Promise<string>
}

export type FileAdapter = {
  download(filename: string, stream: Writable, headers: (key: string, value: string) => void): void
  upload(stream: Readable, filename: string): Promise<FileMetadata>
  delete(id: string): Promise<void>
  url(filename: string): Promise<string>
}
