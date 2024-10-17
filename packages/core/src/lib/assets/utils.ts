import type { Readable } from 'stream'

export async function streamToBuffer (stream: Readable): Promise<Buffer> {
  const chunks = []

  for await (const chunk of stream) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}
