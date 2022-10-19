import fs from 'fs/promises';
import globby from 'globby';

export async function loadAllMarkdoc() {
  const files = await globby(['pages/docs/**/*.md', 'pages/blog/**/*.md']);
  return await Promise.all(
    files.map(async file => {
      const contents = await fs.readFile(file, 'utf8');
      return { file, contents };
    })
  );
}
