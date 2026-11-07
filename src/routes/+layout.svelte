<script lang="ts">
	import '../index.css';
	import type { Snippet } from 'svelte';
	import { browser } from '$app/environment';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { Tooltip } from 'bits-ui';
	import { memoriesStore } from '$lib/store.svelte';

	interface Props {
		children ?: Snippet;
	}

	let { children }: Props = $props();

	const queryClient = new QueryClient( {
		defaultOptions : {
			queries : {
				enabled              : browser,
				staleTime            : 1000 * 60 * 5,
				refetchOnWindowFocus : false
			}
		}
	} );

	$effect( () => {
		if ( typeof document !== 'undefined' ) {
			const isDark = memoriesStore.theme === 'dark';
			document.documentElement.classList.toggle( 'dark', isDark );
			document.documentElement.classList.toggle( 'light', !isDark );
		}
	} );
</script>

<QueryClientProvider client={queryClient}>
	<Tooltip.Provider>
		<div class="min-h-screen bg-brand-paper text-brand-ink dark:bg-dark-paper dark:text-dark-ink flex flex-col font-sans antialiased selection:bg-brand-accent selection:text-white">
			{#if children}
				{@render children()}
			{/if}
		</div>
	</Tooltip.Provider>
</QueryClientProvider>
