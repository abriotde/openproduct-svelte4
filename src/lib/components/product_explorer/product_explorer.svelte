<script lang="ts">
	import { Package } from 'lucide-svelte';

	export let selectedProduct: any = null;

	// Fonction pour afficher l'arbre d'un sous-produit
	export function selectProduct(product: any) {
		selectedProduct = product;
	}
</script>

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
						<div class="flex items-center justify-between">
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
			<div class="space-y-2 mt-6">
				<h3 class="h4 mb-3">
					Sur-produits ({selectedProduct.ascendants.length})
				</h3>
				{#each selectedProduct.ascendants as ascendant (ascendant.id)}
					<div class="p-3 border border-surface-300 rounded-lg hover:border-primary-300 transition"
						style="margin-left: {ascendant.depth * 20}px"
					>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<div class="w-2 h-2 bg-primary-400 rounded-full"></div>
								<span class="font-medium">{ascendant.name}</span>
								<span class="text-xs text-surface-500">
									(Profondeur: {ascendant.depth})
								</span>
							</div>
							{#if ascendant.price}
								<span class="text-success-600 font-medium">
									{parseFloat(ascendant.price).toFixed(2)} €
								</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-surface-500 text-center py-8 mt-6">
				Aucun sur-produit associé
			</p>
		{/if}
	</div>
{/if}

