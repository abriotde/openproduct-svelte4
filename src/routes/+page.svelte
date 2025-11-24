<script lang="ts">
	import { APP_NAME } from '$lib/config/constants';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>OpenProduct - Trouvez des producteurs locaux près de chez vous | Made in France</title>
	<meta
		name="description"
		content="Découvrez les producteurs locaux près de chez vous avec OpenProduct. Circuits courts, made in France, produits locaux de qualité. Trouvez facilement les producteurs de votre région."
	/>
	<meta name="keywords" content="producteurs locaux, producteurs près de chez moi, made in France, circuits courts, produits locaux, agriculture locale, artisans locaux, consommer local" />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="OpenProduct - Trouvez des producteurs locaux près de chez vous" />
	<meta property="og:description" content="Découvrez les producteurs locaux près de chez vous. Circuits courts, made in France, produits de qualité." />
	<meta property="og:locale" content="fr_FR" />
	
	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="OpenProduct - Producteurs locaux près de chez vous" />
	<meta name="twitter:description" content="Découvrez les producteurs locaux près de chez vous. Circuits courts, made in France." />
	
	<!-- Geo tags -->
	<meta name="geo.region" content="FR" />
	<meta name="geo.placename" content="France" />
</svelte:head>

<div class="container mx-auto py-8 px-4 min-h-screen">
	<section class="grid items-start gap-6">
		<div class="flex max-w-[980px] flex-col items-start gap-4 pb-8">
			<h1 class="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
				Trouvez des producteurs locaux près de chez vous - Made in France
			</h1>
			<h2>Qui sommes nous?</h2>
			<p>OpenProduct est une association à but non-lucrative (loi 1901) qui souhaite promouvoir les <strong>producteurs locaux</strong> et les <strong>circuits courts</strong> en permettant à tous de trouver facilement les <strong>producteurs près de chez soi</strong> et de les contacter directement. Découvrez le <strong>made in France</strong> et soutenez l'agriculture locale de votre région.</p>
			<h2>Comment?</h2>
			<p>L'inscription et l'utilisation sont gratuites pour tous les producteurs afin de n'en laisser aucun de côté.</p>
			<p>La base de donnée est open-source et l'accès est libre et simple pour tous les utilisateurs sur notre site.</p>
			<h2>Le Financement</h2>
			<p>Les producteurs peuvent donner une cotisation annuelle libre et/ou adhérer à l'association. Celle-ci est mise en avant sur le site <a href={resolve("/about#bienfaiteurs")}>ici</a> de manière à sensibiliser le consommateur aux producteurs qui s'engagent. Cela fait office de publicité.</p>
			<p>Les consommateurs peuvent aussi faire un don déductible. Si vous voulez faire un don <a href="https://fr.ulule.com/openproduct/" target="_blank">ici</a>, soyez assuré de sa bonne utilisation. Nous vous en remerçions. Les documents administratifs et comptes sont publics et disponibles <a href="/documents.html">ici</a> ce qui vous assure qu'il y aura toujours du monde pour vérifier le bon usage de l'argent.</p>
			<p>Nous comptons aussi sur la communauté des utilisateurs pour nous aider à recenser tous les producteurs : Ecrivez nous par email à <a href="mailto:contact@openproduct.fr">contact@openproduct.fr</a> et devenez ambassadeur OpenProduct.</p>
			<h2>L'avenir</h2>
			<p>Nous souhaitons améliorer le site surtout son utilisation sur smartphone et à terme créer une application mobile mais cela demanderait plus d’argent surtout pour la publier sur les magasins d’applications.</p>
			<p>La priorité c’est aussi de faire connaître OpenProduct en diffusant des tracts aux producteurs et intermédiaires pour qu’ils nous fassent connaître auprès de leurs clients.</p>
			<p>Nous avons le projet de créer un label pour mettre un peu plus en valeur les producteurs qui jouent la carte de la transparence. Il permet au conssommateur d'avoir une certaine garantie que la production soit réellement locale. En effet, certains peuvent être tentés d'importer les produits et de ne faire localement qu'une infime partie du travail.</p>
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