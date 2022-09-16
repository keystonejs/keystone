import fs from 'fs/promises';
import globby from 'globby';
import Markdoc from '@markdoc/markdoc';
import { getIdForHeading, markdocConfig as baseMarkdocConfig, Pages } from './markdoc/config';
import { printValidationError } from './markdoc';

(async () => {
  const files = await globby('pages/docs/**/*.md');
  const parsedFiles = await Promise.all(
    files.map(async file => {
      const contents = await fs.readFile(file, 'utf8');
      const root = Markdoc.parse(contents, file);
      const ids = new Set<string>();
      for (const node of root.walk()) {
        if (node.type === 'heading') {
          const id = getIdForHeading(node);
          ids.add(id);
        }
      }
      return { root, ids, path: file.replace(/\.md$/, '') };
    })
  );
  const pages: Pages = new Map(
    parsedFiles.map(({ path, ids }) => [path.replace(/^pages/, '').replace(/\.md$/, ''), { ids }])
  );
  // for the things that aren't Markdoc that are linked from Markdoc
  pages.set('/updates/new-graphql-api', { ids: new Set() });
  pages.set('/docs/guides/document-field-demo', { ids: new Set() });
  pages.set('/releases/2021-10-05', { ids: new Set() });
  pages.set('/docs/examples', { ids: new Set() });
  pages.set('/docs/guides/overview', { ids: new Set() });
  pages.set('/docs/config/overview', { ids: new Set() });
  const markdocConfig = { ...baseMarkdocConfig, pages };
  const errors = parsedFiles.flatMap(({ root }) => Markdoc.validate(root, markdocConfig));
  if (errors.length) {
    for (const error of errors) {
      console.error(printValidationError(error));
    }
    process.exitCode = 1;
  }
})().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
