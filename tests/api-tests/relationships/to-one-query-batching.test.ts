import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { relationship, text } from '@keystone-6/core/fields'
import { setupTestRunner } from '../test-runner'
import { dbProvider, monitorLogs, waitFor } from '../utils'

const runner = setupTestRunner({
  identifier: 'toqb',
  config: {
    db: { enableLogging: true },
    lists: {
      Post: list({
        access: {
          operation: allowAll,
          filter: { query: () => ({ title: { not: { contains: 'Secret' } } }) },
        },
        fields: {
          title: text(),
          author: relationship({ ref: 'User.posts', many: false }),
        },
      }),
      User: list({
        access: {
          operation: allowAll,
          filter: { query: () => ({ name: { contains: 'User' } }) },
        },
        fields: {
          name: text(),
          posts: relationship({ ref: 'Post.author', many: true }),
        },
      }),
    },
  },
})

test(
  'to-one relationship query batching',
  runner(async ({ context }) => {
    let monitor = monitorLogs()
    try {
      await context.query.User.createMany({
        data: Array.from({ length: 10 }, (_, i) => ({
          name: `User ${i}`,
          posts: {
            create: [{ title: `Post from User ${i}` }, { title: `Secret post from User ${i}` }],
          },
        })),
      })
      await waitFor(() => {
        expect(monitor.logs).toHaveLength(
          {
            mysql: 130,
            postgresql: 70,
            sqlite: 70,
          }[dbProvider]
        )
      })
    } finally {
      monitor.cleanup()
    }

    try {
      monitor = monitorLogs()
      expect(
        await context.query.Post.findMany({
          query: 'title author { name }',
          orderBy: { title: 'asc' },
        })
      ).toEqual(
        Array.from({ length: 10 }, (_, i) => ({
          title: `Post from User ${i}`,
          author: { name: `User ${i}` },
        }))
      )

      await waitFor(() => {
        expect(monitor.logs).toEqual([
          [expect.stringContaining('prisma:query'), expect.stringContaining('SELECT')],
          [expect.stringContaining('prisma:query'), expect.stringContaining('SELECT')],
        ])
      })

      const expectedSql = {
        sqlite: [
          'SELECT `main`.`Post`.`id`, `main`.`Post`.`title`, `main`.`Post`.`author` FROM `main`.`Post` WHERE `main`.`Post`.`title` NOT LIKE ? ORDER BY `main`.`Post`.`title` ASC LIMIT ? OFFSET ?',
          'SELECT `main`.`User`.`id`, `main`.`User`.`name` FROM `main`.`User` WHERE (`main`.`User`.`id` IN (?,?,?,?,?,?,?,?,?,?) AND `main`.`User`.`name` LIKE ?) LIMIT ? OFFSET ?',
        ],
        postgresql: [
          `SELECT "toqb"."Post"."id", "toqb"."Post"."title", "toqb"."Post"."author" FROM "toqb"."Post" WHERE "toqb"."Post"."title"::text NOT LIKE $1 ORDER BY "toqb"."Post"."title" ASC OFFSET $2`,
          `SELECT "toqb"."User"."id", "toqb"."User"."name" FROM "toqb"."User" WHERE ("toqb"."User"."id" IN ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) AND "toqb"."User"."name"::text LIKE $11) OFFSET $12`,
        ],
        mysql: [
          `SELECT \`toqb\`.\`Post\`.\`id\`, \`toqb\`.\`Post\`.\`title\`, \`toqb\`.\`Post\`.\`author\` FROM \`toqb\`.\`Post\` WHERE \`toqb\`.\`Post\`.\`title\` NOT LIKE ? ORDER BY \`toqb\`.\`Post\`.\`title\` ASC`,
          `SELECT \`toqb\`.\`User\`.\`id\`, \`toqb\`.\`User\`.\`name\` FROM \`toqb\`.\`User\` WHERE (\`toqb\`.\`User\`.\`id\` IN (?,?,?,?,?,?,?,?,?,?) AND \`toqb\`.\`User\`.\`name\` LIKE ?)`,
        ],
      }[dbProvider]
      const sql = monitor.logs.map(([, query]) => query)
      expect(sql).toEqual(expectedSql)
    } finally {
      monitor.cleanup()
    }
  })
)
