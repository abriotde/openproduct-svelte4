<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { producerSchema } from '$lib/config/zod-schemas.js';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
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
			<h1 class="text-3xl font-bold tracking-tight">Tableau de bord</h1>
			<p class="text-muted-foreground mt-2">
				Gérez votre profil de producteur et vos informations publiques
			</p>
		</div>

		<!-- Message de succès -->
		{#if showSuccessMessage}
			<div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
				<CircleCheck class="h-5 w-5 text-green-600" />
				<span class="text-green-800">Profil sauvegardé avec succès !</span>
			</div>
		{/if}

		<!-- Message d'erreur global -->
		{#if $message}
			<div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
				<CircleAlert class="h-5 w-5 text-red-600" />
				<span class="text-red-800">{$message}</span>
			</div>
		{/if}

		<!-- Informations utilisateur -->
		<Card class="mb-8">
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<User class="h-5 w-5" />
					Informations du compte
				</CardTitle>
				<CardDescription>
					Connecté en tant que {data.user.firstName} {data.user.lastName}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
					<div>
						<span class="font-medium">Email :</span> {data.user.email}
					</div>
					<div>
						<span class="font-medium">Statut :</span>
						<Badge variant={data.producer ? 'default' : 'secondary'} class="ml-2">
							{data.producer ? 'Profil producteur créé' : 'Nouveau producteur'}
						</Badge>
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- Formulaire de profil producteur -->
		<form method="POST" use:enhance>
			<div class="space-y-8">
				<!-- Informations de base -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<Building2 class="h-5 w-5" />
							Informations de base
						</CardTitle>
						<CardDescription>
							Informations principales de votre entreprise
						</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div class="md:col-span-2">
								<Label for="companyName">Nom de l'entreprise *</Label>
								<Input
									id="companyName"
									name="companyName"
									bind:value={$form.companyName}
									class={$errors.companyName ? 'border-red-500' : ''}
									placeholder="Ex: Boulangerie Martin"
								/>
								{#if $errors.companyName}
									<p class="text-sm text-red-600 mt-1">{$errors.companyName}</p>
								{/if}
							</div>

							<div>
								<Label for="firstName">Prénom</Label>
								<Input
									id="firstName"
									name="firstName"
									bind:value={$form.firstName}
									class={$errors.firstName ? 'border-red-500' : ''}
									placeholder="Jean"
								/>
								{#if $errors.firstName}
									<p class="text-sm text-red-600 mt-1">{$errors.firstName}</p>
								{/if}
							</div>

							<div>
								<Label for="lastName">Nom</Label>
								<Input
									id="lastName"
									name="lastName"
									bind:value={$form.lastName}
									class={$errors.lastName ? 'border-red-500' : ''}
									placeholder="Martin"
								/>
								{#if $errors.lastName}
									<p class="text-sm text-red-600 mt-1">{$errors.lastName}</p>
								{/if}
							</div>

							<div class="md:col-span-2">
								<Label for="category">Catégorie</Label>
								<select
									id="category"
									name="category"
									bind:value={$form.category}
									class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 {$errors.category ? 'border-red-500' : ''}"
								>
									<option value="">Sélectionnez une catégorie</option>
									{#each categories as category}
										<option value={category.value}>{category.label}</option>
									{/each}
								</select>
								{#if $errors.category}
									<p class="text-sm text-red-600 mt-1">{$errors.category}</p>
								{/if}
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- Descriptions -->
				<Card>
					<CardHeader>
						<CardTitle>Descriptions</CardTitle>
						<CardDescription>
							Décrivez votre activité et vos produits
						</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div>
							<Label for="shortDescription">Description courte</Label>
							<Input
								id="shortDescription"
								name="shortDescription"
								bind:value={$form.shortDescription}
								class={$errors.shortDescription ? 'border-red-500' : ''}
								placeholder="Boulangerie artisanale, pains et viennoiseries bio"
								maxlength="200"
							/>
							<p class="text-xs text-muted-foreground mt-1">
								{$form.shortDescription?.length || 0}/200 caractères
							</p>
							{#if $errors.shortDescription}
								<p class="text-sm text-red-600 mt-1">{$errors.shortDescription}</p>
							{/if}
						</div>

						<div>
							<Label for="description">Description détaillée</Label>
							<Textarea
								id="description"
								name="description"
								bind:value={$form.description}
								class={$errors.description ? 'border-red-500' : ''}
								placeholder="Décrivez en détail votre activité, vos produits, votre savoir-faire..."
								rows="4"
								maxlength="1000"
							/>
							<p class="text-xs text-muted-foreground mt-1">
								{$form.description?.length || 0}/1000 caractères
							</p>
							{#if $errors.description}
								<p class="text-sm text-red-600 mt-1">{$errors.description}</p>
							{/if}
						</div>
					</CardContent>
				</Card>

				<!-- Adresse -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<MapPin class="h-5 w-5" />
							Adresse
						</CardTitle>
						<CardDescription>
							Localisation de votre entreprise
						</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div class="md:col-span-3">
								<Label for="address">Adresse</Label>
								<Input
									id="address"
									name="address"
									bind:value={$form.address}
									class={$errors.address ? 'border-red-500' : ''}
									placeholder="123 Rue de la Boulangerie"
								/>
								{#if $errors.address}
									<p class="text-sm text-red-600 mt-1">{$errors.address}</p>
								{/if}
							</div>

							<div>
								<Label for="postCode">Code postal</Label>
								<Input
									id="postCode"
									name="postCode"
									bind:value={$form.postCode}
									class={$errors.postCode ? 'border-red-500' : ''}
									placeholder="69000"
									maxlength="5"
								/>
								{#if $errors.postCode}
									<p class="text-sm text-red-600 mt-1">{$errors.postCode}</p>
								{/if}
							</div>

							<div class="md:col-span-2">
								<Label for="city">Ville</Label>
								<Input
									id="city"
									name="city"
									bind:value={$form.city}
									class={$errors.city ? 'border-red-500' : ''}
									placeholder="Lyon"
								/>
								{#if $errors.city}
									<p class="text-sm text-red-600 mt-1">{$errors.city}</p>
								{/if}
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- Contact -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<Phone class="h-5 w-5" />
							Contact
						</CardTitle>
						<CardDescription>
							Moyens de contact pour vos clients
						</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label for="phoneNumber1">Téléphone principal</Label>
								<Input
									id="phoneNumber1"
									name="phoneNumber1"
									bind:value={$form.phoneNumber1}
									class={$errors.phoneNumber1 ? 'border-red-500' : ''}
									placeholder="0123456789"
									type="tel"
								/>
								{#if $errors.phoneNumber1}
									<p class="text-sm text-red-600 mt-1">{$errors.phoneNumber1}</p>
								{/if}
							</div>

							<div>
								<Label for="phoneNumber2">Téléphone secondaire</Label>
								<Input
									id="phoneNumber2"
									name="phoneNumber2"
									bind:value={$form.phoneNumber2}
									class={$errors.phoneNumber2 ? 'border-red-500' : ''}
									placeholder="0123456789"
									type="tel"
								/>
								{#if $errors.phoneNumber2}
									<p class="text-sm text-red-600 mt-1">{$errors.phoneNumber2}</p>
								{/if}
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- Sites web -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<Globe class="h-5 w-5" />
							Sites web
						</CardTitle>
						<CardDescription>
							Jusqu'à 3 sites web (optionnel)
						</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div>
							<Label for="website1">Site web principal</Label>
							<Input
								id="website1"
								name="website1"
								bind:value={$form.website1}
								class={$errors.website1 ? 'border-red-500' : ''}
								placeholder="https://www.monsite.fr"
								type="url"
							/>
							{#if $errors.website1}
								<p class="text-sm text-red-600 mt-1">{$errors.website1}</p>
							{/if}
						</div>

						<div>
							<Label for="website2">Site web secondaire</Label>
							<Input
								id="website2"
								name="website2"
								bind:value={$form.website2}
								class={$errors.website2 ? 'border-red-500' : ''}
								placeholder="https://www.boutique.fr"
								type="url"
							/>
							{#if $errors.website2}
								<p class="text-sm text-red-600 mt-1">{$errors.website2}</p>
							{/if}
						</div>

						<div>
							<Label for="website3">Site web tertiaire</Label>
							<Input
								id="website3"
								name="website3"
								bind:value={$form.website3}
								class={$errors.website3 ? 'border-red-500' : ''}
								placeholder="https://www.reseausocial.fr"
								type="url"
							/>
							{#if $errors.website3}
								<p class="text-sm text-red-600 mt-1">{$errors.website3}</p>
							{/if}
						</div>
					</CardContent>
				</Card>

				<!-- Informations légales -->
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<Hash class="h-5 w-5" />
							Informations légales
						</CardTitle>
						<CardDescription>
							Informations administratives (optionnel)
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div>
							<Label for="siretNumber">Numéro SIRET</Label>
							<Input
								id="siretNumber"
								name="siretNumber"
								bind:value={$form.siretNumber}
								class={$errors.siretNumber ? 'border-red-500' : ''}
								placeholder="12345678901234"
								maxlength="14"
							/>
							<p class="text-xs text-muted-foreground mt-1">
								14 chiffres sans espaces
							</p>
							{#if $errors.siretNumber}
								<p class="text-sm text-red-600 mt-1">{$errors.siretNumber}</p>
							{/if}
						</div>
					</CardContent>
				</Card>

				<!-- Boutons d'action -->
				<div class="flex justify-end space-x-4">
					<Button type="submit" disabled={$submitting} class="min-w-32">
						{#if $submitting}
							Sauvegarde...
						{:else}
							Sauvegarder
						{/if}
					</Button>
				</div>
			</div>
		</form>
	</div>
</div>

<style>
	:global(.container) {
		max-width: 100%;
	}
</style>

