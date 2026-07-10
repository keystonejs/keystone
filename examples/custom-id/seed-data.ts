import { getContext } from '@keystone-6/core/context'
import { persons, tasks } from '../example-data'
import config from './keystone'
import * as PrismaModule from './generated/prisma/client'

export async function main() {
  const context = getContext(config, PrismaModule)

  console.log(`🌱 Inserting seed data`)
  for (const person of persons) {
    if (
      await context.query.Person.findOne({
        where: { name: person.name },
        query: 'id',
      })
    ) {
      console.log(`👩 Found ${person.name}`)
      continue
    }

    console.log(`👩 Adding person: ${person.name}`)
    await context.query.Person.createOne({
      data: person,
      query: 'id',
    })
  }

  for (const task of tasks) {
    console.log(`🔘 Adding task: ${task.label}`)
    const persons = await context.query.Person.findMany({
      where: { name: { equals: task.assignedTo } },
      query: 'id',
    })

    for (const person of persons) {
      await context.query.Task.createOne({
        data: { ...task, assignedTo: { connect: { id: person.id } } },
        query: 'id',
      })
    }
  }

  console.log(`✅ Seed data inserted`)
  console.log(`👋 Please start the process with \`pnpm dev\``)
}

main()
