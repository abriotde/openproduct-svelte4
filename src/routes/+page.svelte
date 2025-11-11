<script lang="ts">
	import { APP_NAME } from '$lib/config/constants';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>{APP_NAME}</title>
	<meta
		name="description"
		content="OpenProduct, une association des producteurs locaux."
	/>
</svelte:head>

<div class="container mx-auto py-8 px-4 min-h-screen">
	<section class="grid items-start gap-6">
		<div class="flex max-w-[980px] flex-col items-start gap-4 pb-8">
			<h1 class="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
				{APP_NAME}
			</h1>
			<h3>Qui sommes nous?</h3>
			<p>OpenProduct est une association à but non-lucrative (loi 1901) qui souhaite promouvoir les producteurs locaux et les circuits courts en permettant à tous de trouver tous les producteurs de chez lui.</p>
			<h3>Comment?</h3>
			<p>L'inscription et l'utilisation sont gratuites pour tous les producteurs afin de n'en laisser aucun de côté.</p>
			<p>La base de donnée est open-source et l'accès est libre et simple pour tous les utilisateurs sur notre site.</p>
			<h3>Quels financements?</h3>
			<p>Les producteurs peuvent donner une cotisation annuelle libre. Celle-ci est mise en avant sur le site <a href={resolve("/about#bienfaiteurs")}>ici</a> de manière à sensibiliser le consommateur aux producteurs qui s'engagent. Cela fait office de publicité.</p>
			<p>Les consommateurs peuvent aussi faire un don déductible. Si vous voulez faire un don <a href="https://fr.ulule.com/openproduct/" target="_blank">ici</a>, soyez assuré de sa bonne utilisation. Nous vous en remerçions. Les comptes sont publics <a href="https://github.com/abriotde/openproduct-docs/blob/main/banque/comptes.fods">ici</a> ce qui vous assure qu'il y aura toujours du monde pour vérifier le bon usage de l'argent.</p>
			<p>Nous avons le projet de créer un label pour mettre un peu plus en valeur les producteurs qui jouent la carte de la transparence. Il permet au conssommateur d'avoir une certaine garantie que la production soit réellement locale. En effet, certains peuvent être tentés d'importer les produits et de ne faire localement qu'une infime partie du travail.</p>
			<p>Nous comptons aussi sur la communauté des utilisateurs pour nous aider à les recenser tous : Ecrivez nous par email à <a href="mailto:contact@openproduct.fr">contact@openproduct.fr</a> et devenez ambassadeur OpenProduct.</p>
		</div>
	</section>
</div>

<style>
	h3 {
		font-weight:bold;
	}
	a {
		color: blue;
	}
</style>