<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Card from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert';
	import { userSchema } from '$lib/config/zod-schemas';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { Loader2, AlertCircle } from 'lucide-svelte';

	const signInSchema = userSchema.pick({
		email: true,
		password: true
	});

	type SignInSchema = typeof signInSchema;

	interface Props {
		form: SuperValidated<SignInSchema>;
	}

	let { form }: Props = $props();

	const { form: formData, enhance, errors, submitting } = superForm(form, {
		validators: zodClient(signInSchema)
	});
</script>

<div class="flex items-center justify-center mx-auto max-w-2xl">
	<form method="POST" use:enhance>
		<Card.Root>
			<Card.Header class="space-y-1">
				<Card.Title class="text-2xl">Sign in</Card.Title>
				<Card.Description>
					Don't have an account yet? <a href="/auth/sign-up" class="underline">Sign up here.</a>
				</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-4">
				{#if $errors?._errors?.length}
					<Alert.Root variant="destructive">
						<AlertCircle class="h-4 w-4" />
						<Alert.Title>Error</Alert.Title>
						<Alert.Description>
							{#each $errors._errors as error}
								{error}
							{/each}
						</Alert.Description>
					</Alert.Root>
				{/if}
				
				<Form.Field form={formData} name="email">
					{#snippet children()}
						<Form.Item>
							<Form.Label>Email</Form.Label>
							<Form.Control>
								{#snippet children()}
									<Form.Input type="email" />
								{/snippet}
							</Form.Control>
							<Form.Validation />
						</Form.Item>
					{/snippet}
				</Form.Field>

				<Form.Field form={formData} name="password">
					{#snippet children()}
						<Form.Item>
							<Form.Label>Password</Form.Label>
							<Form.Control>
								{#snippet children()}
									<Form.Input type="password" />
								{/snippet}
							</Form.Control>
							<Form.Validation />
						</Form.Item>
					{/snippet}
				</Form.Field>
			</Card.Content>
			<Card.Footer>
				<div class="block w-full">
					<Form.Button class="w-full" disabled={$submitting}>
						{#if $submitting}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Please wait
						{:else}
							Sign In
						{/if}
					</Form.Button>

					<div class="mt-6 text-center text-sm">
						<a href="/auth/password/reset" class="underline">Forgot your password?</a>
					</div>
				</div>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
