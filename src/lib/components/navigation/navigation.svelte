<script lang="ts">
	import { APP_NAME } from '$lib/config/constants';
	import MyLogo from '$lib/assets/img/logoOpenProduct.png?enhanced';
	export let user: any;
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from "flowbite-svelte";
</script>


<Navbar>
  <NavBrand href="/">
	<enhanced:img class="logo-img" src="{MyLogo}" sizes="min(24px, 100vw)" alt="{APP_NAME} logo" />
    <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">{APP_NAME}</span>
  </NavBrand>
  <NavHamburger />
  <NavUl>
    <NavLi href="/">Accueil</NavLi>
    <NavLi href="/map">Carte</NavLi>
{#if user}
	<NavLi href="/dashboard">Mon Profil</NavLi>
{/if}
    <NavLi href="/auth/sign-in">Connection</NavLi>
    <NavLi href="/about">A Propos</NavLi>
  </NavUl>
</Navbar>

