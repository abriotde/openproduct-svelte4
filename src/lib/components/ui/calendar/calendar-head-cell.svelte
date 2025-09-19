<script lang="ts">
	import { Calendar as CalendarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils";

	type $$Props = CalendarPrimitive.HeadCellProps;

	interface Props {
		class?: $$Props["class"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { class: className = undefined, children, ...rest }: Props = $props();
	
</script>

<CalendarPrimitive.HeadCell
	class={cn(
		"text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
		className
	)}
	{...rest}
>
	{@render children?.()}
</CalendarPrimitive.HeadCell>
