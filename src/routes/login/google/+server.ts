// routes/login/github/+server.ts
import { dev } from '$app/environment';
// import { redirect } from "@sveltejs/kit";
import { generateState, generateCodeVerifier } from 'arctic';
import { google } from '$lib/server/auth';

import type { RequestEvent } from '@sveltejs/kit';

export async function GET(event: RequestEvent): Promise<Response> {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const url = await google.createAuthorizationURL(state, codeVerifier, {
		scopes: ['profile', 'email', 'openid']
	});
	event.cookies.set('google_oauth_state', state, {
		path: '/',
		secure: !dev,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	// store code verifier as cookie
	event.cookies.set('code_verifier', codeVerifier, {
		secure: !dev, // set to false in localhost
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10 // 10 min
	});
	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString()
		}
	});
	// redirect(302, url.toString());
}
