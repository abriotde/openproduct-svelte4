<script lang="ts">
	import { APP_NAME } from '$lib/config/constants';
</script>

<svelte:head>
	<title>{APP_NAME}</title>
	<meta
		name="description"
		content="OpenProduct, une association des producteurs locaux."
	/>
</svelte:head>

<div class="flex-1">
	<section class="container grid items-center gap-6">
		<div class="flex max-w-[980px] flex-col items-start gap-2">
			<h1 class="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
				{APP_NAME}
			</h1>
			<p>Adresse: 7 le Surget, 22 980 Plélan-le-Petit</p>
			<p>Téléphone: <a href="tel:+33985104873">(+33)9 85 10 48 73</a></p>
			<p>Courriel: <a href="mailto:contact@openproduct.fr">contact@openproduct.fr</a></p>
			<br>
			<p>©️ All rights reserved for the OpenProduct name, logo and overall branding.</p>
		</div>
	</section>
</div>

<style>
a {
	color: cyan;
}
</style>