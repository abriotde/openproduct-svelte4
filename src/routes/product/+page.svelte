<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Search, Package, ChevronRight, CircleAlert } from 'lucide-svelte';
	import type { PageData, ActionData } from './$types';
	import { applyAction, deserialize } from '$app/forms';

	export let data: PageData;
	export let form: ActionData;

	let searchQuery = data.searchQuery || '';
	let searchResults = data.searchResults || [];
	let selectedProduct: any = null;
	let loading = false;

	// Mettre à jour les résultats quand les données changent
	$: if (data.searchResults) {
		searchResults = data.searchResults;
	}

	// Gérer la recherche avec URL
	function handleSearch(searchPattern:string) {
		if (!searchPattern.trim()) return;
		goto(`/product?q=${encodeURIComponent(searchPattern)}`);
		searchQuery = searchPattern;
	}

	// Gérer la touche Enter
	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSearch(searchQuery);
		}
	}

	// Voir l'arbre d'un produit
	async function viewProductTree(productId: number) {
		loading = true;
		try {
			const formData = new FormData();
			formData.append('productId', productId.toString());
			const response = await fetch('/product?/getProductTree', {
				method: 'POST',
				body: formData
			});

			/** @type {import('@sveltejs/kit').ActionResult} */
			const result = deserialize(await response.text());
			if (result.type === 'success' && result.data) {
				selectedProduct = result.data;
				console.log("getProductTree1() => ", selectedProduct);
			} else {
				selectedProduct = null;
				console.error('getProductTree() : Error with status : ', result.status);
			}
		} catch (err) {
			console.error('Erreur:', err);
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Recherche de Produits</title>
</svelte:head>

<div class="container mx-auto p-8 min-h-screen">
	<div class="max-w-6xl mx-auto">
		<!-- En-tête -->
		<div class="text-center mb-8">
			<h1 class="h1 mb-2">
				Recherche de Produits
			</h1>
			<p class="text-surface-600-300-token">
				Recherchez un produit et découvrez tous ses sous-produits associés
			</p>
		</div>

		<!-- Barre de recherche -->
		<div class="card p-6 mb-8">
			<form method="GET" action="/product" class="flex gap-4">
				<div class="flex-1 relative">
					<div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400">
						<Search size={20} />
					</div>
					<input type="text"
						name="q"
						placeholder="Ex: Céramique, Assiette, Cuivre..."
						class="input pl-10 pr-4 py-3"
						bind:value={searchQuery}
						onkeypress={handleKeyPress}
					/>
				</div>
				<button 
					type="submit"
					class="btn variant-filled-primary"
					disabled={loading}
				>
					{loading ? 'Recherche...' : 'Rechercher'}
				</button>
			</form>

			{#if data.error || form?.error}
				<aside class="alert variant-filled-error mt-4">
					<div class="alert-message flex items-center gap-2">
						<CircleAlert size={20} />
						<span>{data.error || form?.error}</span>
					</div>
				</aside>
			{/if}
		</div>

		<!-- Résultats de recherche -->
		{#if searchResults.length > 0}
			<div class="card p-6 mb-8">
				<h2 class="h2 mb-4">
					Résultats ({searchResults.length})
				</h2>
				<div class="grid gap-4">
					{#each searchResults as product (product.id)}
						<button
							type="button"
							class="p-4 border-2 rounded-lg cursor-pointer transition text-left w-full {product.is_direct_match ? 'border-primary-500 bg-primary-50' : 'border-surface-300 hover:border-primary-300'}"
							onclick={() => viewProductTree(product.id)}
						>
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-3">
									<Package class='text-primary-600' size={24} />
									<div>
										<h3 class="h4">
											{product.name}
											{#if product.is_direct_match}
												<span class="badge variant-filled-primary ml-2">
													Correspondance directe
												</span>
											{/if}
										</h3>
										<div class="flex items-center gap-2 text-sm text-surface-600-300-token mt-1">
											<span>Niveau: {product.depth}</span>
										</div>
									</div>
								</div>
								<ChevronRight class="text-surface-400" size={20} />
							</div>
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Arbre du produit sélectionné -->
		{#if selectedProduct}
			<div class="card p-6">
				<h2 class="h2 mb-4">
					Arbre du produit
				</h2>
				
				<!-- Produit principal -->
				<div class="p-4 bg-gradient-to-r from-primary-500 to-secondary-600 text-white rounded-lg mb-4">
					<div class="flex items-center gap-3">
						<Package size={28} />
						<div>
							<h3 class="h3 text-white">{selectedProduct.product.name}</h3>
							<p class="text-primary-100">
								{selectedProduct.product.is_collection ? 'Collection' : 'Produit'} - 
								Niveau {selectedProduct.product.hierarchy_level}
							</p>
						</div>
					</div>
				</div>

				<!-- Descendants -->
				{#if selectedProduct.descendants && selectedProduct.descendants.length > 0}
					<div class="space-y-2">
						<h3 class="h4 mb-3">
							Sous-produits ({selectedProduct.descendants.length})
						</h3>
						{#each selectedProduct.descendants as descendant (descendant.id)}
							<div class="p-3 border border-surface-300 rounded-lg hover:border-primary-300 transition"
								style="margin-left: {descendant.depth * 20}px"
							>
								<div class="flex items-center justify-between" role="button" tabindex="0"
									onkeyup={() => viewProductTree(descendant.id)} onclick={() => viewProductTree(descendant.id)}>
									<div class="flex items-center gap-2">
										<div class="w-2 h-2 bg-primary-400 rounded-full"></div>
										<span class="font-medium">{descendant.name}</span>
										<span class="text-xs text-surface-500">
											(Profondeur: {descendant.depth})
										</span>
									</div>
									{#if descendant.price}
										<span class="text-success-600 font-medium">
											{parseFloat(descendant.price).toFixed(2)} €
										</span>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-surface-500 text-center py-8">
						Aucun sous-produit associé
					</p>
				{/if}
				<!-- Ascendants -->
				{#if selectedProduct.ascendants && selectedProduct.ascendants.length > 0}
					<div class="space-y-2">
						<h3 class="h4 mb-3">
							Sur-produits ({selectedProduct.ascendants.length})
						</h3>
						{#each selectedProduct.ascendants as ascendants (ascendants.id)}
							<div class="p-3 border border-surface-300 rounded-lg hover:border-primary-300 transition"
								style="margin-left: {ascendants.depth * 20}px"
							>
								<div class="flex items-center justify-between" role="button" tabindex="0"
									onkeyup={() => viewProductTree(ascendants.id)} onclick={() => viewProductTree(ascendants.id)}>
									<div class="flex items-center gap-2">
										<div class="w-2 h-2 bg-primary-400 rounded-full"></div>
										<span class="font-medium">{ascendants.name}</span>
										<span class="text-xs text-surface-500">
											(Profondeur: {ascendants.depth})
										</span>
									</div>
									{#if ascendants.price}
										<span class="text-success-600 font-medium">
											{parseFloat(ascendants.price).toFixed(2)} €
										</span>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-surface-500 text-center py-8">
						Aucun sur-produit associé
					</p>
				{/if}
			</div>
		{/if}

		<!-- Message si pas de recherche -->
		{#if searchResults.length === 0 && !selectedProduct && !data.searchQuery}
			<div class="card p-8 text-center">
				<Package size={64} class="mx-auto text-surface-400 mb-4" />
				<h3 class="h3 mb-2">Recherchez un produit</h3>
				<p class="text-surface-600-300-token">
					Utilisez la barre de recherche ci-dessus pour trouver des produits et leurs sous-produits.
				</p>
			</div>
		{/if}

		<!-- Message si aucun résultat -->
		{#if searchResults.length === 0 && data.searchQuery && !data.error}
			<div class="card p-8 text-center">
				<CircleAlert size={64} class="mx-auto text-warning-500 mb-4" />
				<h3 class="h3 mb-2">Aucun résultat</h3>
				<p class="text-surface-600-300-token">
					Aucun produit trouvé pour "{data.searchQuery}". Essayez avec d'autres termes.
				</p>
			</div>
		{/if}
	</div>
</div>
