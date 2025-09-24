<script lang="ts">
	import { Field } from "formsnap";
	import { cn } from "$lib/utils";
	import type { HTMLAttributes } from "svelte/elements";

	type $$Props = HTMLAttributes<HTMLSpanElement>;
	interface Props {
		class?: string | undefined | null;
		children?: import("svelte").Snippet;
	}

	let { class: className = undefined, children }: Props = $props();
</script>

<Field name="" let:description>
	<span {...description} class={cn("text-sm text-muted-foreground", className)}>
		{@render children?.()}
	</span>
</Field>
