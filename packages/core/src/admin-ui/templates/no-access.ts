import type { KeystoneConfig } from '../../types'

export const noAccessTemplate = (session: KeystoneConfig['session']) =>
  `'use client'
import { getNoAccessPage } from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/admin-ui/pages/NoAccessPage'

export default getNoAccessPage({ sessionsEnabled: ${!!session} })
`
