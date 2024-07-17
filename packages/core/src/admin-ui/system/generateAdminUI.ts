import Path from 'node:path'
import { promisify } from 'node:util'
import fs from 'node:fs/promises'
import fse from 'fs-extra'
import resolve from 'resolve'
import { type GraphQLSchema } from 'graphql'
import { type Entry, walk as _walk } from '@nodelib/fs.walk'
import {
  type AdminFileToWrite,
  type __ResolvedKeystoneConfig
} from '../../types'
import { writeAdminFiles } from '../templates'
import { type AdminMetaRootVal } from '../../lib/create-admin-meta'

const walk = promisify(_walk)

function serializePathForImport (path: string) {
  // JSON.stringify is important here because it will escape windows style paths(and any thing else that might potentially be in there)
  return JSON.stringify(
    path
      // Next is unhappy about imports that include .ts/tsx in them because TypeScript is unhappy with them because when doing a TypeScript compilation with tsc, the imports won't be written so they would be wrong there
      .replace(/\.tsx?$/, '')
      .replace(new RegExp(`\\${Path.sep}`, 'g'), '/')
  )
}

function getDoesAdminConfigExist () {
  try {
    const configPath = Path.join(process.cwd(), 'admin', 'config')
    resolve.sync(configPath, { extensions: ['.ts', '.tsx', '.js'], preserveSymlinks: false })
    return true
  } catch (err: any) {
    if (err.code === 'MODULE_NOT_FOUND') {
      return false
    }
    throw err
  }
}

export async function writeAdminFile (file: AdminFileToWrite, projectAdminPath: string) {
  const outputFilename = Path.join(projectAdminPath, file.outputPath)
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
    if (err.code !== 'ENOENT') {
      throw err
    }
  }
  if (file.mode === 'write' && content !== file.src) {
    await fse.outputFile(outputFilename, file.src)
  }
  return Path.normalize(outputFilename)
}

const pageExtensions = new Set(['.js', '.jsx', '.ts', '.tsx'])

export async function generateAdminUI (
  config: __ResolvedKeystoneConfig,
  graphQLSchema: GraphQLSchema,
  adminMeta: AdminMetaRootVal,
  projectAdminPath: string,
  isLiveReload: boolean
) {
  // when we're not doing a live reload, we want to clear everything out except the .next directory (not the .next directory because it has caches)
  // so that at least every so often, we'll clear out anything that the deleting we do during live reloads doesn't (should just be directories)
  if (!isLiveReload) {
    const dir = await fs.readdir(projectAdminPath).catch(err => {
      if (err.code === 'ENOENT') {
        return []
      }
      throw err
    })

    await Promise.all(
      dir.map(x => {
        if (x === '.next') return
        return fs.rm(Path.join(projectAdminPath, x), { recursive: true })
      })
    )
  }

  // Write out the files configured by the user
  const userFiles = config.ui?.getAdditionalFiles?.map(x => x()) ?? []
  const userFilesToWrite = (await Promise.all(userFiles)).flat()
  const savedFiles = await Promise.all(
    userFilesToWrite.map(file => writeAdminFile(file, projectAdminPath))
  )
  const uniqueFiles = new Set(savedFiles)

  // Write out the built-in admin UI files. Don't overwrite any user-defined pages.
  const configFileExists = getDoesAdminConfigExist()

  // Add files to pages/ which point to any files which exist in admin/pages
  const adminConfigDir = Path.join(process.cwd(), 'admin')
  const userPagesDir = Path.join(adminConfigDir, 'pages')

  let userPagesEntries: Entry[] = []
  try {
    userPagesEntries = await walk(userPagesDir, {
      entryFilter: entry => entry.dirent.isFile() && pageExtensions.has(Path.extname(entry.name)),
    })
  } catch (err: any) {
    if (err.code !== 'ENOENT') throw err
  }

  let adminFiles = writeAdminFiles(config, graphQLSchema, adminMeta, configFileExists)
  for (const { path } of userPagesEntries) {
    const outputFilename = Path.relative(adminConfigDir, path)
    const importPath = Path.relative(
      Path.dirname(Path.join(projectAdminPath, outputFilename)),
      path
    )
    const serializedImportPath = serializePathForImport(importPath)
    adminFiles.push({
      mode: 'write',
      outputPath: outputFilename,
      src: `export { default } from ${serializedImportPath}`,
    })
  }

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
  if (isLiveReload) {
    const ignoredDir = Path.resolve(projectAdminPath, '.next')
    const ignoredFiles = new Set([
      ...adminFiles.map(x => x.outputPath),
      ...uniqueFiles,
      'next-env.d.ts',
      'pages/api/__keystone_api_build.js',
    ].map(x => Path.resolve(projectAdminPath, x)))

    const entries = await walk(projectAdminPath, {
      deepFilter: entry => entry.path !== ignoredDir,
      entryFilter: entry => entry.dirent.isFile() && !ignoredFiles.has(entry.path),
    })

    await Promise.all(entries.map(entry => fs.rm(entry.path, { recursive: true })))
  }
}
