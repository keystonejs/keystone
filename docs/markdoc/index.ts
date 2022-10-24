// @markdoc/markdoc's declaration files depend on these global types
import type {} from '@markdoc/markdoc/global';
import fs from 'fs/promises';
import Markdoc, { Config, Tag, ValidateError } from '@markdoc/markdoc';
import { isNonEmptyArray } from 'emery/guards';
import { assert } from 'emery/assertions';
import { load } from 'js-yaml';
import { baseMarkdocConfig } from './config';
import { showNextReleaseWithoutReplacement } from './show-next-release';

export function printValidationError(error: ValidateError) {
  const location = error.error.location || error.location;
  // the filepath is intentionally duplicated here so that there is one thing you can copy to refer to the error position
  return `${location?.file ?? '(unknown file)'}:${
    // the +1 is because location.start.line is 0-based
    // but tools generally use 1-based line numbers
    location?.start.line !== undefined ? location.start.line + 1 : '(unknown line)'
  }${location?.start.character !== undefined ? `:${location.start.character}` : ''}: ${
    error.error.message
  }`;
}

class MarkdocValidationFailure extends Error {
  constructor(errors: [ValidateError, ...ValidateError[]], errorReportingFilepath: string) {
    super();
    this.name = 'MarkdocValidationFailure';
    // you see the stacktrace and a bunch of other stuff from Next when seeing the errors here
    // so this separator makes it easier to find the actual problem
    const separator = `⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯`;
    this.message = `Errors in ${errorReportingFilepath}:\n${separator}\n${errors
      .map(error => printValidationError(error))
      .join('\n')}\n${separator}`;
  }
}

export type DocsContent = {
  content: Tag;
  title: string;
  description: string;
};

export type BlogContent = BlogFrontmatter & {
  content: Tag;
};

export async function readBlogContent(filepath: string): Promise<BlogContent> {
  let content = await fs.readFile(filepath, 'utf8');
  const frontmatter = extractBlogFrontmatter(content);
  return { content: transformContent(`blog/${filepath}`, content), ...frontmatter };
}

export async function readDocsContent(filepath: string): Promise<DocsContent> {
  let content = await fs.readFile(filepath, 'utf8');
  const frontmatter = extractDocsFrontmatter(content);
  return { content: transformContent(`docs/${filepath}`, content), ...frontmatter };
}

const markdocConfig: Config = {
  ...baseMarkdocConfig,
  variables: {
    nextRelease: showNextReleaseWithoutReplacement,
  },
};

export function transformContent(errorReportingFilepath: string, content: string): Tag {
  const node = Markdoc.parse(content, errorReportingFilepath);
  const errors = Markdoc.validate(node, markdocConfig);
  if (isNonEmptyArray(errors)) {
    throw new MarkdocValidationFailure(errors, errorReportingFilepath);
  }
  const renderableNode = Markdoc.transform(node, markdocConfig);

  assert(renderableNode !== null && typeof renderableNode !== 'string');

  // Next is annoying about not plain objects
  return JSON.parse(JSON.stringify(renderableNode)) as typeof renderableNode;
}

const frontMatterPattern = /^---[\s]+([\s\S]*?)[\s]+---/;

export function extractDocsFrontmatter(content: string): {
  title: string;
  description: string;
} {
  const match = frontMatterPattern.exec(content);
  if (!match) {
    throw new Error('Expected document to contain frontmatter with a title and description');
  }
  const frontmatter = match[1];
  let parsed;
  try {
    parsed = load(frontmatter);
  } catch (err) {
    throw new Error(`Failed to parse frontmatter as yaml: ${err}`);
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error(
      `Expected frontmatter yaml to be an object but found:\n${JSON.stringify(parsed)}`
    );
  }
  let obj = parsed as Record<string, unknown>;
  if (typeof obj.title !== 'string') {
    throw new Error(`Expected frontmatter to contain a title`);
  }
  if (typeof obj.description !== 'string') {
    throw new Error(`Expected frontmatter to contain a description`);
  }

  return {
    title: obj.title,
    description: obj.description,
  };
}

export type BlogFrontmatter = {
  title: string;
  description: string;
  publishDate: string;
  authorName: string;
  authorHandle: string;
};

export function extractBlogFrontmatter(content: string): BlogFrontmatter {
  const match = frontMatterPattern.exec(content);
  if (!match) {
    throw new Error(
      'Expected post to contain frontmatter with a title, description and publishDate'
    );
  }
  const frontmatter = match[1];
  let parsed;
  try {
    parsed = load(frontmatter);
  } catch (err) {
    throw new Error(`Failed to parse frontmatter as yaml: ${err}`);
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error(
      `Expected frontmatter yaml to be an object but found:\n${JSON.stringify(parsed)}`
    );
  }
  let obj = parsed as Record<string, unknown>;
  if (typeof obj.title !== 'string') {
    throw new Error(`Expected frontmatter to contain title`);
  }
  if (typeof obj.description !== 'string') {
    throw new Error(`Expected frontmatter to contain description`);
  }
  if (typeof obj.publishDate !== 'string') {
    throw new Error(`Expected frontmatter to contain publishDate`);
  }
  if (typeof obj.authorName !== 'string') {
    throw new Error(`Expected frontmatter to contain authorName`);
  }

  if (typeof obj.authorHandle !== 'string') {
    throw new Error(`Expected frontmatter to contain authorName`);
  }

  return {
    title: obj.title,
    description: obj.description,
    publishDate: obj.publishDate,
    authorName: obj.authorName,
    authorHandle: obj.authorHandle,
  };
}
