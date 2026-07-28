import { glob, readFile } from 'node:fs/promises'

export async function loadAllMarkdoc() {
  const paths = glob(['pages/docs/**/*.md', 'pages/blog/**/*.md'])
  return await Promise.all(
    (await Array.fromAsync(paths)).map(async file => {
      const contents = await readFile(file, 'utf8')
      return { file, contents }
    })
  )
}
