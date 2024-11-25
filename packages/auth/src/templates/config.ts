export default function ({
  labelField
}: {
  labelField: string
}) {
  return `import { type AdminConfig } from '@keystone-6/core/types'
import makeNavigation from '@keystone-6/auth/components/Navigation'

export const components: AdminConfig['components'] = {
  Navigation: makeNavigation({ labelField: '${labelField}' }),
}
`
}
