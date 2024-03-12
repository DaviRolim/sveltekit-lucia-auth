import { eq } from 'drizzle-orm';
import { database } from '../';
import { usersTable, type UserInsertSchema } from '../schema';

export async function getUserByEmail(email: string) {
	return await database.query.usersTable.findFirst({
		where: eq(usersTable.email, email)
	});
}

export const emailIsUsed = async (email: string) => {
	const queryResult = await database
		.select({
			email: usersTable.email
		})
		.from(usersTable)
		.where(eq(usersTable.email, email));

	return queryResult.length > 0;
};

export const insertNewUser = async (user: UserInsertSchema) => {
	return await database.insert(usersTable).values(user).returning({ id: usersTable.id });
};
