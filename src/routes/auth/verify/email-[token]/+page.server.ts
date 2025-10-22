import { redirect } from 'sveltekit-flash-message/server';
import { getUserByToken, updateUser, getUserByEmail } from '$lib/server/database/user-model.js';
import { fail } from '@sveltejs/kit';
import { sendWelcomeEmail, sendVerificationEmail } from '$lib/config/email-messages';
import { tryLink2Producer } from '$lib/server/database/user-model'
import type { User } from '$lib/server/database/drizzle-schemas';
import { resolve } from '$app/paths';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const token = event.params.token as string;
	const resend = event.url.searchParams.get('resend');

	// Mode renvoi d'email : le token est en fait l'email encodé
	if (resend === 'true') {
		const email = decodeURIComponent(token);
		const user = await getUserByEmail(email);

		if (!user) {
			console.error("Ask resend email but no user with email '", email, "'");
			const message = {
				type: 'error',
				message: 'Impossible de renvoyer l\'email. Utilisateur introuvable. Veuillez contacter le support.'
			} as const;
			redirect(302, resolve('/auth/verify/email'), message, event.cookies);
		}

		if (!user.token) {
			console.error("Ask resend email but no token for user with email '", email, "' (", user.id, ")");
			const message = {
				type: 'error',
				message: 'Impossible de renvoyer l\'email. Token manquant. Veuillez contacter le support.'
			} as const;
			redirect(302, resolve('/auth/verify/email'), message, event.cookies);
		}

		// Marquer comme non vérifié et renvoyer l'email
		await updateUser(user.id, { verified: false });
		await sendVerificationEmail(user.email, user.token);

		const message = {
			type: 'success',
			message: 'Un nouvel email de vérification a été envoyé. Veuillez consulter votre boîte mail (et le dossier spam).'
		} as const;
		redirect(302, resolve('/auth/verify/email'), message, event.cookies);
	}

	// Mode vérification d'email normal
	try {
		const user: User | null = await getUserByToken(token);

		if (!user) {
			return fail(500, { error: 'User not found' });
		}

		let heading = 'Email Verification Problem';
		let message =
			'Your email could not be verified. Please contact support if you feel this is an error.';

		if (user) {
			await tryLink2Producer(user);
			sendWelcomeEmail(user.email);
			heading = 'Email Verified';
			message =
				'Your email has been verified. You can now <a href="'+resolve('/auth/sign-in')+'" class="underline">sign in</a>';
			await updateUser(user.id, { verified: true });
		}
		return { heading, message };
	} catch (e) {
		return fail(500, { error: e });
	}
};

