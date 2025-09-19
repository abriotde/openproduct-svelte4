<script lang="ts">
	import { User2 } from 'lucide-svelte';
	interface Props {
		size: string;
	}

	let { size }: Props = $props();
</script>

<User2 {size} />
