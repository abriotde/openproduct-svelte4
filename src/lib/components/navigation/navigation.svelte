<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Command from '$lib/components/ui/command';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Sun, Moon, SunMoon, UserRound, LogOut } from 'lucide-svelte';
	import { setMode, resetMode } from 'mode-watcher';
	import { APP_NAME } from '$lib/config/constants';
	import Logo from '$lib/components/logo/logo.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import convertNameToInitials from '$lib/_helpers/convertNameToInitials';

	export let user: any;
	$: currentPage = $page.url.pathname;

	function signOut() {
		// Create a form element
		var form = document.createElement('form');
		form.method = 'POST';
		form.action = '/auth/sign-out';
		document.body.appendChild(form);
		form.submit();
	}

	let initials: string = '';
	$: {
		if (user) {
			initials = convertNameToInitials(user.firstName, user.lastName);
		}
	}
</script>

<header class="bg-background sticky top-0 z-40 w-full border-b">
	<div class="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
		<div class="flex gap-6 md:gap-10">
			<a class="flex items-center space-x-2" href="/"
				><Logo size="24"></Logo><span class="inline-block font-bold">{APP_NAME}</span></a
			>
			<nav class="flex gap-6">
				<a
					class="flex items-center text-sm font-medium text-muted-foreground"
					href="/"
					class:active={'/' === currentPage}>Accueil</a
				>
				<a
					class="flex items-center text-sm font-medium text-muted-foreground"
					href="/map"
					class:active={'/map' === currentPage}>Carte</a
				>
				<a
					class="flex items-center text-sm font-medium text-muted-foreground"
					href="/map"
					class:active={'/map' === currentPage}>Carte</a
				>
				<a
					class="flex items-center text-sm font-medium text-muted-foreground"
					href="/dashboard"
					class:active={'/dashboard' === currentPage}>Mon Profil</a
				>
			</nav>
		</div>
		<div class="flex flex-1 items-center justify-end space-x-4">
			<nav class="flex items-center space-x-1">
				{#if !user}
					<Button on:click={() => goto('/auth/sign-in')}>Connection</Button>
					<DropdownMenu.Root>
							<DropdownMenu.Trigger class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
								<Sun
									class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
								/>
								<Moon
									class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
								/>
								<span class="sr-only">Toggle theme</span>
							</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end">
							<DropdownMenu.Item on:click={() => setMode('light')}>Light</DropdownMenu.Item>
							<DropdownMenu.Item on:click={() => setMode('dark')}>Dark</DropdownMenu.Item>
							<DropdownMenu.Item on:click={() => resetMode()}>System</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{:else}
					<DropdownMenu.Root>
							<DropdownMenu.Trigger class="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground relative h-8 w-8">
								<Avatar.Root class="h-8 w-8">
									<Avatar.Fallback>{initials}</Avatar.Fallback>
								</Avatar.Root>
							</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-56" align="end">
							<DropdownMenu.Label class="font-normal">
								<div class="flex flex-col space-y-1">
									<p class="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
									<p class="text-xs leading-none text-muted-foreground">{user?.email}</p>
								</div>
							</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<DropdownMenu.Group>
								<DropdownMenu.Item on:click={() => goto('/profile')}>
									<UserRound class="mr-2 h-4 w-4" />
									Profile
									<DropdownMenu.Shortcut>⇧⌘P</DropdownMenu.Shortcut>
								</DropdownMenu.Item>
							</DropdownMenu.Group>

							<DropdownMenu.Sub>
								<DropdownMenu.SubTrigger>
									<Sun
										class="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
									/>
									<Moon
										class="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
									/>
									Appearance
								</DropdownMenu.SubTrigger>
								<DropdownMenu.SubContent>
									<DropdownMenu.Item on:click={() => setMode('light')}
										><Sun class="mr-2 h-4 w-4" />Light
									</DropdownMenu.Item>
									<DropdownMenu.Item on:click={() => setMode('dark')}
										><Moon class="mr-2 h-4 w-4" />Dark
									</DropdownMenu.Item>
									<DropdownMenu.Item on:click={() => setMode('system')}
										><SunMoon class="mr-2 h-4 w-4" />System
									</DropdownMenu.Item>
								</DropdownMenu.SubContent>
							</DropdownMenu.Sub>
							<DropdownMenu.Separator />
							<DropdownMenu.Item on:click={signOut}>
								<LogOut class="mr-2 h-4 w-4" />
								Sign out
								<DropdownMenu.Shortcut>⇧⌘Q</DropdownMenu.Shortcut>
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{/if}
			</nav>
		</div>
	</div>
</header>

<style>
	.active {
		color: hsl(var(--primary));
	}
</style>
