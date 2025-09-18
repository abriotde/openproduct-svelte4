import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { producerSchema } from '$lib/config/zod-schemas.js';
import db from '$lib/server/database/drizzle.js';
import { producerTable } from '$lib/server/database/drizzle-schemas.js';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/sign-in');
	}

	// Récupérer le profil producteur existant
	// console.log("DB is ", db);
	// $inspect(db).with(console.trace);
	const existingProducer = await db
		.select()
		.from(producerTable)
		.where(eq(producerTable.userId, locals.user.id))
		.limit(1);
	const producer = existingProducer[0] || null;

	/* const producer = await db.producers.findUnique({
		where: { userId: locals.user.id }
	}); */

	// Initialiser le formulaire avec les données existantes
	const form = await superValidate(producer ? {
		companyName: producer.companyName,
		firstName: producer.firstName || '',
		lastName: producer.lastName || '',
		shortDescription: producer.shortDescription || '',
		description: producer.description || '',
		postCode: producer.postCode || '',
		city: producer.city || '',
		address: producer.address || '',
		category: producer.category || '',
		phoneNumber1: producer.phoneNumber1 || '',
		phoneNumber2: producer.phoneNumber2 || '',
		siretNumber: producer.siretNumber || '',
		website1: producer.website1 || '',
		website2: producer.website2 || '',
		website3: producer.website3 || ''
	} : {}, zod(producerSchema));

	return {
		form,
		producer,
		user: locals.user
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const form = await superValidate(request, zod(producerSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// Vérifier si un profil producteur existe déjà
			const existingProducer = await db
				.select()
				.from(producerTable)
				.where(eq(producerTable.userId, locals.user.id))
				.limit(1);

			const producerData = {
				userId: locals.user.id,
				companyName: form.data.companyName,
				firstName: form.data.firstName || null,
				lastName: form.data.lastName || null,
				shortDescription: form.data.shortDescription || null,
				description: form.data.description || null,
				postCode: form.data.postCode || null,
				city: form.data.city || null,
				address: form.data.address || null,
				category: form.data.category || null,
				phoneNumber1: form.data.phoneNumber1 || null,
				phoneNumber2: form.data.phoneNumber2 || null,
				siretNumber: form.data.siretNumber || null,
				website1: form.data.website1 || null,
				website2: form.data.website2 || null,
				website3: form.data.website3 || null,
				updatedAt: new Date()
			};

			if (existingProducer.length > 0) {
				// Mettre à jour le profil existant
				await db
					.update(producerTable)
					.set(producerData)
					.where(eq(producerTable.userId, locals.user.id));
			} else {
				// Créer un nouveau profil
				await db
					.insert(producerTable)
					.values({
						id: crypto.randomUUID(),
						...producerData,
						createdAt: new Date()
					});
			}

			return { form, success: true };
		} catch (error) {
			console.error('Error saving producer profile:', error);
			return fail(500, { 
				form, 
				message: 'An error occurred while saving your profile. Please try again.' 
			});
		}
	}
};
