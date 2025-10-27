import { error, fail, redirect } from '@sveltejs/kit';
import db from '$lib/server/database/drizzle.js';
import { producerTable } from '$lib/server/database/drizzle-schemas.js';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types.js';
import { resolve } from '$app/paths';
import { producerSchema } from '$lib/config/zod-schemas.js';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { sql } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';

async function getProducts(producer_id: number | null) {
	// console.log("getProducts(",producer_id,")");
	if(producer_id == null) {
		return null;
	}
	const productResult = await db?.execute(
		sql`SELECT p.id, p.name
			FROM producers_products pp 
			INNER JOIN products p on p.id=pp.product_id
			WHERE pp.producer_id = ${producer_id}`
	);
	const rows = productResult?.rows;
	// console.log("getProducts(",producer_id,") => ",rows);
	return rows;
}

export const load: PageServerLoad = async ({ url, locals }) => {
	if (!locals.user) {
		console.log('request Dashboard but not authenticated');
		redirect(302, resolve('/auth/sign-in'));
	}
	if (!db) {
		return fail(400, {error: 'No database connection.'});
	}

	// Récupérer le producerId depuis l'URL si présent
	const producerIdParam = url.searchParams.get('producerId');
	
	// Récupérer tous les producteurs de cet utilisateur
	const allProducers = await db
		.select()
		.from(producerTable)
		.where(eq(producerTable.userId, locals.user.id));
	
	// Si plusieurs producteurs et aucun n'est sélectionné, rediriger vers /dashboard/choose
	if (allProducers.length > 1 && !producerIdParam) {
		redirect(302, resolve('/dashboard/choose'));
	}
	
	// Déterminer quel producteur utiliser
	let producer = null;
	if (producerIdParam) {
		// Utiliser le producteur spécifié dans l'URL
		const producerIdNum = parseInt(producerIdParam);
		producer = allProducers.find(p => p.id === producerIdNum) || null;
		
		// Si le producteur spécifié n'appartient pas à l'utilisateur, erreur
		if (!producer) {
			throw error(403, 'Producer not found or access denied');
		}
	} else if (allProducers.length === 1) {
		// Un seul producteur, l'utiliser automatiquement
		producer = allProducers[0];
	}

	// Initialiser le formulaire avec les données existantes
	const form = {
		data: producer ? {
			companyName: producer.companyName,
			firstName: producer.firstName || '',
			lastName: producer.lastName || '',
			shortDescription: producer.shortDescription || '',
			description: producer.description || '',
			postCode: producer.postCode || 0,
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
			postCode: 0,
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
	
	// Mettre à jour le producerId dans locals.user si un producteur est sélectionné
	if (locals.session && producer?.id != null) {
		locals.user.producerId = producer.id;
	}
	
	const products = await getProducts(locals.user.producerId);
	return {
		form,
		producer,
		products: products,
		user: locals.user,
		allProducers: allProducers
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
	update: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}
		if (!db) {
			return fail(401, { message: 'Fail connect to database' });
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
				postCode: data.postCode || 0,
				city: data.city,
				address: data.address,
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
				// Créer un nouveau profil - l'ID sera auto-généré par SERIAL
				await db
					.insert(producerTable)
					.values({
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
	},
	removeProduct: async ({ request, locals }) => {
		const formData = await request.formData();
		const product_id = formData.get('id')?.toString();
		if (!locals.user) return [];
		const producerId = locals.user.producerId;
		const query = sql`DELETE FROM producers_products
				WHERE producer_id = ${producerId} AND product_id=${product_id}`;
		const pgDialect = new PgDialect();
		console.log("SQL: ", pgDialect.sqlToQuery(query), locals.user);
		const result = await db?.execute(query);
		if (!result) {
			console.log("SQL Errors ")
		}
		return getProducts(producerId);
	},
	addProducts: async ({ request, locals }) => {
		const formData = await request.formData();
		const productIdsJson = formData.get('productIds')?.toString();
		if (!locals.user || !locals.user.producerId) {
			return fail(401, { message: 'Unauthorized' });
		}
		if (!productIdsJson) {
			return fail(400, { message: 'No products selected' });
		}
		try {
			console.log("formData:",formData);
			console.log("productIdsJson:",productIdsJson);
			const productIds = JSON.parse(productIdsJson);
			const producerId = locals.user.producerId;
			
			// Insérer les nouvelles relations (ignorer les doublons)
			for (const productId of productIds) {
				const query = sql`
					INSERT INTO producers_products (producer_id, product_id)
					VALUES (${producerId}, ${productId})
					ON CONFLICT (producer_id, product_id) DO NOTHING
				`;
				await db?.execute(query);
			}
			return getProducts(producerId);
		} catch (error) {
			console.error('Error adding products:', error);
			return fail(500, { message: 'Failed to add products' });
		}
	}
};

