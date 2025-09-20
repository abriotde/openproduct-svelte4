<script lang="ts">
	import { Label as FormLabel } from "formsnap";
	import { cn } from "$lib/utils";

	interface Props {
		class?: string | undefined | null;
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { class: className = undefined, children, ...rest }: Props = $props();
</script>

<FormLabel class={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...rest}>
	{@render children?.()}
</FormLabel>
