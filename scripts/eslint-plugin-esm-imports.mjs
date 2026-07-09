// TODO: put this in a preconstruct or preconst ESLint plugin
import fs from 'node:fs'
import path from 'node:path'

const EXTENSIONS = ['.ts', '.tsx', '.mts', '.cts', '.js']
const EXTENSION_PATTERN = /\.[^./]+$/u
const TYPESCRIPT_EXTENSION_PATTERN = /\.(?:[cm]?ts|tsx)$/u

const requireNodeEsmImports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'require relative imports that will work properly in Node.js ESM',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useResolved: "Use '{{resolved}}' for this relative import.",
    },
  },

  create(context) {
    const filename = getFilename(context)
    const sourceCode = context.sourceCode ?? context.getSourceCode()
    const directoryFiles = new Map()

    function checkSource(node) {
      if (!node || typeof node.value !== 'string') return

      const specifier = node.value
      if (!isRelativeSpecifier(specifier)) return

      const resolved = resolveSpecifier(filename, specifier, directoryFiles)
      if (!resolved || resolved === specifier) return

      context.report({
        node,
        messageId: 'useResolved',
        data: { resolved },
        fix(fixer) {
          return fixer.replaceTextRange(node.range, quoteLikeSource(sourceCode, node, resolved))
        },
      })
    }

    return {
      ImportDeclaration(node) {
        checkSource(node.source)
      },
      ExportAllDeclaration(node) {
        checkSource(node.source)
      },
      ExportNamedDeclaration(node) {
        checkSource(node.source)
      },
      ImportExpression(node) {
        checkSource(node.source)
      },
    }
  },
}

function getFilename(context) {
  return context.filename ?? context.getFilename()
}

function isRelativeSpecifier(specifier) {
  return (
    specifier === '.' ||
    specifier === '..' ||
    specifier.startsWith('./') ||
    specifier.startsWith('../')
  )
}

function resolveSpecifier(importer, specifier, directoryFiles) {
  const importerDir = path.dirname(importer)
  const absoluteBase = path.resolve(importerDir, specifier)
  if (TYPESCRIPT_EXTENSION_PATTERN.test(absoluteBase)) return specifier
  if (isFile(absoluteBase, directoryFiles)) return specifier

  const withoutJsExtension = stripJsExtension(absoluteBase)
  const candidates = candidatePaths(withoutJsExtension)

  for (const candidate of candidates) {
    if (!isFile(candidate, directoryFiles)) continue
    const relative = toSpecifier(path.relative(importerDir, candidate))
    return relative
  }

  return undefined
}

function stripJsExtension(filePath) {
  return filePath.endsWith('.js') || filePath.endsWith('.jsx')
    ? filePath.slice(0, -path.extname(filePath).length)
    : filePath
}

function candidatePaths(base) {
  if (hasExtension(base)) return [base]

  const direct = EXTENSIONS.map(extension => base + extension)
  const index = EXTENSIONS.map(extension => path.join(base, 'index' + extension))
  return [...direct, ...index]
}

function hasExtension(filePath) {
  return EXTENSION_PATTERN.test(path.basename(filePath))
}

function isFile(filePath, directoryFiles) {
  const directory = path.dirname(filePath)
  let files = directoryFiles.get(directory)

  if (!files) {
    try {
      files = new Set(
        fs
          .readdirSync(directory, { withFileTypes: true })
          .filter(entry => entry.isFile())
          .map(entry => entry.name)
      )
    } catch {
      files = new Set()
    }
    directoryFiles.set(directory, files)
  }

  return files.has(path.basename(filePath))
}

function toSpecifier(relativePath) {
  const normalized = relativePath.split(path.sep).join('/')
  return normalized.startsWith('.') ? normalized : './' + normalized
}

function quoteLikeSource(sourceCode, node, value) {
  const raw = sourceCode.getText(node)
  const quote = raw.startsWith("'") ? "'" : '"'
  return quote + value + quote
}

export default {
  meta: {
    name: 'eslint-plugin-esm-imports',
  },
  rules: {
    'node-esm-imports': requireNodeEsmImports,
  },
}
