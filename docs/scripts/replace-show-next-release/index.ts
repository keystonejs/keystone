import fs from 'fs/promises'
import { type ValidateError } from '@markdoc/markdoc'
import { loadAllMarkdoc } from '../../markdoc/load-all'
import { printValidationError } from '../../markdoc'
import { removeNextReleaseConditions } from './markdoc'

async function updateMarkdocFiles () {
  const docs = await loadAllMarkdoc()
  console.log(`updating ${docs.length} Markdoc files`)

  const allErrors: ValidateError[] = []
  await Promise.all(
    docs.map(({ file, contents: initialContents }) => {
      const { contents, errors } = removeNextReleaseConditions(initialContents)
      allErrors.push(...errors)
      return fs.writeFile(file, contents, 'utf8')
    })
  )
  if (allErrors.length) {
    console.error('Errors occurred when validating docs after writing')
    console.error("The errors likely say `Undefined variable: 'nextRelease'`")
    console.error(
      'That error means that the nextRelease variable is still used after the transform that should remove it'
    )
    for (const error of allErrors) {
      console.error(printValidationError(error))
    }
    process.exitCode = 1
  }
}

(async () => {
  await updateMarkdocFiles()
})()
