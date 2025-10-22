import { redirect } from 'sveltekit-flash-message/server';
import { resolve } from '$app/paths';
import { sendVerificationEmail } from '$lib/config/email-messages';
import { getUserByEmail, updateUser } from '$lib/server/database/user-model';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const email = decodeURIComponent(event.params.email) as string;

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

	// Update user to mark as not verified (in case they were)
	await updateUser(user.id, { verified: false });

	// Send verification email
	await sendVerificationEmail(user.email, user.token);

	// Redirect back to verify email page with success message
	const message = {
		type: 'success',
		message: 'Un nouvel email de vérification a été envoyé. Veuillez consulter votre boîte mail (et le dossier spam).'
	} as const;
	redirect(302, resolve('/auth/verify/email'), message, event.cookies);
};

