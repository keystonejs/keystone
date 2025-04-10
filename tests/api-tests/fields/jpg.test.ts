import { createReadStream, readdirSync } from 'node:fs'
import path from 'node:path'
import { extractJPGDimensions } from '../../../packages/core/src/fields/types/image/jpg'
import { readFile } from 'node:fs/promises'
import { JPG } from 'image-size/types/jpg'

const testFiles = path.resolve(__dirname, 'test-files')
for (const file of readdirSync(testFiles)) {
  test(`parseJPGMetadata ${file}`, async () => {
    const stream = createReadStream(`${testFiles}/${file}`)
    let expected
    try {
      expected = JPG.calculate(await readFile(`${testFiles}/${file}`))
    } catch {}
    expect(await extractJPGDimensions(stream)).toEqual(expected)
  })
}
