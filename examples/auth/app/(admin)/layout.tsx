'use client'
import { Layout } from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/admin-ui/pages/App'
import { config } from './.admin'


export default function AdminLayout ({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Layout config={config as any}>
      {children}
    </Layout>
  )
}