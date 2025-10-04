<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { producerSchema } from '$lib/config/zod-schemas.js';
	import { CircleAlert, CircleCheck, User, Building2, MapPin, Phone, Globe, Hash } from 'lucide-svelte';
	import type { PageData } from './$types.js';

	export let data: PageData;

	const { form, errors, enhance, submitting, message } = superForm(
		data.form,
		{
			validators: zodClient(producerSchema),
			resetForm: false,
			onUpdated: ({ form }) => {
				if (form.valid) {
					showSuccessMessage = true;
					setTimeout(() => {
						showSuccessMessage = false;
					}, 5000);
				}
			},
			dataType: 'json'
		}
	);

	let showSuccessMessage = false;

	const categories = [
		{ value: 'A', label: 'Alimentaire', color: 'bg-green-100 text-green-800' },
		{ value: 'H', label: 'Habillement', color: 'bg-yellow-100 text-yellow-800' },
		{ value: 'O', label: 'Artisans / Artistes', color: 'bg-blue-100 text-blue-800' },
		{ value: 'P', label: 'Produits ménagers / beauté', color: 'bg-red-100 text-red-800' },
		{ value: 'I', label: 'PME', color: 'bg-cyan-100 text-cyan-800' }
	];
</script>

<svelte:head>
	<title>Tableau de bord - Profil Producteur</title>
</svelte:head>

