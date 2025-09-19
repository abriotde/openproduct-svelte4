<script lang="ts">
	import { cn } from "$lib/utils";
	import { MoreHorizontal } from "lucide-svelte";
	import type { HTMLAttributes } from "svelte/elements";

	type $$Props = HTMLAttributes<HTMLSpanElement>;

	interface Props {
		class?: $$Props["class"];
		[key: string]: any
	}

	let { class: className = undefined, ...rest }: Props = $props();
	
</script>

<span
	aria-hidden
	class={cn("flex h-9 w-9 items-center justify-center", className)}
	{...rest}
>
	<MoreHorizontal class="h-4 w-4" />
	<span class="sr-only">More pages</span>
</span>
