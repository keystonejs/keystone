import { type Entry, walk as _walk } from '@nodelib/fs.walk'
import fse from 'fs-extra'
import fs from 'node:fs/promises'
import Path from 'node:path'

import type { AdminMetaSource } from '../../lib/admin-meta'
import type { AdminFileToWrite, KeystoneConfig } from '../../types'
import { writeAdminFiles } from '../templates'
import { withSpan } from '../../lib/otel'

export async function writeAdminFile(file: AdminFileToWrite, projectAdminPath: string) {
  const outputFilename = Path.join(projectAdminPath, file.outputPath)
  const overwrite = file.overwrite || !(await fse.exists(outputFilename))

  if (!overwrite) {
    return Path.normalize(outputFilename)
  }

  if (file.mode === 'copy') {
    if (!Path.isAbsolute(file.inputPath)) {
      throw new Error(
        `An inputPath of "${file.inputPath}" was provided to copy but inputPaths must be absolute`
      )
    }
    await fse.ensureDir(Path.dirname(outputFilename))
    // TODO: should we use copyFile or copy?
    await fs.copyFile(file.inputPath, outputFilename)
  }
  let content: undefined | string
  try {
    content = await fs.readFile(outputFilename, 'utf8')
  } catch (err: any) {
    if (err.code !== 'ENOENT') throw err
  }
  if (file.mode === 'write' && content !== file.src) {
    await fse.outputFile(outputFilename, file.src)
  }
  return Path.normalize(outputFilename)
}

export async function generateAdminUI(
  config: KeystoneConfig,
  adminMeta: AdminMetaSource,
  projectAdminPath: string,
  hasSrc: boolean,
  isLiveReload: boolean
) {
  await withSpan('generating admin next application', async () => {
    // when we're not doing a live reload, we want to clear everything out except the .next directory (not the .next directory because it has caches)
    // so that at least every so often, we'll clear out anything that the deleting we do during live reloads doesn't (should just be directories)
    // if (!isLiveReload) {
    //   const dir = await fs.readdir(projectAdminPath).catch(err => {
    //     if (err.code === 'ENOENT') return []
    //     throw err
    //   })

    //   await Promise.all(
    //     dir.map(x => {
    //       if (x === '.next') return
    //       return fs.rm(Path.join(projectAdminPath, x), { recursive: true })
    //     })
    //   )
    // }

    // Write out the files configured by the user
    const userFilesToWrite = await config.ui.getAdditionalFiles()
    const savedFiles = await Promise.all(
      userFilesToWrite.map(file => writeAdminFile(file, projectAdminPath))
    )
    const uniqueFiles = new Set(savedFiles)

    // Write out the built-in admin UI files. Don't overwrite any user-defined pages.
    let adminFiles = writeAdminFiles(config, adminMeta, projectAdminPath, hasSrc)

    adminFiles = adminFiles.filter(
      x => !uniqueFiles.has(Path.normalize(Path.join(projectAdminPath, x.outputPath)))
    )

    await Promise.all(adminFiles.map(file => writeAdminFile(file, projectAdminPath)))

    // Because Next will re-compile things (or at least check things and log a bunch of stuff)
    // if we delete pages and then re-create them, we want to avoid that when live reloading
    // so we only delete things that shouldn't exist anymore
    // this won't clear out empty directories, this is fine since:
    // - they won't create pages in Admin UI which is really what this deleting is about avoiding
    // - we'll remove them when the user restarts the process
    // if (isLiveReload) {
    //   const ignoredDir = Path.resolve(projectAdminPath, '.next')
    //   const ignoredFiles = new Set([
    //     ...adminFiles.map(x => x.outputPath),
    //     ...uniqueFiles,
    //     'next-env.d.ts',
    //     'pages/api/__keystone_api_build.js',
    //   ].map(x => Path.resolve(projectAdminPath, x)))

    //   const entries = await walk(projectAdminPath, {
    //     deepFilter: entry => entry.path !== ignoredDir,
    //     entryFilter: entry => entry.dirent.isFile() && !ignoredFiles.has(entry.path),
    //   })

    //   await Promise.all(entries.map(entry => fs.rm(entry.path, { recursive: true })))
    // }
  })
}
