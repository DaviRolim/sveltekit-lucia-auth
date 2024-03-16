import { github, lucia } from '$lib/server/auth';
import { OAuth2RequestError } from 'arctic';
import type { RequestEvent } from '@sveltejs/kit';
import { generateId } from 'lucia';
import { insertNewUser } from '$lib/server/database/repository/user';
import { createAndSetSession } from '$lib/server/authUtils';
import { findExistingUserByProviderIdAndProviderUserId, insertOAuthAccount } from '$lib/server/database/repository/oauth';


export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');

	const storedState = event.cookies.get('github_oauth_state') ?? null;
	if (!code || !state || !storedState || state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	try {
		const tokens = await github.validateAuthorizationCode(code);
		const githubUserResponse = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});
		const githubUser: GitHubUser = await githubUserResponse.json();

		const existingUserId = await findExistingUserByProviderIdAndProviderUserId('github', githubUser.id)

		if (existingUserId) {
			await createAndSetSession(lucia, existingUserId, event.cookies);
		} else {
			const userId = generateId(15);

			await insertNewUser({
				id: userId,
				email: githubUser.email,
				name: githubUser.name,
			});
			await insertOAuthAccount({
				providerId: 'github',
				providerUserId: githubUser.id,
				userId: userId
			})
			await createAndSetSession(lucia, userId, event.cookies);
		}
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		});
	} catch (e) {
		if (e instanceof OAuth2RequestError) {
			return new Response(null, {
				status: 400
			});
		}
		return new Response(null, {
			status: 500
		});
	}
}

type GitHubUser = {
	id: string;
	login: string;
	avatar_url: string;
	name: string;
	email: string;
};
