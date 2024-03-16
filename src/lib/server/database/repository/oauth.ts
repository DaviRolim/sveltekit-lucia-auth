import { and, eq } from 'drizzle-orm';
import { database } from '../';
import { oauthAccountTable, type OauthAccountInsertSchema } from '../schema';

export async function insertOAuthAccount(
   { providerId, providerUserId, userId }: OauthAccountInsertSchema 
) {
    return await database
        .insert(oauthAccountTable)
        .values({ providerId, providerUserId, userId })
        .returning({ id: oauthAccountTable.userId });
}

export async function findExistingUserByProviderIdAndProviderUserId(
   providerId: string,
   providerUserId: string
): Promise<string | undefined> {
    const existngUserId = await database
        .select({ userId: oauthAccountTable.userId })
        .from(oauthAccountTable)
        .where(
            and(
                eq(oauthAccountTable.providerId, providerId),
                eq(oauthAccountTable.providerUserId, providerUserId)
            )
        );
    return existngUserId[0]?.userId;
}