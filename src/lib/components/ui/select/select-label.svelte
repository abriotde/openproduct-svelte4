<script lang="ts">
	import { Select as SelectPrimitive } from "bits-ui";
	import { cn } from "$lib/utils";

	type $$Props = SelectPrimitive.GroupLabelProps;

	interface Props {
		class?: $$Props["class"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { class: className = undefined, children, ...rest }: Props = $props();
	
</script>

<SelectPrimitive.GroupLabel
	class={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
	{...rest}
>
	{@render children?.()}
</SelectPrimitive.GroupLabel>
