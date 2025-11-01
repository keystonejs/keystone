import path from 'node:path'

import type express from 'express'
import type next from 'next'
import { pkgDir } from '../pkg-dir'
import type { KeystoneConfig, KeystoneContext } from '../types'

const adminErrorHTMLFilepath = path.join(pkgDir, 'static', 'admin-error.html')

export function createAdminUIMiddlewareWithNextApp(
  config: KeystoneConfig,
  commonContext: KeystoneContext,
  nextApp: ReturnType<typeof next>
) {
  const handle = nextApp.getRequestHandler()

  const {
    ui: { isAccessAllowed, pageMiddleware, publicPages, basePath },
  } = config

  if (basePath.endsWith('/')) throw new TypeError('basePath must not end with a trailing slash')

  return async (req: express.Request, res: express.Response) => {
    const { pathname } = new URL(req.url, 'http://ks')

    if (pathname?.startsWith(`/_next`) || pathname?.startsWith(`/__next`)) {
      return handle(req, res)
    }

    try {
      // do nothing if this is a public page
      const isPublicPage = publicPages.includes(pathname!)
      const context = await commonContext.withRequest(req, res)
      const wasAccessAllowed = isPublicPage ? true : await isAccessAllowed(context)
      const shouldRedirect = await pageMiddleware?.({
        context,
        wasAccessAllowed,
        basePath,
      })

      if (shouldRedirect) {
        res.header('Cache-Control', 'no-cache, max-age=0')
        res.header('Location', shouldRedirect.to)
        res.status(302)
        res.send()
        return
      }

      if (!wasAccessAllowed) return nextApp.render(req, res, '/no-access')

      handle(req, res)
    } catch (e) {
      console.error('An error occurred handling a request for the Admin UI:', e)
      res.status(500)
      res.format({
        'text/html': function () {
          res.sendFile(adminErrorHTMLFilepath)
        },
        'application/json': function () {
          res.send({ error: true })
        },
        default: function () {
          res.send('An error occurred handling a request for the Admin UI.')
        },
      })
    }
  }
}
