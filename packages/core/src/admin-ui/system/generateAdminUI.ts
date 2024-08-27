import Path from 'node:path'
// import { promisify } from 'node:util'
import fs from 'node:fs/promises'
import fse from 'fs-extra'
import resolve from 'resolve'
import { type GraphQLSchema } from 'graphql'
// import { walk as _walk } from '@nodelib/fs.walk'
import {
  type AdminFileToWrite,
  type __ResolvedKeystoneConfig
} from '../../types'
import { writeAdminFiles } from '../templates'
import { type AdminMetaRootVal } from '../../lib/create-admin-meta'

// const walk = promisify(_walk)

function getDoesAdminConfigExist (adminPath: string) {
  try {
    const configPath = Path.join(adminPath, 'config')
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
    if (err.code !== 'ENOENT') {
      throw err
    }
  }
  if (file.mode === 'write' && content !== file.src) {
    await fse.outputFile(outputFilename, file.src)
  }
  return Path.normalize(outputFilename)
}

export async function generateAdminUI (
  config: __ResolvedKeystoneConfig,
  graphQLSchema: GraphQLSchema,
  adminMeta: AdminMetaRootVal,
  projectAdminPath: string,
  hasSrc: boolean,
  isLiveReload: boolean
) {
  // Write out the files configured by the user
  const userFiles = config.ui?.getAdditionalFiles?.map(x => x()) ?? []
  const userFilesToWrite = (await Promise.all(userFiles)).flat()
  const savedFiles = await Promise.all(
    userFilesToWrite.map(file => writeAdminFile(file, projectAdminPath))
  )
  const uniqueFiles = new Set(savedFiles)

  // Write out the built-in admin UI files. Don't overwrite any user-defined pages.
  const configFileExists = getDoesAdminConfigExist(projectAdminPath)
  let adminFiles = writeAdminFiles(config, graphQLSchema, adminMeta, configFileExists, hasSrc)

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
}
