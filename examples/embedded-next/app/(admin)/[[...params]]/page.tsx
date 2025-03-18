import { KeystonePage } from '@keystone-6/core/admin-ui/embed'
import keystoneConfig from '../../../keystone'

export default function Page({ params }: { params: Promise<{ params: string[] | undefined }> }) {
  return <KeystonePage config={keystoneConfig} params={params} />
}
