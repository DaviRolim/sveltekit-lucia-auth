import { redirect } from '@sveltejs/kit';
import { createAndSetSession } from '$lib/server/authUtils';
import { lucia } from '$lib/server/lucia';
import { Argon2id } from 'oslo/password';
import { getUserByEmail, insertNewUser } from '$lib/server/database/repository/user.js';

/** @type {import('./$types').Actions} */
export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email') || '';
		const password = formData.get('password') || '';
		const name = formData.get('fullName') || '';

		const dbUser = await getUserByEmail(email.toString());

		if (dbUser) {
			throw redirect(303, '/login');
		}
		const hashedPassword = await new Argon2id().hash(password.toString());

		const nUser = await insertNewUser({
			id: crypto.randomUUID(),
			name: name.toString(),
			email: email.toString(),
			password: hashedPassword
		})

		if (!nUser) {
			return redirect(302, '/novo');
		}
		await createAndSetSession(lucia, nUser[0].id, event.cookies);
		throw redirect(302, '/');
	}
};
