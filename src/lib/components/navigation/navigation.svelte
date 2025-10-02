<script lang="ts">
	import { APP_NAME } from '$lib/config/constants';
	import { Navigation } from '@skeletonlabs/skeleton-svelte';
	import IconMenu from '@lucide/svelte/icons/menu';
	import IconFolder from '@lucide/svelte/icons/folder';
	import IconMap from '@lucide/svelte/icons/map';
	import IconUserEdit from '@lucide/svelte/icons/user-pen';
	import IconPlug from '@lucide/svelte/icons/unplug';
	import IconSettings from '@lucide/svelte/icons/settings';
	// import MyLogo from '$lib/assets/img/logoOpenProduct.png?enhanced';
	import { PUBLIC_ROOT_URL } from '$env/static/public';
	let user: any = $props();
	let value = $state('/');
</script>


  <Navigation.Rail>
    {#snippet header()}
    	<Navigation.Tile href="#" title="Menu"><IconMenu /></Navigation.Tile>
    {/snippet}
    {#snippet tiles()}
		<Navigation.Tile label="Accueil" href="{PUBLIC_ROOT_URL}/"><IconFolder /></Navigation.Tile>
		<Navigation.Tile label="Carte" href="{PUBLIC_ROOT_URL}/map"><IconMap /></Navigation.Tile>
	{/snippet}
    {#snippet footer()}
		{#if user}
			<Navigation.Tile label="Mon Profil" href="{PUBLIC_ROOT_URL}/dashboard"><IconUserEdit /></Navigation.Tile>
			<Navigation.Tile label="Deconnexion" href="{PUBLIC_ROOT_URL}/auth/sign-out"><IconPlug /></Navigation.Tile>
		{:else}
			<Navigation.Tile label="Connection" href="{PUBLIC_ROOT_URL}/auth/sign-in"><IconPlug /></Navigation.Tile>
		{/if}
      <Navigation.Tile labelExpanded="A propos" href="{PUBLIC_ROOT_URL}/about" title="settings"><IconSettings /></Navigation.Tile>
    {/snippet}
  </Navigation.Rail>
