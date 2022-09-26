import fs from 'fs/promises';
import globby from 'globby';
import Markdoc from '@markdoc/markdoc';

export async function loadAllMarkdoc() {
  const files = await globby('pages/docs/**/*.md');
  return await Promise.all(
    files.map(async file => {
      const contents = await fs.readFile(file, 'utf8');
      const root = Markdoc.parse(contents, file);
      return { file, root };
    })
  );
}
