<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import * as Alert from '$lib/components/ui/alert';
	import { userSchema } from '$lib/config/zod-schemas';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import { Loader2 } from 'lucide-svelte';
	import { AlertCircle } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	const profileSchema = userSchema.pick({
		firstName: true,
		lastName: true,
		email: true
	});
	type ProfileSchema = typeof profileSchema;
	interface Props {
		data: any;
		form?: SuperValidated<Infer<ProfileSchema>>;
	}

	let { data, form = data.form }: Props = $props();
</script>

<div class="flex items-center justify-center mx-auto max-w-2xl">
	<Form.Root   method="POST" {form} schema={profileSchema} >
		{#snippet children({ submitting, errors, config })}
				<Card.Root>
				<Card.Header class="space-y-1">
					<Card.Title class="text-2xl">Profile</Card.Title>
					<Card.Description>Update your profile settings below.</Card.Description>
				</Card.Header>
				<Card.Content class="grid gap-4">
					{#if errors?._errors?.length}
						<Alert.Root variant="destructive">
							<AlertCircle class="h-4 w-4" />
							<Alert.Title>Error</Alert.Title>
							<Alert.Description>
								{#each errors._errors as error}
									{error}
								{/each}
							</Alert.Description>
						</Alert.Root>
					{/if}
					<Form.Field {config} name="firstName">
						<Form.Item>
							<Form.Label>First Name</Form.Label>
							<Form.Input />
							<Form.Validation />
						</Form.Item>
					</Form.Field>
					<Form.Field {config} name="lastName">
						<Form.Item>
							<Form.Label>Last Name</Form.Label>
							<Form.Input />
							<Form.Validation />
						</Form.Item>
					</Form.Field>
					<Form.Field {config} name="email">
						<Form.Item>
							<Form.Label>Email</Form.Label>
							<Form.Input />
							<Form.Validation />
						</Form.Item>
					</Form.Field>
				</Card.Content>
				<Card.Footer>
					<div class="block w-full">
						<Form.Button class="w-full" disabled={submitting}
							>{#if submitting}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								Please wait
							{:else}
								Update profile
							{/if}
						</Form.Button>
						<div class="mt-6 text-center text-sm">
							<Button on:click={() => goto('/auth/password/reset')} class="w-full" variant="outline"
								>Change your password</Button
							>
						</div>
					</div>
				</Card.Footer>
			</Card.Root>
					{/snippet}
		</Form.Root>
</div>
