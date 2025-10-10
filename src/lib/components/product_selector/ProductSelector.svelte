<script lang="ts">
	import { Search, Package, CircleAlert, Check } from 'lucide-svelte';
	
	let {existingProductIds, onvalidate, oncancel} = $props();
	
	let searchQuery = $state('');
	let searchResults: any[] = $state([]);
	let selectedProductIds = $state(new Set<number>(existingProductIds));
	let loading = $state(false);
	let error = $state('');

	// Rechercher des produits via l'action serveur
	async function handleSearch() {
		if (!searchQuery.trim()) {
			error = 'Veuillez entrer un terme de recherche';
			return;
		}
		
		loading = true;
		error = '';
		searchResults = [];
		
		try {
			// Utiliser l'endpoint existant de la page product
			const response = await fetch(`/product/api/search?q=${encodeURIComponent(searchQuery)}`);
			
			if (response.ok) {
				const data = await response.json();
				searchResults = data.results || [];
				
				if (searchResults.length === 0) {
					error = `Aucun produit trouvé pour "${searchQuery}"`;
				}
			} else {
				error = 'Erreur lors de la recherche';
			}
		} catch (err) {
			console.error('Erreur de recherche:', err);
			error = 'Une erreur est survenue lors de la recherche';
		} finally {
			loading = false;
		}
	}

	// Gérer la touche Enter
	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			handleSearch();
		}
	}

	// Toggle sélection d'un produit
	function toggleProduct(productId: number) {
		if (selectedProductIds.has(productId)) {
			selectedProductIds.delete(productId);
		} else {
			selectedProductIds.add(productId);
		}
		selectedProductIds = selectedProductIds; // Trigger reactivity
	}

	// Valider la sélection
	function handleValidate() {
		onvalidate?.({
			productIds: Array.from(selectedProductIds)
		});
	}

	// Annuler
	function handleCancel() {
		oncancel?.();
	}
</script>

<div class="h-full flex flex-col bg-surface-50">
	<!-- En-tête -->
	<div class="p-6 bg-white border-b border-surface-300">
		<h2 class="h2 mb-2">Sélectionner des produits</h2>
		<p class="text-surface-600-300-token">
			Recherchez et sélectionnez les produits que vous produisez
		</p>
	</div>

	<!-- Barre de recherche -->
	<div class="p-6 bg-white border-b border-surface-300">
		<div class="flex gap-4">
			<div class="flex-1 relative">
				<div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400">
					<Search size={20} />
				</div>
				<input 
					type="text"
					placeholder="Ex: Céramique, Assiette, Cuivre..."
					class="input pl-10 pr-4 py-3 w-full"
					bind:value={searchQuery}
					onkeypress={handleKeyPress}
				/>
			</div>
			<button 
				type="button"
				class="btn variant-filled-primary"
				onclick={handleSearch}
				disabled={loading || !searchQuery.trim()}
			>
				{loading ? 'Recherche...' : 'Rechercher'}
			</button>
		</div>

		{#if error}
			<aside class="alert variant-filled-warning mt-4">
				<div class="alert-message flex items-center gap-2">
					<CircleAlert size={20} />
					<span>{error}</span>
				</div>
			</aside>
		{/if}
	</div>

	<!-- Résultats -->
	<div class="flex-1 overflow-y-auto p-6">
		{#if searchResults.length > 0}
			<div class="space-y-2">
				<p class="text-sm text-surface-600-300-token mb-4 font-medium">
					{selectedProductIds.size} produit(s) sélectionné(s) sur {searchResults.length} résultat(s)
				</p>
				{#each searchResults as product (product.id)}
					<button
						type="button"
						class="w-full p-4 border-2 rounded-lg cursor-pointer transition text-left bg-white {selectedProductIds.has(product.id) ? 'border-primary-500 bg-primary-50 shadow-md' : 'border-surface-300 hover:border-primary-300 hover:shadow'}"
						onclick={() => toggleProduct(product.id)}
					>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<!-- Checkbox -->
								<div class="w-6 h-6 border-2 rounded flex items-center justify-center transition {selectedProductIds.has(product.id) ? 'border-primary-500 bg-primary-500' : 'border-surface-400'}">
									{#if selectedProductIds.has(product.id)}
										<Check size={16} class="text-white" />
									{/if}
								</div>
								
								<Package class='text-primary-600' size={24} />
								
								<div>
									<h3 class="font-semibold text-surface-900">
										{product.name}
										{#if product.is_direct_match}
											<span class="badge variant-filled-primary ml-2 text-xs">
												Correspondance directe
											</span>
										{/if}
									</h3>
									<div class="flex items-center gap-2 text-sm text-surface-600-300-token mt-1">
										<span>Niveau hiérarchique: {product.depth}</span>
									</div>
								</div>
							</div>
						</div>
					</button>
				{/each}
			</div>
		{:else if loading}
			<div class="text-center py-12">
				<div class="animate-spin mx-auto mb-4 w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"></div>
				<p class="text-surface-600-300-token">
					Recherche en cours...
				</p>
			</div>
		{:else if searchQuery && !loading}
			<div class="text-center py-12">
				<CircleAlert size={64} class="mx-auto text-warning-500 mb-4" />
				<p class="text-surface-600-300-token text-lg mb-2">
					Aucun résultat
				</p>
				<p class="text-surface-500 text-sm">
					Essayez avec d'autres termes de recherche
				</p>
			</div>
		{:else}
			<div class="text-center py-12">
				<Package size={64} class="mx-auto text-surface-400 mb-4" />
				<h3 class="text-lg font-semibold text-surface-700 mb-2">
					Recherchez des produits
				</h3>
				<p class="text-surface-600-300-token">
					Utilisez la barre de recherche ci-dessus pour trouver les produits que vous produisez
				</p>
			</div>
		{/if}
	</div>

	<!-- Boutons d'action -->
	<div class="p-6 bg-white border-t border-surface-300 flex justify-end gap-4">
		<button
			type="button"
			class="btn variant-ghost-surface"
			onclick={handleCancel}
		>
			Annuler
		</button>
		<button
			type="button"
			class="btn variant-filled-primary"
			onclick={handleValidate}
			disabled={selectedProductIds.size === 0}
		>
			Valider la sélection ({selectedProductIds.size})
		</button>
	</div>
</div>

