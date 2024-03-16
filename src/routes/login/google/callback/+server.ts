// routes/login/github/callback/+server.ts
import { OAuth2RequestError } from 'arctic';
import { generateId } from 'lucia';
import { google, lucia } from '$lib/server/auth';

import type { RequestEvent } from '@sveltejs/kit';
import { insertNewUser } from '$lib/server/database/repository/user';
import { createAndSetSession } from '$lib/server/authUtils';
import { findExistingUserByProviderIdAndProviderUserId, insertOAuthAccount } from '$lib/server/database/repository/oauth';

export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('google_oauth_state') ?? null;
	const storedCodeVerifier = event.cookies.get('code_verifier');

	if (!code || !state || !storedState || state !== storedState || !storedCodeVerifier) {
		return new Response(null, {
			status: 302,
			headers: {
				location: '/login'
			}
		});
	}

	try {
		const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
		const googleUserResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});

		const googleUser: GoogleUser = await googleUserResponse.json();

		const existingUserId = await findExistingUserByProviderIdAndProviderUserId('google', googleUser.sub);

		if (existingUserId) {
			createAndSetSession(lucia, existingUserId, event.cookies);
		} else {
			const userId = generateId(15);

			await insertNewUser({
				id: userId,
				name: googleUser.name,
				email: googleUser.email
			});

			await insertOAuthAccount({
				providerId: 'google',
				providerUserId: googleUser.sub,
				userId: userId
			})

			await createAndSetSession(lucia, userId, event.cookies);
			console.log('Session Created');
		}
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		});
	} catch (e) {
		console.log('error', e);
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

interface GoogleUser {
	sub: string;
	name: string;
	email: string;
}
