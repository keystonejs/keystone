import assert from 'node:assert/strict'
import { test } from 'node:test'

import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { checkbox, relationship, text } from '@keystone-6/core/fields'
import { setupTestSuite } from './utils.ts'

const suite = setupTestSuite({
  config: {
    lists: {
      Project: list({
        access: allowAll,
        fields: {
          name: text(),
          tasks: relationship({ ref: 'Task.project', many: true }),
        },
      }),
      Task: list({
        access: {
          operation: allowAll,
          filter: {
            query: ({ session }) => (session?.team ? { team: { equals: session.team } } : false),
          },
        },
        fields: {
          title: text(),
          team: text(),
          isComplete: checkbox(),
          project: relationship({ ref: 'Project.tasks' }),
        },
      }),
    },
  },
})

test('filters projects whose readable tasks are all complete', async () => {
  const { context } = await suite()
  const design = context.withSession({ team: 'Design' })

  await context.sudo().db.Project.createMany({
    data: [
      {
        name: 'All Tasks Complete',
        tasks: {
          create: [{ title: 'Complete Design Task', team: 'Design', isComplete: true }],
        },
      },
      {
        name: 'Design Task Incomplete',
        tasks: {
          create: [{ title: 'Incomplete Design Task', team: 'Design', isComplete: false }],
        },
      },
      {
        name: 'Design Complete, Legal Incomplete',
        tasks: {
          create: [
            { title: 'Complete Design Task', team: 'Design', isComplete: true },
            { title: 'Incomplete Legal Task', team: 'Legal', isComplete: false },
          ],
        },
      },
      { name: 'No Tasks' },
    ],
  })

  async function expectProjects(
    queries: string[],
    expected: { design: unknown[]; sudo: unknown[] }
  ) {
    for (const query of queries) {
      const designResult = await design.graphql.run({ query })
      assert.deepEqual(
        JSON.parse(JSON.stringify(designResult)),
        { projects: expected.design },
        `Design response for ${query.trim()}`
      )

      const sudoResult = await design.sudo().graphql.run({ query })
      assert.deepEqual(
        JSON.parse(JSON.stringify(sudoResult)),
        { projects: expected.sudo },
        `Sudo response for ${query.trim()}`
      )
    }
  }

  await expectProjects(
    [
      `
        query CreatedProjects {
          projects(orderBy: { name: asc }) {
            name
            tasks(orderBy: { title: asc }) {
              title
              team
              isComplete
            }
          }
        }
      `,
    ],
    {
      design: [
        {
          name: 'All Tasks Complete',
          tasks: [{ title: 'Complete Design Task', team: 'Design', isComplete: true }],
        },
        {
          name: 'Design Complete, Legal Incomplete',
          tasks: [{ title: 'Complete Design Task', team: 'Design', isComplete: true }],
        },
        {
          name: 'Design Task Incomplete',
          tasks: [{ title: 'Incomplete Design Task', team: 'Design', isComplete: false }],
        },
        { name: 'No Tasks', tasks: [] },
      ],
      sudo: [
        {
          name: 'All Tasks Complete',
          tasks: [{ title: 'Complete Design Task', team: 'Design', isComplete: true }],
        },
        {
          name: 'Design Complete, Legal Incomplete',
          tasks: [
            { title: 'Complete Design Task', team: 'Design', isComplete: true },
            { title: 'Incomplete Legal Task', team: 'Legal', isComplete: false },
          ],
        },
        {
          name: 'Design Task Incomplete',
          tasks: [{ title: 'Incomplete Design Task', team: 'Design', isComplete: false }],
        },
        { name: 'No Tasks', tasks: [] },
      ],
    }
  )

  // A project passes every when it has no incomplete readable tasks.
  await expectProjects(
    [
      `
        query ProjectsWithAllTasksComplete {
          projects(
            where: { tasks: { every: { isComplete: { equals: true } } } }
            orderBy: { name: asc }
          ) {
            name
          }
        }
      `,
      `
        query ProjectsWithNoIncompleteTasks {
          projects(
            where: { tasks: { none: { NOT: { isComplete: { equals: true } } } } }
            orderBy: { name: asc }
          ) {
            name
          }
        }
      `,
      `
        query ProjectsWithAllTasksCompleteUsingSome {
          projects(
            where: { NOT: { tasks: { some: { isComplete: { equals: false } } } } }
            orderBy: { name: asc }
          ) {
            name
          }
        }
      `,
    ],
    {
      design: [
        { name: 'All Tasks Complete' },
        { name: 'Design Complete, Legal Incomplete' },
        { name: 'No Tasks' },
      ],
      sudo: [{ name: 'All Tasks Complete' }, { name: 'No Tasks' }],
    }
  )

  // A project fails every when it has at least one incomplete readable task.
  await expectProjects(
    [
      `
        query ProjectsWithSomeIncompleteTasks {
          projects(
            where: { tasks: { some: { isComplete: { equals: false } } } }
            orderBy: { name: asc }
          ) {
            name
          }
        }
      `,
      `
        query ProjectsWithIncompleteTasksUsingNone {
          projects(
            where: { NOT: { tasks: { none: { NOT: { isComplete: { equals: true } } } } } }
            orderBy: { name: asc }
          ) {
            name
          }
        }
      `,
      `
        query ProjectsWithIncompleteTasksUsingEvery {
          projects(
            where: { NOT: { tasks: { every: { isComplete: { equals: true } } } } }
            orderBy: { name: asc }
          ) {
            name
          }
        }
      `,
    ],
    {
      design: [{ name: 'Design Task Incomplete' }],
      sudo: [{ name: 'Design Complete, Legal Incomplete' }, { name: 'Design Task Incomplete' }],
    }
  )

  // The dashboard also requires at least one readable task.
  await expectProjects(
    [
      `
        query ProjectsWithCompletedWork {
          projects(
            where: { tasks: { some: {}, every: { isComplete: { equals: true } } } }
            orderBy: { name: asc }
          ) {
            name
          }
        }
      `,
      `
        query ProjectsWithTasksAndNoIncompleteWork {
          projects(
            where: { tasks: { some: {}, none: { NOT: { isComplete: { equals: true } } } } }
            orderBy: { name: asc }
          ) {
            name
          }
        }
      `,
    ],
    {
      design: [{ name: 'All Tasks Complete' }, { name: 'Design Complete, Legal Incomplete' }],
      sudo: [{ name: 'All Tasks Complete' }],
    }
  )
})
