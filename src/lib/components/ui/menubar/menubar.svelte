<script lang="ts">
	import { Menubar as MenubarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils";

	type $$Props = MenubarPrimitive.Props;

	interface Props {
		class?: $$Props["class"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { class: className = undefined, children, ...rest }: Props = $props();
	
</script>

<MenubarPrimitive.Root
	class={cn(
		"flex h-10 items-center space-x-1 rounded-md border bg-background p-1",
		className
	)}
	{...rest}
>
	{@render children?.()}
</MenubarPrimitive.Root>
