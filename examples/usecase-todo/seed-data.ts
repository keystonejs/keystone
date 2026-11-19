import { getContext } from '@keystone-6/core/context'
import { persons, tasks } from '../example-data'
import config from './keystone'
import * as PrismaModule from './generated/prisma/client'

type PersonProps = {
  name: string
}

type TaskProps = {
  label: string
  isComplete: boolean
  finishBy: string
  assignedTo: string
}

export async function main() {
  const context = getContext(config, PrismaModule)

  console.log(`🌱 Inserting seed data`)
  const createPerson = async (personData: PersonProps) => {
    const person = await context.db.Person.findOne({
      where: { name: personData.name },
      select: { id: true },
    })

    if (!person) {
      await context.db.Person.createOne({
        data: personData,
      })
    }
  }

  const createTask = async (taskData: TaskProps) => {
    const persons = await context.db.Person.findMany({
      where: { name: { equals: taskData.assignedTo } },
      select: { id: true },
    })

    await context.db.Task.createOne({
      data: { ...taskData, assignedTo: { connect: { id: persons[0].id } } },
    })
  }

  for (const person of persons) {
    console.log(`👩 Adding person: ${person.name}`)
    await createPerson(person)
  }
  for (const task of tasks) {
    console.log(`🔘 Adding task: ${task.label}`)
    await createTask(task)
  }

  console.log(`✅ Seed data inserted`)
  console.log(`👋 Please start the process with \`npm run dev\``)
}

main()
