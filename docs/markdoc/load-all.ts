import fs from 'fs/promises'

export async function loadAllMarkdoc() {
  const { globby } = await import('globby')
  const paths = await globby(['pages/docs/**/*.md', 'pages/blog/**/*.md'])
  return await Promise.all(
    paths.map(async file => {
      const contents = await fs.readFile(file, 'utf8')
      return { file, contents }
    })
  )
}
