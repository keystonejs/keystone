import type { Context } from '.keystone/types'

const demoUsers = [
	{
		email: 'clark@email.com',
		subjectId: 'somestring',
		name: 'Clark Kent',
		role: 'user',
	},
	{
		email: 'bruce@email.com',
		subjectId: 'somestring1',
		name: 'Bruce Wayne',
		role: 'admin',
	},
	{
		email: 'diana@email.com',
		subjectId: 'somestring2',
		name: 'Diana Prince',
		role: 'user',
	},
] as const

const upsertUser = async ({
	context,
	user,
}: {
	context: Context
	user: { email: string; subjectId: string; name: string }
}) => {
	const userInDb = await context.db.User.findOne({
		where: { email: user.email },
	})
	if (userInDb) {
		return userInDb
	}

	return context.db.User.createOne({ data: user })
}

export const seedDemoData = (context: Context) => {
	const sudoContext = context.sudo()
	return Promise.all(
		demoUsers.map((u) => upsertUser({ context: sudoContext, user: u }))
	)
}
