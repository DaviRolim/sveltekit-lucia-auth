import { sql } from 'drizzle-orm';
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users', {
	id: text('id').primaryKey().notNull(),

	name: text('name').notNull(),

	email: text('email').notNull().unique(),

	password: text('password'),

	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const usersSessionsTable = sqliteTable('users_sessions', {
	id: text('id').primaryKey().notNull(),

	userId: text('user_id')
		.notNull()
		.references(() => usersTable.id),

	expiresAt: integer('expires_at').notNull()
});

export const oauthAccountTable = sqliteTable('oauth_account', {
    providerId: text('provider_id').notNull(),
    providerUserId: text('provider_user_id').notNull(),
    userId: text('user_id').notNull().references(() => usersTable.id),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.providerId, table.providerUserId] }),

    }
});

export type UserInsertSchema = typeof usersTable.$inferInsert;
export type OauthAccountInsertSchema = typeof oauthAccountTable.$inferInsert;
