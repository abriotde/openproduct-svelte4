<script lang="ts">
	import type { Label as LabelPrimitive } from "bits-ui";
	import { useFormField } from "formsnap";
	import { cn } from "$lib/utils";
	import { Label } from "$lib/components/ui/label";

	type $$Props = LabelPrimitive.Props;

	interface Props {
		class?: $$Props["class"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { class: className = undefined, children, ...rest }: Props = $props();
	
	const field = useFormField();
</script>

<Label
	for={field.getIds().input}
	class={cn(field.getErrors() && "text-destructive", className)}
	{...rest}
>
	{@render children?.()}
</Label>
