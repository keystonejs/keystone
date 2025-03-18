import { KeystoneLayout } from '@keystone-6/core/admin-ui/embed'
import keystoneConfig from '../../keystone'
import * as Prisma from 'myprisma'
import { ReactNode } from 'react'

export default function Layout(props: { children: ReactNode }) {
  return (
    <KeystoneLayout config={keystoneConfig} Prisma={Prisma}>
      {props.children}
    </KeystoneLayout>
  )
}
