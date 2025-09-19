<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Card from '$lib/components/ui/card';

	import * as Alert from '$lib/components/ui/alert';
	import { userSchema } from '$lib/config/zod-schemas';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { Loader2 } from 'lucide-svelte';
	import { AlertCircle } from 'lucide-svelte';

	const resetPasswordSchema = userSchema.pick({
		email: true
	});

	type ResetPasswordSchema = typeof resetPasswordSchema;

	interface Props {
		form: SuperValidated<ResetPasswordSchema>;
	}

	let { form }: Props = $props();
</script>

<div class="flex items-center justify-center mx-auto max-w-2xl">
	<Form.Root   method="POST" {form} schema={resetPasswordSchema} >
		{#snippet children({ submitting, errors, config })}
				<Card.Root>
				<Card.Header class="space-y-1">
					<Card.Title class="text-2xl">Reset Your Password</Card.Title>
					<Card.Description>Receive email instructions to reset your password.</Card.Description>
				</Card.Header>
				<Card.Content class="grid gap-4">
					{#if errors?._errors?.length}
						<Alert.Root variant="destructive">
							<AlertCircle class="h-4 w-4" />
							<Alert.Title>Reset password problem</Alert.Title>
							<Alert.Description>
								{#each errors._errors as error}
									{error}
								{/each}
							</Alert.Description>
						</Alert.Root>
					{/if}
					<Form.Field {config} name="email">
						<Form.Item>
							<Form.Label>Email</Form.Label>
							<Form.Input />
							<Form.Validation />
						</Form.Item>
					</Form.Field>
				</Card.Content>
				<Card.Footer>
					<div class="w-full">
						<Form.Button class="w-full" disabled={submitting}
							>{#if submitting}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								Please wait{:else}Send Password Reset Email{/if}
						</Form.Button>
					</div>
				</Card.Footer>
			</Card.Root>
					{/snippet}
		</Form.Root>
</div>
