/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Button } from './Button';
import { Edit } from '../../components/icons/Edit';
import { useMediaQuery } from '../../lib/media';

export function EditButton({
  pathName,
  isIndexPage,
  editPath,
}: {
  pathName: string;
  isIndexPage?: boolean;
  editPath?: string;
}) {
  const mq = useMediaQuery();

  let fileUrl = `https://github.com/keystonejs/keystone/edit/website_live/docs/pages/`;

  if (editPath) {
    fileUrl += editPath;
  } else if (isIndexPage) {
    fileUrl += `${pathName}/index.tsx`;
  } else {
    fileUrl += `${pathName}.mdx`;
  }

  return (
    <Button
      as="a"
      href={fileUrl}
      look="text"
      size="xsmall"
      target="_blank"
      rel="noopener noreferrer"
      css={{
        textTransform: 'uppercase',
      }}
    >
      <Edit
        css={mq({
          color: 'var(--muted)',
          marginRight: '0.35rem',
        })}
      />
      Edit on GitHub
    </Button>
  );
}
