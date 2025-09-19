<script lang="ts">
	import { Menubar as MenubarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils";
	import { ChevronRight } from "lucide-svelte";

	type $$Props = MenubarPrimitive.SubTriggerProps & {
		inset?: boolean;
	};
	type $$Events = MenubarPrimitive.SubTriggerEvents;

	interface Props {
		class?: $$Props["class"];
		inset?: $$Props["inset"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { class: className = undefined, inset = undefined, children, ...rest }: Props = $props();
	
</script>

<MenubarPrimitive.SubTrigger
	class={cn(
		"flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
		inset && "pl-8",
		className
	)}
	on:click
	{...rest}
	on:keydown
	on:focusin
	on:focusout
	on:pointerleave
	on:pointermove
>
	{@render children?.()}
	<ChevronRight class="ml-auto h-4 w-4" />
</MenubarPrimitive.SubTrigger>
