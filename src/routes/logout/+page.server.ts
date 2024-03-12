import { lucia } from '$lib/server/lucia';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { deleteSessionCookie } from '$lib/server/authUtils';

export const actions: Actions = {
	default: async ({ cookies, locals }) => {
		if (!locals.session?.id) return;

		await lucia.invalidateSession(locals.session.id);

		await deleteSessionCookie(lucia, cookies);

		throw redirect(303, '/login');
	},

};