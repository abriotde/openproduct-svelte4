<script lang="ts">
	import { useFormField } from "formsnap";
	import type { HTMLInputAttributes } from "svelte/elements";
	import { Input, type InputEvents } from "$lib/components/ui/input";
	
	interface Props {
		[key: string]: any
	}

	let { ...rest }: Props = $props();

	type $$Props = HTMLInputAttributes;
	type $$Events = InputEvents;

	const field = useFormField();
</script>

<Input
	{...field.getAttrs()}
	bind:value={field.getValue()}
	{...rest}
	on:blur
	on:change
	on:click
	on:focus
	on:keydown
	on:keypress
	on:keyup
	on:mouseover
	on:mouseenter
	on:mouseleave
	on:paste
	on:input
/>
