<script lang="ts">
	import { FieldErrors } from "formsnap";
	import { cn } from "$lib/utils";
	import type { HTMLAttributes } from "svelte/elements";

	type $$Props = HTMLAttributes<HTMLParagraphElement>;
	interface Props {
		class?: string | undefined | null;
	}

	let { class: className = undefined }: Props = $props();
</script>

<FieldErrors class={cn("text-sm font-medium text-destructive", className)} />

