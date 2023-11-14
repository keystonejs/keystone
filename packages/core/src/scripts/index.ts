import { cli } from './cli'
import { ExitError } from './utils'

async function main () {
  const argv = process.argv.slice(2)

  await cli(process.cwd(), argv)

  // WARNING: see https://github.com/keystonejs/keystone/pull/8788
  if (argv[0] === 'build') {
    process.exit(0)
  }
}

main().catch((err: any) => {
  if (err instanceof ExitError) return process.exit(err.code)

  console.error(err)
  process.exit(1)
})
