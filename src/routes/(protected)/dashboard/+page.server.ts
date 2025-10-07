import { fail, redirect } from '@sveltejs/kit';
import db from '$lib/server/database/drizzle.js';
import { producerTable } from '$lib/server/database/drizzle-schemas.js';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types.js';
import { resolve } from '$app/paths';
import { producerSchema } from '$lib/config/zod-schemas.js';
import { superValidate } from 'sveltekit-superforms';
import { zod4, zodClient } from 'sveltekit-superforms/adapters';


export const load: PageServerLoad = async ({ locals }) => {
	console.log('Dashboard in process');
	if (!locals.user) {
		redirect(302, resolve('/auth/sign-in'));
	}

	// Récupérer le profil producteur existant
	const existingProducer = await db
		.select()
		.from(producerTable)
		.where(eq(producerTable.userId, locals.user.id))
		.limit(1);
	const producer = existingProducer[0] || null;

	// Initialiser le formulaire avec les données existantes
	const form = {
		data: producer ? {
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
		} : {
			companyName: '',
			firstName: '',
			lastName: '',
			shortDescription: '',
			description: '',
			postCode: '',
			city: '',
			address: '',
			category: '',
			phoneNumber1: '',
			phoneNumber2: '',
			siretNumber: '',
			website1: '',
			website2: '',
			website3: ''
		},
		errors: {},
		valid: true
	};

	return {
		form,
		producer,
		user: locals.user
	};
};

async function getXYFromAddress(address: string) {
	const url = "https://api-adresse.data.gouv.fr/search/?q=" + encodeURI(address);
	console.log("Url : ", url);
	const response = await fetch(url);
	const res = await response.json();
	if (res.features.length == 0) return null;
	const feature = res.features[0];
	const coordinates = feature.geometry.coordinates;
	let addr = feature.properties;
	addr.latitude = coordinates[1];
	addr.longitude = coordinates[0];
	return addr;
}

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}
    	const form = await superValidate(request, zod4(producerSchema));

		const data = form.data;
		try {
			// Vérifier si un profil producteur existe déjà
			const existingProducer = await db
				.select()
				.from(producerTable)
				.where(eq(producerTable.userId, locals.user.id))
				.limit(1);

			const address = data.address || null;
			const postCode = data.postCode || null;
			const city = data.city || null;
			const addr = await getXYFromAddress(address + ", " + postCode + " " + city)
			let latitude = 0.0;
			let longitude = 0.0;
			if (addr) {
				latitude = addr.latitude;
				longitude = addr.longitude;
			}

			const producerData = {
				userId: locals.user.id,
				companyName: data.companyName,
				firstName: data.firstName || null,
				lastName: data.lastName || null,
				shortDescription: data.shortDescription || null,
				description: data.description || null,
				postCode: postCode,
				city: city,
				address: address,
				category: data.category || null,
				phoneNumber1: data.phoneNumber1 || null,
				phoneNumber2: data.phoneNumber2 || null,
				siretNumber: data.siretNumber || null,
				website1: data.website1 || null,
				website2: data.website2 || null,
				website3: data.website3 || null,
				updatedAt: new Date(),
				latitude: latitude,
				longitude: longitude,
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

			return {form};
		} catch (error) {
			console.error('Error saving producer profile:', error);
			return fail(500, {
				form: {
					data,
					errors: { general: 'An error occurred while saving your profile. Please try again.' },
					valid: false
				}
			});
		}
	}
};
