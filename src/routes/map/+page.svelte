<script lang="ts">
	import OpenProductMap from './OpenProductMap.svelte';
</script>

<svelte:head>
	<title>OpenProduct - Carte des producteurs</title>
	<meta name="description" content="Carte interactive des producteurs locaux OpenProduct" />
</svelte:head>

<div class="flex-1">
	<section class="container grid items-center gap-6">
		<OpenProductMap />
	</section>
</div>