import url from 'url'
import path from 'path'
import type express from 'express'
import type next from 'next'
import {
  type KeystoneContext,
  type __ResolvedKeystoneConfig,
} from '../types'
import { pkgDir } from '../pkg-dir'

const adminErrorHTMLFilepath = path.join(pkgDir, 'static', 'admin-error.html')

export function createAdminUIMiddlewareWithNextApp (
  config: __ResolvedKeystoneConfig,
  commonContext: KeystoneContext,
  nextApp: ReturnType<typeof next>
) {
  const handle = nextApp.getRequestHandler()

  const {
    ui: {
      isAccessAllowed,
      pageMiddleware,
      publicPages,
      basePath,
    },
  } = config

  if (basePath.endsWith('/')) throw new TypeError('basePath must not end with a trailing slash')

  return async (req: express.Request, res: express.Response) => {
    const { pathname } = url.parse(req.url)

    if (pathname?.startsWith(`${basePath}/_next`) || pathname?.startsWith(`${basePath}/__next`)) {
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
