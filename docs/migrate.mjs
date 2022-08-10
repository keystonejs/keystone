import fs from 'fs/promises';
import Markdoc from '@markdoc/markdoc';
import globby from 'globby';

const files = await globby('pages/docs/**/*.mdx');

const results = await Promise.allSettled(
  files.map(async file => {
    const fileContents = await fs.readFile(file, 'utf8');

    const hintSymbolToKind = {
      '!': 'tip',
      '?': 'warn',
      x: 'error',
    };
    let description;
    let title;
    let newContents = fileContents
      .replace(/^(import\s+{[\w\s,]+}\s+from '[^'\\]+';?\n)+\n/, '')
      .replace(/^#\s+(.+)\n/m, (_, written) => {
        title = written;
        return '';
      })
      .replace(
        /<Emoji\s+symbol="([^"]+)"\s*alt="([^"]+)"\s*\/>/g,
        '{% emoji symbol="$1" alt="$2" /%}'
      )
      .replace(
        /^([!?x])>\s*([^]+?)\n\n/gm,
        (_, symbol, content) =>
          `{% hint kind="${hintSymbolToKind[symbol]}" %}\n${content
            .replaceAll('<br/><br/>', '\n\n')
            .replaceAll('<br/>', '  \n')}\n{% /hint %}\n\n`
      )
      .replace(
        /<RelatedContent>(.*?)<\/RelatedContent>/gs,
        (_, inner) =>
          `{% related-content %}${inner
            .split('\n')
            .map(x => x.trim())
            .join('\n')}{% /related-content %}`
      )
      .replace(/\n\n?<\/RelatedContent>/g, '\n{% /related-content %}')
      .replaceAll('<InlineCode>', '`')
      .replaceAll('</InlineCode>', '`')
      .replace(
        /<Well(.*?)\s*(?:rel="noopener noreferrer")?\s*>(.*?)<\/Well>/gs,
        (_, attributes, content) =>
          `{% well ${attributes} %}${content
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')}{% /well %}`
      )
      .replaceAll('<details>', '{% details %}')
      .replaceAll('</details>', '{% /details %}')
      .replaceAll('<summary>', '{% summary %}')
      .replaceAll('</summary>', '{% /summary %}')
      .replaceAll('<sup>', '{% sup %}')
      .replaceAll('</sup>', '{% /sup %}')
      .replace(/{' '}/g, ' ')
      .replace('<ComingSoon/>', '{% coming-soon /%}')
      .replace(
        /\nexport default \({[^}]+}\) =>\s*\(?\s*<Markdown\s+description="([^"\\]+)"[^>]*>\s*{children}\s*<\/Markdown>\s*\)?;?\n/,
        (_, written) => {
          description = written;
          return '';
        }
      )
      .replace('\n# Verbose Changelog', '\n## Verbose Changelog');
    if (!title) {
      throw new Error(`no title found in ${file}`);
    }
    if (!description) {
      throw new Error(`no description found in ${file}`);
    }
    const newFilename = file.replace(/x$/, '');
    newContents = `---
title: ${JSON.stringify(title)}
description: ${JSON.stringify(description)}
---
${newContents}`;

    await fs.writeFile(newFilename, newContents);

    const parsed = Markdoc.parse(newContents, newFilename);
    function walk(parent) {
      for (const node of parent.children) {
        if (
          node.type === 'text' &&
          /<\s*\w|\w\s*>|export\s*(?:default|\{)/.test(node.attributes.content)
        ) {
          throw new Error(`bad thing at ${newFilename}:${node.location.start.line + 1}`);
        }
        if (node.type === 'fence') {
          continue;
        }
        walk(node);
      }
    }
    walk(parsed);
    await fs.unlink(file);
  })
);

const errors = results.filter(x => x.status === 'rejected').map(x => x.reason);

if (errors.length) {
  throw new Error(errors.join('\n'));
}
