<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let mapContainer: HTMLDivElement;
	let filterSelect: HTMLSelectElement;

	onMount(async () => {
		if (browser) {
			// Charger Leaflet via CDN
			await loadLeaflet();
			initializeMap();
		}
	});

	async function loadLeaflet() {
		// Charger le CSS de Leaflet
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
		document.head.appendChild(link);

		// Charger le JS de Leaflet
		return new Promise((resolve) => {
			const script = document.createElement('script');
			script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
			script.onload = resolve;
			document.head.appendChild(script);
		});
	}

	function initializeMap() {
		// @ts-ignore
		const L = window.L;
		
		// Initialiser la carte
		const map = L.map(mapContainer).setView([45.7640, 4.8357], 12);

		// Ajouter la couche de tuiles OpenStreetMap
		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(map);

		// Créer des icônes personnalisées
		function createIcon(color: string) {
			const markerHtmlStyles = `
				background-color: ${color};
				width: 2rem;
				height: 2rem;
				display: block;
				left: -1rem;
				top: -1rem;
				position: relative;
				border-radius: 2rem 2rem 0;
				transform: rotate(45deg);
				border: 1px solid #FFFFFF`;

			return L.divIcon({
				className: "openproduct-pin",
				html: `<span style="${markerHtmlStyles}"></span>`
			});
		}

		const icons = {
			green: createIcon("#0a6b1d"),    // Alimentaire
			yellow: createIcon("#fcba03"),   // Habillement
			blue: createIcon("#0a106b"),     // Artisans
			red: createIcon("#990000"),      // Produits
			cyan: createIcon("#359396"),     // PME
			black: createIcon("#000000")     // Défaut
		};

		// Données de test des producteurs
		const producers = [
			{
				id: 1,
				name: "Ferme Bio du Rhône",
				lat: 45.7640,
				lng: 4.8357,
				cat: "A",
				txt: "Producteur de légumes biologiques et de fruits de saison. Vente directe à la ferme et sur les marchés locaux.",
				addr: "123 Route de la Ferme",
				postcode: "69000",
				city: "Lyon",
				tel: "0478123456",
				email: "contact@ferme-bio-rhone.fr",
				web: "https://ferme-bio-rhone.fr"
			},
			{
				id: 2,
				name: "Atelier Textile Local",
				lat: 45.7489,
				lng: 4.8467,
				cat: "H",
				txt: "Confection artisanale de vêtements en tissus biologiques et équitables. Réparation et retouches.",
				addr: "45 Rue des Artisans",
				postcode: "69001",
				city: "Lyon",
				tel: "0478654321",
				email: "info@atelier-textile.fr",
				web: "https://atelier-textile-local.fr"
			},
			{
				id: 3,
				name: "Menuiserie Traditionnelle",
				lat: 45.7311,
				lng: 4.8186,
				cat: "O",
				txt: "Fabrication de meubles en bois massif, restauration d'anciens meubles. Travail artisanal sur mesure.",
				addr: "78 Avenue du Bois",
				postcode: "69002",
				city: "Lyon",
				tel: "0478987654",
				email: "contact@menuiserie-trad.fr",
				web: "https://menuiserie-traditionnelle.fr"
			}
		];

		let markers: any[] = [];

		function getIcon(category: string) {
			switch (category) {
				case 'A': return icons.green;   // Alimentaire
				case 'H': return icons.yellow;  // Habillement
				case 'O': return icons.blue;    // Artisans
				case 'P': return icons.red;     // Produits
				case 'I': return icons.cyan;    // PME
				default: return icons.black;
			}
		}

		function formatTel(tel: string) {
			return tel.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
		}

		function createPopupContent(producer: any) {
			let content = `<h3>${producer.name}</h3>`;
			if (producer.web) {
				content += `<a href="${producer.web}" target="_blank">Site web</a><br>`;
			}
			content += `<p>${producer.txt}</p>`;
			if (producer.email) {
				content += `Email: <a href="mailto:${producer.email}">${producer.email}</a><br>`;
			}
			if (producer.tel) {
				content += `Tél: <a href="tel:${producer.tel}">${formatTel(producer.tel)}</a><br>`;
			}
			if (producer.addr) {
				content += `Adresse: ${producer.addr}`;
				if (producer.postcode && producer.city) {
					content += ` - ${producer.postcode} ${producer.city}`;
				}
				content += '<br>';
			}
			return content;
		}

		function displayProducers(filter = '') {
			// Supprimer les marqueurs existants
			markers.forEach(marker => map.removeLayer(marker));
			markers = [];

			// Filtrer et afficher les producteurs
			producers.forEach(producer => {
				let shouldShow = true;
				
				if (filter) {
					if (filter === '_A') {
						// Tout sauf alimentaire
						shouldShow = producer.cat !== 'A';
					} else {
						shouldShow = producer.cat === filter;
					}
				}

				if (shouldShow) {
					const marker = L.marker([producer.lat, producer.lng], {
						icon: getIcon(producer.cat)
					});
					
					marker.bindPopup(createPopupContent(producer));
					marker.addTo(map);
					markers.push(marker);
				}
			});
		}

		// Afficher tous les producteurs au démarrage
		displayProducers();

		// Gérer le changement de filtre
		function handleFilterChange() {
			const selectedValue = filterSelect.value;
			displayProducers(selectedValue);
		}

		// Attacher l'événement de changement de filtre
		if (filterSelect) {
			filterSelect.addEventListener('change', handleFilterChange);
		}
	}
</script>

<svelte:head>
	<title>OpenProduct - Carte des producteurs</title>
	<meta name="description" content="Carte interactive des producteurs locaux OpenProduct" />
</svelte:head>

<div class="container mx-auto p-4">
	<h1 class="text-3xl font-bold mb-6">Carte des producteurs</h1>
	
	<div class="mb-4 flex flex-wrap gap-4 items-center">
		<div class="flex items-center gap-2">
			<label for="categoryFilter" class="font-medium">Filtre :</label>
			<select 
				bind:this={filterSelect}
				id="categoryFilter" 
				class="border border-gray-300 rounded px-3 py-1"
			>
				<option value="">Toutes</option>
				<option value="A">Alimentaire</option>
				<option value="_A">Tout sauf alimentaire</option>
				<option value="H">Habillement</option>
				<option value="3">Produits ménagers / de beauté / médicinal</option>
				<option value="4">Plantes (Fleurs, arbustes)</option>
				<option value="O">Artisans / Artistes</option>
				<option value="I">Petites et moyennes entreprises (PME)</option>
			</select>
		</div>
	</div>

	<div 
		bind:this={mapContainer}
		class="w-full h-96 md:h-[600px] border border-gray-300 rounded-lg"
		style="min-height: 400px;"
	></div>
</div>

<style>
	:global(.openproduct-pin) {
		background: transparent !important;
		border: none !important;
	}
</style>

