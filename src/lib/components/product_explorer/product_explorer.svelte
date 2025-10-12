<script lang="ts">
	import { deserialize } from '$app/forms';
	import { Package, Check } from 'lucide-svelte';
  	import { onMount } from 'svelte';

	let {loading = $bindable(), selectedProduct = $bindable(), productId, selectedProductIds = $bindable()} = $props();

	// Voir l'arbre d'un produit
	export async function setProductTree(productId: number) {
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
				const prod = result.data;
				console.log("getProductTree1() => ", prod);
				selectedProduct = prod;
			} else {
				console.error('getProductTree() : Error with status : ', result.status);
				return null;
			}
		} catch (err) {
			console.error('Erreur:', err);
		} finally {
			loading = false;
		}
	}
	function toggleProduct(productId: number) {
		// console.log("toggleProduct(",productId,");");
		const newSet = new Set(selectedProductIds);
		if (newSet.has(productId)) {
			newSet.delete(productId);
		} else {
			newSet.add(productId);
		}
		selectedProductIds = newSet; // Trigger reactivity with new Set
	}

  
	onMount(() => {
		console.log('ProductExplorer initialized');
		setProductTree(productId);
	});
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
					{#if selectedProductIds}
						<button type="button" onclick={() => toggleProduct(selectedProduct.product.id)}>
							<div class="w-6 h-6 border-2 rounded flex items-center justify-center transition {selectedProductIds.has(selectedProduct.product.id) ? 'border-primary-500 bg-primary-500' : 'border-surface-400'}">
								{#if selectedProductIds.has(selectedProduct.product.id)}
									<Check size={16} class="text-white" />
								{/if}
							</div>
						</button>
					{/if}
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
							onkeyup={() => setProductTree(descendant.id)} onclick={() => setProductTree(descendant.id)}>
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
							style="margin-left: {ascendants.depth * 20}px">
						<div class="flex items-center justify-between" role="button" tabindex="0"
							onkeyup={() => setProductTree(ascendants.id)} onclick={() => setProductTree(ascendants.id)}>
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