import Path from 'path'

import type { AdminMetaSource } from '../../lib/create-admin-meta'
import type { KeystoneConfig } from '../../types'

export function layoutTemplate(config: KeystoneConfig, adminMeta: AdminMetaSource, dir: string) {
  const prismaPath =
    config.db.prismaClientPath === '@prisma/client'
      ? '@prisma/client'
      : Path.relative(
          Path.join(process.cwd(), '.keystone/admin', dir),
          Path.join(process.cwd(), config.db.prismaClientPath)
        )
          .split(Path.sep)
          .join('/')
  const segments = dir.split('/').length
  // -- TEMPLATE START
  return `import { getLayout } from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/admin-ui/pages/Layout'
import config from '${'../'.repeat(segments + 2)}keystone'
import * as Prisma from ${JSON.stringify(prismaPath)}

export default getLayout(config, Prisma)
`
}
