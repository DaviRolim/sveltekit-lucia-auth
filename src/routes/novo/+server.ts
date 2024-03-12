import { getUserByEmail, insertNewUser } from '$lib/server/database/repository/user';
import { json } from '@sveltejs/kit';
import { createAndSetSession } from '$lib/server/authUtils';
import { lucia } from '$lib/server/lucia';
import { Argon2id } from 'oslo/password';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies }) {
	const req = await request.json();
	console.log('req', req);
	const { name, email, password } = req;
	try {
        const hashedPassword = await new Argon2id().hash(password);

        //  check if user is already registered using the email
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return json({
                error: 'User already exists'
            })
        }
        // create User
        const user = await insertNewUser({
            id: crypto.randomUUID(),
            name,
            email,
            password: hashedPassword,
        })
        if (user.length === 0) {
            throw new Error('User not created');
        }

        await createAndSetSession(lucia, user[0].id, cookies);

		return json({
			message: "success"
		});
	} catch (error) {
		console.log('error', error);
		return json({ error }, { status: 500 });
	}
}
