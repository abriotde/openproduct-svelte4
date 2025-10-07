<script lang="ts">
	// import { onMount } from 'svelte';
	import { Search, Package, ChevronRight, CircleAlert } from 'lucide-svelte';

	const API_URL = '';

	let searchQuery = '';
	let searchResults: any[] = [];
	let loading = false;
	let error: any = null;
	let products: any[] = [];
	let selectedProduct: any = null;

	// Recherche de produits
	async function handleSearch() {
			if (!searchQuery.trim()) return;
			loading = true;
			error = null;
			try {
				const response = await fetch(`${API_URL}/product/search?q=${encodeURIComponent(searchQuery)}`);
				const data = await response.json();
				if (response.ok) {
					searchResults = data.results;
				} else {
					error = data.error || 'Erreur de recherche';
				}
			} catch (err) {
				error = 'Impossible de contacter le serveur';
			} finally {
				loading = false;
			}
	}

	// Gérer la touche Enter
	function handleKeyPress(event:any) {
		if (event.key === 'Enter') {
			handleSearch();
		}
	}

	// Charger tous les produits au démarrage
	/* onMount(async () => {
		try {
			const response = await fetch(`${API_URL}/products`);
			products = await response.json();
		} catch (err) {
			console.error('Erreur chargement produits:', err);
		}
	}); */

	// Voir l'arbre d'un produit
	async function viewProductTree(productId:number) {
		try {
			const response = await fetch(`${API_URL}/products/${productId}/tree`);
			const data = await response.json();
			if (response.ok) {
				selectedProduct = data;
			}
		} catch (err) {
			console.error('Erreur:', err);
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
	<div class="max-w-6xl mx-auto">
		<!-- En-tête -->
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold text-gray-800 mb-2">
				Recherche de Produits
			</h1>
			<p class="text-gray-600">
				Recherchez un produit et découvrez tous ses sous-produits associés
			</p>
		</div>

		<!-- Barre de recherche -->
		<div class="bg-white rounded-lg shadow-lg p-6 mb-8">
			<div class="flex gap-4">
				<div class="flex-1 relative">
					<div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
						<Search size={20} />
					</div>
					<input
						type="text"
						placeholder="Ex: Céramique Dot, Assiette..."
						class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
						bind:value={searchQuery}
						on:keypress={handleKeyPress}
					/>
				</div>
				<button on:click={handleSearch}
						disabled={loading}
						class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
					>
					{loading ? 'Recherche...' : 'Rechercher'}
				</button>
			</div>

			{#if error}
				<div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
					<CircleAlert size={20} />
					<span>{error}</span>
				</div>
			{/if}
		</div>

		<!-- Résultats de recherche -->
		{#if searchResults.length > 0}
			<div class="bg-white rounded-lg shadow-lg p-6 mb-8">
				<h2 class="text-2xl font-semibold text-gray-800 mb-4">
				Résultats ({searchResults.length})
				</h2>
				<div class="grid gap-4">
				{#each searchResults as product (product.id)}
					<div
					class="p-4 border-2 rounded-lg cursor-pointer transition {product.is_direct_match ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}"
					on:click={() => viewProductTree(product.id)}
					on:keypress={(e) => e.key === 'Enter' && viewProductTree(product.id)}
					role="button"
					tabindex="0"
					>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
						<Package 
							class={product.is_collection ? 'text-purple-600' : 'text-blue-600'} 
							size={24} 
						/>
						<div>
							<h3 class="font-semibold text-gray-800">
							{product.name}
							{#if product.is_direct_match}
								<span class="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded">
								Correspondance directe
								</span>
							{/if}
							</h3>
							<div class="flex items-center gap-2 text-sm text-gray-500 mt-1">
							<span>Niveau: {product.hierarchy_level}</span>
							{#if product.is_collection}
								<span class="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
								Collection
								</span>
							{/if}
							{#if product.price}
								<span class="font-medium text-green-600">
								{parseFloat(product.price).toFixed(2)} €
								</span>
							{/if}
							</div>
						</div>
						</div>
						<ChevronRight class="text-gray-400" size={20} />
					</div>
					</div>
				{/each}
				</div>
			</div>
		{/if}

		<!-- Arbre du produit sélectionné -->
		{#if selectedProduct}
			<div class="bg-white rounded-lg shadow-lg p-6">
				<h2 class="text-2xl font-semibold text-gray-800 mb-4">
				Arbre du produit
				</h2>
				
				<!-- Produit principal -->
				<div class="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg mb-4">
					<div class="flex items-center gap-3">
						<Package size={28} />
						<div>
							<h3 class="text-xl font-bold">{selectedProduct.product.name}</h3>
							<p class="text-blue-100">
								{selectedProduct.product.is_collection ? 'Collection' : 'Produit'} - 
								Niveau {selectedProduct.product.hierarchy_level}
							</p>
						</div>
					</div>
				</div>

				<!-- Descendants -->
				{#if selectedProduct.descendants.length > 0}
					<div class="space-y-2">
						<h3 class="font-semibold text-gray-700 mb-3">
						Sous-produits ({selectedProduct.descendants.length})
						</h3>
						{#each selectedProduct.descendants as descendant (descendant.id)}
						<div class="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition"
								style="margin-left: {descendant.depth * 20}px"
							>
							<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<div class="w-2 h-2 bg-blue-400 rounded-full"></div>
								<span class="font-medium text-gray-800">{descendant.name}</span>
								<span class="text-xs text-gray-500">
								(Profondeur: {descendant.depth})
								</span>
							</div>
							{#if descendant.price}
								<span class="text-green-600 font-medium">
								{parseFloat(descendant.price).toFixed(2)} €
								</span>
							{/if}
							</div>
						</div>
						{/each}
					</div>
				{:else}
					<p class="text-gray-500 text-center py-8">
						Aucun sous-produit associé
					</p>
				{/if}
			</div>
		{/if}

		<!-- Liste de tous les produits -->
		{#if searchResults.length === 0 && !selectedProduct}
			<div class="bg-white rounded-lg shadow-lg p-6">
				<h2 class="text-2xl font-semibold text-gray-800 mb-4">
				Tous les produits ({products.length})
				</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each products as product (product.id)}
					<div class="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition cursor-pointer"
						on:click={() => viewProductTree(product.id)}
						on:keypress={(e) => e.key === 'Enter' && viewProductTree(product.id)}
						role="button"
						tabindex="0"
					>
					<div class="flex items-start gap-3">
						<Package 
						class={product.is_collection ? 'text-purple-600' : 'text-blue-600'} 
						size={20} 
						/>
						<div class="flex-1">
							<h3 class="font-semibold text-gray-800 mb-1">
								{product.name}
							</h3>
							<div class="text-xs text-gray-500 space-y-1">
								<div>Niveau: {product.hierarchy_level}</div>
								{#if product.price}
									<div class="text-green-600 font-medium">
										{parseFloat(product.price).toFixed(2)} €
									</div>
								{/if}
							</div>
						</div>
					</div>
					</div>
				{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
  /* Styles globaux si nécessaire */
</style>