<div class="container mx-auto py-8 px-4">
	<div class="max-w-4xl mx-auto">
		<!-- En-tête -->
		<div class="mb-8">
			<h1 class="h1">Tableau de bord</h1>
			<p class="text-surface-600-300-token mt-2">
				Gérez votre profil de producteur et vos informations publiques
			</p>
		</div>

		<!-- Message de succès -->
		{#if showSuccessMessage}
			<aside class="alert variant-filled-success mb-6">
				<div class="alert-message flex items-center gap-2">
					<CircleCheck class="h-5 w-5" />
					<span>Profil sauvegardé avec succès !</span>
				</div>
			</aside>
		{/if}

		<!-- Message d'erreur global -->
		{#if $message}
			<aside class="alert variant-filled-error mb-6">
				<div class="alert-message flex items-center gap-2">
					<CircleAlert class="h-5 w-5" />
					<span>{$message}</span>
				</div>
			</aside>
		{/if}

		<!-- Informations utilisateur -->
		<div class="card mb-8">
			<header class="card-header">
				<h2 class="h3 flex items-center gap-2">
					<User class="h-5 w-5" />
					Informations du compte
				</h2>
				<p class="text-surface-600-300-token mt-1">
					Connecté en tant que {data.user.firstName} {data.user.lastName}
				</p>
			</header>
			<section class="card-body p-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
					<div>
						<span class="font-medium">Email :</span> {data.user.email}
					</div>
					<div>
						<span class="font-medium">Statut :</span>
						<span class="badge {data.producer ? 'variant-filled-primary' : 'variant-soft-surface'} ml-2">
							{data.producer ? 'Profil producteur créé' : 'Nouveau producteur'}
						</span>
					</div>
				</div>
			</section>
		</div>

		<!-- Formulaire de profil producteur -->
		<form method="POST" use:enhance>
			<div class="space-y-8">
				<!-- Informations de base -->
				<div class="card">
					<header class="card-header">
						<h2 class="h3 flex items-center gap-2">
							<Building2 class="h-5 w-5" />
							Informations de base
						</h2>
						<p class="text-surface-600-300-token mt-1">
							Informations principales de votre entreprise
						</p>
					</header>
					<section class="card-body p-4 space-y-4">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div class="md:col-span-2">
								<label class="label">
									<span class="font-semibold">Nom de l'entreprise *</span>
									<input
										class="input px-4 py-2 rounded-lg {$errors.companyName ? 'input-error border-error-500' : ''}"
										type="text"
										name="companyName"
										bind:value={$form.companyName}
										placeholder="Ex: Boulangerie Martin"
										disabled={$submitting}
									/>
									{#if $errors.companyName}
										<small class="text-error-500 text-sm mt-1">{$errors.companyName}</small>
									{/if}
								</label>
							</div>

							<div>
								<label class="label">
									<span class="font-semibold">Prénom</span>
									<input
										class="input px-4 py-2 rounded-lg {$errors.firstName ? 'input-error border-error-500' : ''}"
										type="text"
										name="firstName"
										bind:value={$form.firstName}
										placeholder="Jean"
										disabled={$submitting}
									/>
									{#if $errors.firstName}
										<small class="text-error-500 text-sm mt-1">{$errors.firstName}</small>
									{/if}
								</label>
							</div>

							<div>
								<label class="label">
									<span class="font-semibold">Nom</span>
									<input
										class="input px-4 py-2 rounded-lg {$errors.lastName ? 'input-error border-error-500' : ''}"
										type="text"
										name="lastName"
										bind:value={$form.lastName}
										placeholder="Martin"
										disabled={$submitting}
									/>
									{#if $errors.lastName}
										<small class="text-error-500 text-sm mt-1">{$errors.lastName}</small>
									{/if}
								</label>
							</div>

							<div class="md:col-span-2">
								<label class="label">
									<span class="font-semibold">Catégorie</span>
									<select
										class="select px-4 py-2 rounded-lg {$errors.category ? 'input-error border-error-500' : ''}"
										name="category"
										bind:value={$form.category}
										disabled={$submitting}
									>
										<option value="">Sélectionnez une catégorie</option>
										{#each categories as category}
											<option value={category.value}>{category.label}</option>
										{/each}
									</select>
									{#if $errors.category}
										<small class="text-error-500 text-sm mt-1">{$errors.category}</small>
									{/if}
								</label>
							</div>
						</div>
					</section>
				</div>

				<!-- Descriptions -->
				<div class="card">
					<header class="card-header">
						<h2 class="h3">Descriptions</h2>
						<p class="text-surface-600-300-token mt-1">
							Décrivez votre activité et vos produits
						</p>
					</header>
					<section class="card-body p-4 space-y-4">
						<div>
							<label class="label">
								<span class="font-semibold">Description courte</span>
								<input
									class="input px-4 py-2 rounded-lg {$errors.shortDescription ? 'input-error border-error-500' : ''}"
									type="text"
									name="shortDescription"
									bind:value={$form.shortDescription}
									placeholder="Boulangerie artisanale, pains et viennoiseries bio"
									maxlength="200"
									disabled={$submitting}
								/>
								<small class="text-surface-500 text-xs mt-1">
									{$form.shortDescription?.length || 0}/200 caractères
								</small>
								{#if $errors.shortDescription}
									<small class="text-error-500 text-sm mt-1">{$errors.shortDescription}</small>
								{/if}
							</label>
						</div>

						<div>
							<label class="label">
								<span class="font-semibold">Description détaillée</span>
								<textarea
									class="textarea px-4 py-2 rounded-lg {$errors.description ? 'input-error border-error-500' : ''}"
									name="description"
									bind:value={$form.description}
									placeholder="Décrivez en détail votre activité, vos produits, votre savoir-faire..."
									rows="4"
									maxlength="1000"
									disabled={$submitting}
								></textarea>
								<small class="text-surface-500 text-xs mt-1">
									{$form.description?.length || 0}/1000 caractères
								</small>
								{#if $errors.description}
									<small class="text-error-500 text-sm mt-1">{$errors.description}</small>
								{/if}
							</label>
						</div>
					</section>
				</div>

				<!-- Adresse -->
				<div class="card">
					<header class="card-header">
						<h2 class="h3 flex items-center gap-2">
							<MapPin class="h-5 w-5" />
							Adresse
						</h2>
						<p class="text-surface-600-300-token mt-1">
							Localisation de votre entreprise
						</p>
					</header>
					<section class="card-body p-4 space-y-4">
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div class="md:col-span-3">
								<label class="label">
									<span class="font-semibold">Adresse</span>
									<input
										class="input px-4 py-2 rounded-lg {$errors.address ? 'input-error border-error-500' : ''}"
										type="text"
										name="address"
										bind:value={$form.address}
										placeholder="123 Rue de la Boulangerie"
										disabled={$submitting}
									/>
									{#if $errors.address}
										<small class="text-error-500 text-sm mt-1">{$errors.address}</small>
									{/if}
								</label>
							</div>

							<div>
								<label class="label">
									<span class="font-semibold">Code postal</span>
									<input
										class="input px-4 py-2 rounded-lg {$errors.postCode ? 'input-error border-error-500' : ''}"
										type="text"
										name="postCode"
										bind:value={$form.postCode}
										placeholder="69000"
										maxlength="5"
										disabled={$submitting}
									/>
									{#if $errors.postCode}
										<small class="text-error-500 text-sm mt-1">{$errors.postCode}</small>
									{/if}
								</label>
							</div>

							<div class="md:col-span-2">
								<label class="label">
									<span class="font-semibold">Ville</span>
									<input
										class="input px-4 py-2 rounded-lg {$errors.city ? 'input-error border-error-500' : ''}"
										type="text"
										name="city"
										bind:value={$form.city}
										placeholder="Lyon"
										disabled={$submitting}
									/>
									{#if $errors.city}
										<small class="text-error-500 text-sm mt-1">{$errors.city}</small>
									{/if}
								</label>
							</div>
						</div>
					</section>
				</div>

				<!-- Contact -->
				<div class="card">
					<header class="card-header">
						<h2 class="h3 flex items-center gap-2">
							<Phone class="h-5 w-5" />
							Contact
						</h2>
						<p class="text-surface-600-300-token mt-1">
							Moyens de contact pour vos clients
						</p>
					</header>
					<section class="card-body p-4 space-y-4">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label class="label">
									<span class="font-semibold">Téléphone principal</span>
									<input
										class="input px-4 py-2 rounded-lg {$errors.phoneNumber1 ? 'input-error border-error-500' : ''}"
										type="tel"
										name="phoneNumber1"
										bind:value={$form.phoneNumber1}
										placeholder="0123456789"
										disabled={$submitting}
									/>
									{#if $errors.phoneNumber1}
										<small class="text-error-500 text-sm mt-1">{$errors.phoneNumber1}</small>
									{/if}
								</label>
							</div>

							<div>
								<label class="label">
									<span class="font-semibold">Téléphone secondaire</span>
									<input
										class="input px-4 py-2 rounded-lg {$errors.phoneNumber2 ? 'input-error border-error-500' : ''}"
										type="tel"
										name="phoneNumber2"
										bind:value={$form.phoneNumber2}
										placeholder="0123456789"
										disabled={$submitting}
									/>
									{#if $errors.phoneNumber2}
										<small class="text-error-500 text-sm mt-1">{$errors.phoneNumber2}</small>
									{/if}
								</label>
							</div>
						</div>
					</section>
				</div>

				<!-- Sites web -->
				<div class="card">
					<header class="card-header">
						<h2 class="h3 flex items-center gap-2">
							<Globe class="h-5 w-5" />
							Sites web
						</h2>
						<p class="text-surface-600-300-token mt-1">
							Jusqu'à 3 sites web (optionnel)
						</p>
					</header>
					<section class="card-body p-4 space-y-4">
						<div>
							<label class="label">
								<span class="font-semibold">Site web principal</span>
								<input
									class="input px-4 py-2 rounded-lg {$errors.website1 ? 'input-error border-error-500' : ''}"
									type="url"
									name="website1"
									bind:value={$form.website1}
									placeholder="https://www.monsite.fr"
									disabled={$submitting}
								/>
								{#if $errors.website1}
									<small class="text-error-500 text-sm mt-1">{$errors.website1}</small>
								{/if}
							</label>
						</div>

						<div>
							<label class="label">
								<span class="font-semibold">Site web secondaire</span>
								<input
									class="input px-4 py-2 rounded-lg {$errors.website2 ? 'input-error border-error-500' : ''}"
									type="url"
									name="website2"
									bind:value={$form.website2}
									placeholder="https://www.boutique.fr"
									disabled={$submitting}
								/>
								{#if $errors.website2}
									<small class="text-error-500 text-sm mt-1">{$errors.website2}</small>
								{/if}
							</label>
						</div>

						<div>
							<label class="label">
								<span class="font-semibold">Site web tertiaire</span>
								<input
									class="input px-4 py-2 rounded-lg {$errors.website3 ? 'input-error border-error-500' : ''}"
									type="url"
									name="website3"
									bind:value={$form.website3}
									placeholder="https://www.reseausocial.fr"
									disabled={$submitting}
								/>
								{#if $errors.website3}
									<small class="text-error-500 text-sm mt-1">{$errors.website3}</small>
								{/if}
							</label>
						</div>
					</section>
				</div>

				<!-- Informations légales -->
				<div class="card">
					<header class="card-header">
						<h2 class="h3 flex items-center gap-2">
							<Hash class="h-5 w-5" />
							Informations légales
						</h2>
						<p class="text-surface-600-300-token mt-1">
							Informations administratives (optionnel)
						</p>
					</header>
					<section class="card-body p-4">
						<div>
							<label class="label">
								<span class="font-semibold">Numéro SIRET</span>
								<input
									class="input px-4 py-2 rounded-lg {$errors.siretNumber ? 'input-error border-error-500' : ''}"
									type="text"
									name="siretNumber"
									bind:value={$form.siretNumber}
									placeholder="12345678901234"
									maxlength="14"
									disabled={$submitting}
								/>
								<small class="text-surface-500 text-xs mt-1">
									14 chiffres sans espaces
								</small>
								{#if $errors.siretNumber}
									<small class="text-error-500 text-sm mt-1">{$errors.siretNumber}</small>
								{/if}
							</label>
						</div>
					</section>
				</div>

				<!-- Boutons d'action -->
				<div class="flex justify-end space-x-4">
					<button
						type="submit"
						class="btn variant-filled-primary min-w-32"
						disabled={$submitting}
					>
						{#if $submitting}
							<span class="animate-spin mr-2">⏳</span>
							Sauvegarde...
						{:else}
							Sauvegarder
						{/if}
					</button>
				</div>
			</div>
		</form>
	</div>
</div>
