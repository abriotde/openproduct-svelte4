import { db } from '$lib/server/database/drizzle';
import { sql } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const searchQuery = url.searchParams.get('q');
	
	if (!searchQuery) {
		return {
			searchResults: [],
			searchQuery: ''
		};
	}

	try {
		// Utiliser la fonction PostgreSQL search_products_with_children
		const results = await db.execute(sql`
			SELECT * FROM search_products_with_children(${searchQuery})
			ORDER BY is_direct_match DESC, hierarchy_level, name
		`);

		return {
			searchResults: results.rows,
			searchQuery
		};
	} catch (error) {
		console.error('Erreur de recherche:', error);
		return {
			searchResults: [],
			searchQuery,
			error: 'Erreur lors de la recherche'
		};
	}
};

export const actions: Actions = {
	search: async ({ request }) => {
		const formData = await request.formData();
		const query = formData.get('query')?.toString() || '';

		if (!query.trim()) {
			return {
				success: false,
				error: 'Veuillez entrer un terme de recherche'
			};
		}

		try {
			const results = await db.execute(sql`
				SELECT * FROM search_products_with_children(${query})
				ORDER BY is_direct_match DESC, hierarchy_level, name
			`);

			return {
				success: true,
				results: results.rows
			};
		} catch (error) {
			console.error('Erreur de recherche:', error);
			return {
				success: false,
				error: 'Erreur lors de la recherche'
			};
		}
	},

	getProductTree: async ({ request }) => {
		const formData = await request.formData();
		const productId = parseInt(formData.get('productId')?.toString() || '0');

		if (!productId) {
			return {
				success: false,
				error: 'ID de produit invalide'
			};
		}

		try {
			// Récupérer le produit principal
			const productResult = await db.execute(sql`
				SELECT * FROM products WHERE id = ${productId}
			`);

			if (productResult.rows.length === 0) {
				return {
					success: false,
					error: 'Produit non trouvé'
				};
			}

			const product = productResult.rows[0];

			// Récupérer tous les descendants
			const descendantsResult = await db.execute(sql`
				SELECT 
					p.id,
					p.name,
					p.description,
					p.is_collection,
					p.hierarchy_level,
					p.price,
					d.depth
				FROM get_all_descendants(${productId}) d
				JOIN products p ON p.id = d.descendant_id
				ORDER BY d.depth, p.name
			`);

			return {
				success: true,
				product,
				descendants: descendantsResult.rows
			};
		} catch (error) {
			console.error('Erreur lors de la récupération de l\'arbre:', error);
			return {
				success: false,
				error: 'Erreur lors de la récupération de l\'arbre du produit'
			};
		}
	}
};
