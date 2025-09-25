<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Card from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert';
	import { Loader2, AlertCircle } from 'lucide-svelte';
	import { enhance } from '$app/forms';

	interface Props {
		form: {
			data: {
				email: string;
				password: string;
			};
			errors: Record<string, string>;
			valid: boolean;
		};
	}

	let { form }: Props = $props();
	let submitting = $state(false);
</script>

<div class="flex items-center justify-center mx-auto max-w-2xl">
	<form 
		method="POST" 
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				await update();
				submitting = false;
			};
		}}
	>
		<Card.Root>
			<Card.Header class="space-y-1">
				<Card.Title class="text-2xl">Sign in</Card.Title>
				<Card.Description>
					Enter your email below to sign in to your account
				</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-4">
				{#if form.errors.general}
					<Alert.Root variant="destructive">
						<AlertCircle class="h-4 w-4" />
						<Alert.Title>Error</Alert.Title>
						<Alert.Description>
							{form.errors.general}
						</Alert.Description>
					</Alert.Root>
				{/if}
				
				<div class="grid gap-2">
					<Form.Field>
						<Form.Label for="email">Email</Form.Label>
						<Form.Control let:attrs>
							<Form.Input
								{...attrs}
								id="email"
								name="email"
								type="email"
								placeholder="m@example.com"
								value={form.data.email}
								class={form.errors.email ? 'border-red-500' : ''}
							/>
						</Form.Control>
						{#if form.errors.email}
							<Form.FieldErrors class="text-red-500 text-sm">
								{form.errors.email}
							</Form.FieldErrors>
						{/if}
					</Form.Field>
				</div>
				
				<div class="grid gap-2">
					<Form.Field>
						<Form.Label for="password">Password</Form.Label>
						<Form.Control let:attrs>
							<Form.Input
								{...attrs}
								id="password"
								name="password"
								type="password"
								value={form.data.password}
								class={form.errors.password ? 'border-red-500' : ''}
							/>
						</Form.Control>
						{#if form.errors.password}
							<Form.FieldErrors class="text-red-500 text-sm">
								{form.errors.password}
							</Form.FieldErrors>
						{/if}
					</Form.Field>
				</div>
			</Card.Content>
			<Card.Footer>
				<Form.Button type="submit" class="w-full" disabled={submitting}>
					{#if submitting}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Signing in...
					{:else}
						Sign in
					{/if}
				</Form.Button>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
