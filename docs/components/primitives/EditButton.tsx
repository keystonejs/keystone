/** @jsxImportSource @emotion/react */

import { Edit } from '../../components/icons/Edit'
import { Button } from './Button'

export function EditButton ({
  pathName,
  isIndexPage,
  editPath,
}: {
  pathName: string
  isIndexPage?: boolean
  editPath?: string
}) {
  let fileUrl = `https://github.com/keystonejs/keystone/edit/main/docs/pages`

  if (editPath) {
    fileUrl += `/${editPath}`
  } else if (isIndexPage) {
    fileUrl += `${pathName}/index.tsx`
  } else {
    fileUrl += `${pathName}.md`
  }

  return (
    <Button
      as="a"
      href={fileUrl}
      look="text"
      size="xsmall"
      target="_blank"
      rel="noreferrer"
      css={{
        textTransform: 'uppercase',
      }}
    >
      <Edit
        css={{
          color: 'var(--muted)',
          marginRight: '0.35rem',
        }}
      />
      Edit on GitHub
    </Button>
  )
}
