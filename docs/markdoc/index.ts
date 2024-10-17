import fs from 'fs/promises'
import { isMatch } from 'date-fns'
import Markdoc, { type Config, type Tag, type ValidateError } from '@markdoc/markdoc'
import { load } from 'js-yaml'
import { baseMarkdocConfig } from './config'
import { showNextReleaseWithoutReplacement } from './show-next-release'
import { isTag } from './isTag'

export function printValidationError (error: ValidateError) {
  const location = error.error.location || error.location
  // the filepath is intentionally duplicated here so that there is one thing you can copy to refer to the error position
  return `${location?.file ?? '(unknown file)'}:${
    // the +1 is because location.start.line is 0-based
    // but tools generally use 1-based line numbers
    location?.start.line !== undefined ? location.start.line + 1 : '(unknown line)'
  }${location?.start.character !== undefined ? `:${location.start.character}` : ''}: ${
    error.error.message
  }`
}

class MarkdocValidationFailure extends Error {
  constructor (errors: [ValidateError, ...ValidateError[]], errorReportingFilepath: string) {
    super()
    this.name = 'MarkdocValidationFailure'
    // you see the stacktrace and a bunch of other stuff from Next when seeing the errors here
    // so this separator makes it easier to find the actual problem
    const separator = `⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯`
    this.message = `Errors in ${errorReportingFilepath}:\n${separator}\n${errors
      .map(error => printValidationError(error))
      .join('\n')}\n${separator}`
  }
}

export type DocsContent = {
  content: Tag
  title: string
  description: string
}

export type BlogContent = BlogFrontmatter & {
  content: Tag
}

export async function readBlogContent (filepath: string): Promise<BlogContent> {
  const content = await fs.readFile(filepath, 'utf8')
  const frontmatter = extractBlogFrontmatter(content)
  return { content: transformContent(`docs/${filepath}`, content), ...frontmatter }
}

export async function readDocsContent (filepath: string): Promise<DocsContent> {
  const content = await fs.readFile(filepath, 'utf8')
  const frontmatter = extractDocsFrontmatter(content)
  return { content: transformContent(`docs/${filepath}`, content), ...frontmatter }
}

const markdocConfig: Config = {
  ...baseMarkdocConfig,
  variables: {
    nextRelease: showNextReleaseWithoutReplacement,
  },
}

export function transformContent (errorReportingFilepath: string, content: string): Tag {
  const node = Markdoc.parse(content, errorReportingFilepath)
  const errors = Markdoc.validate(node, markdocConfig)
  if (errors.length >= 1) {
    throw new MarkdocValidationFailure(errors as any, errorReportingFilepath)
  }
  const renderableNode = Markdoc.transform(node, markdocConfig)

  if (!isTag(renderableNode)) throw new TypeError('Expected renderable node')

  // Next is annoying about not plain objects
  return JSON.parse(JSON.stringify(renderableNode)) as Tag
}

const frontMatterPattern = /^---[\s]+([\s\S]*?)[\s]+---/

export function extractDocsFrontmatter (content: string): {
  title: string
  description: string
} {
  const match = frontMatterPattern.exec(content)
  if (!match) {
    throw new Error('Expected document to contain frontmatter with a title and description')
  }
  const frontmatter = match[1]
  let parsed
  try {
    parsed = load(frontmatter)
  } catch (err) {
    throw new Error(`Failed to parse frontmatter as yaml: ${err}`)
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error(
      `Expected frontmatter yaml to be an object but found:\n${JSON.stringify(parsed)}`
    )
  }
  const obj = parsed as Record<string, unknown>
  if (typeof obj.title !== 'string') {
    throw new Error(`Expected frontmatter to contain a title`)
  }
  if (typeof obj.description !== 'string') {
    throw new Error(`Expected frontmatter to contain a description`)
  }

  return {
    title: obj.title,
    description: obj.description,
  }
}

export type BlogFrontmatter = {
  title: string
  description: string
  publishDate: string
  authorName: string
  authorHandle?: string
  metaImageUrl?: string
}

export function extractBlogFrontmatter (content: string): BlogFrontmatter {
  const match = frontMatterPattern.exec(content)
  if (!match) {
    throw new Error(
      'Expected post to contain frontmatter with a title, description and publishDate'
    )
  }
  const frontmatter = match[1]
  let parsed
  try {
    parsed = load(frontmatter)
  } catch (err) {
    throw new Error(`Failed to parse frontmatter as yaml: ${err}`)
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error(
      `Expected frontmatter yaml to be an object but found:\n${JSON.stringify(parsed)}`
    )
  }
  const obj = parsed as Record<string, unknown>
  if (typeof obj.title !== 'string') {
    throw new Error(`Expected frontmatter to contain title`)
  }
  if (typeof obj.description !== 'string') {
    throw new Error(`Expected frontmatter to contain description`)
  }
  if (typeof obj.publishDate !== 'string') {
    throw new Error(`Expected frontmatter to contain publishDate`)
  } else {
    const publishDate = obj.publishDate
    // making sure months are always MM and not M, same with dd and d
    // Eg. 2022-04-01 is correct
    // 2022-4-1 is incorrect
    // why do we do this manually? because date-fns isMatch doesn't validate this
    if (publishDate.split('-').some(s => s.length < 2)) {
      throw new Error(`Frontmatter publishDate format should be yyyy-MM-dd`)
    }
    const isValidDateFormat = isMatch(publishDate, 'yyyy-MM-dd')
    if (!isValidDateFormat) {
      throw new Error(`Frontmatter publishDate format should be yyyy-MM-dd`)
    }
  }
  if (typeof obj.authorName !== 'string') {
    throw new Error(`Expected frontmatter to contain authorName`)
  }

  if (typeof obj.authorHandle !== 'string' && typeof obj.authorHandle !== 'undefined') {
    throw new Error(`Expected frontmatter to contain authorHandle`)
  }

  if (typeof obj.metaImageUrl !== 'string' && typeof obj.metaImageUrl !== 'undefined') {
    throw new Error(`Expected frontmatter to contain metaImageUrl`)
  }

  return {
    title: obj.title,
    description: obj.description,
    publishDate: obj.publishDate,
    authorName: obj.authorName,
    authorHandle: obj.authorHandle,
    metaImageUrl: obj.metaImageUrl,
  }
}
