'use client'
/* eslint-disable */
import { getInitPage } from '@keystone-6/auth/pages/InitPage'

const fieldPaths = ["name","password"]

export default getInitPage({"listKey":"User","fieldPaths":["name","password"],"enableWelcome":true})
