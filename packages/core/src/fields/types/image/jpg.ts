import type { Readable } from 'node:stream'

export async function extractJPGDimensions(
  stream: Readable
): Promise<{ width: number; height: number } | undefined> {
  stream.pause()
  const generator = jpegGen()
  let next = generator.next()
  let excessBuffer = Buffer.from([])
  outer: while (!next.done) {
    const bytesToRead = next.value

    while (excessBuffer.length < bytesToRead) {
      const chunks = await readChunk(stream)
      if (!chunks.length) {
        next = { done: true, value: undefined }
        break outer
      }
      excessBuffer = Buffer.concat([excessBuffer, ...chunks])
    }

    const requestedBytes = new Uint8Array(excessBuffer.subarray(0, bytesToRead))
    excessBuffer = excessBuffer.subarray(bytesToRead)
    next = generator.next(requestedBytes)
  }
  stream.destroy()
  return next.value
}

function readChunk(stream: Readable): Promise<Buffer[]> {
  return new Promise(resolve => {
    const chunk = stream.read()
    if (chunk !== null) {
      resolve(chunk)
      return
    }

    const onReadable = () => {
      cleanup()
      let chunks: Buffer[] = []
      let chunk
      while ((chunk = stream.read()) !== null) {
        chunks.push(chunk)
      }
      resolve(chunks)
    }

    const onEnd = () => {
      cleanup()
      resolve([])
    }

    const onError = () => {
      cleanup()
      resolve([])
    }

    const cleanup = () => {
      stream.removeListener('readable', onReadable)
      stream.removeListener('end', onEnd)
      stream.removeListener('error', onError)
    }

    stream.on('readable', onReadable)
    stream.on('end', onEnd)
    stream.on('error', onError)
  })
}
function readUInt16(input: Uint8Array, offset = 0) {
  return new DataView(input.buffer, input.byteOffset + offset).getUint16(0, false)
}

function* jpegGen(): Generator<number, { width: number; height: number } | undefined, Uint8Array> {
  yield 4
  while (true) {
    const i = readUInt16(yield 2)
    yield i - 2
    if ((yield 1)[0] !== 0xff) {
      continue
    }
    const next = (yield 1)[0]
    if (next > 191 && next < 195) {
      yield 3
      return {
        height: readUInt16(yield 2),
        width: readUInt16(yield 2),
      }
    }
  }
}
