<script lang="ts">
	import { Toggle as TogglePrimitive } from "bits-ui";
	import { toggleVariants, type Variant, type Size } from ".";
	import { cn } from "$lib/utils";

	type $$Props = TogglePrimitive.Props & {
		variant?: Variant;
		size?: Size;
	};
	type $$Events = TogglePrimitive.Events;

	interface Props {
		class?: $$Props["class"];
		variant?: $$Props["variant"];
		size?: $$Props["size"];
		pressed?: $$Props["pressed"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let {
		class: className = undefined,
		variant = "default",
		size = "default",
		pressed = $bindable(undefined),
		children,
		...rest
	}: Props = $props();
	
</script>

<TogglePrimitive.Root
	bind:pressed
	class={cn(toggleVariants({ variant, size, className }))}
	{...rest}
	on:click
>
	{@render children?.()}
</TogglePrimitive.Root>
