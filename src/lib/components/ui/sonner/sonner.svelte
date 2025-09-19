<script lang="ts">
	import {
		Toaster as Sonner,
		type ToasterProps as SonnerProps
	} from "svelte-sonner";
	import { mode } from "mode-watcher";

	type $$Props = SonnerProps;

	// Correction pour Svelte 5 - accès sécurisé au store
	let currentMode = 'light';
	$: if (mode && typeof mode.subscribe === 'function') {
		mode.subscribe((value) => {
			currentMode = value || 'light';
		});
	}
</script>

<Sonner
	theme={currentMode}
	class="toaster group"
	toastOptions={{
		classes: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton:
				"group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton:
				"group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		}
	}}
	{...$$restProps}
/>
