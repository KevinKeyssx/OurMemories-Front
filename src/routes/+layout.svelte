<script lang="ts">
	import '../index.css';
	import type { Snippet } from 'svelte';
	import { browser } from '$app/environment';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
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
</script>

<QueryClientProvider client={queryClient}>
	<div class={memoriesStore.theme}>
		<div class="min-h-screen bg-brand-paper text-brand-ink dark:bg-dark-paper dark:text-dark-ink flex flex-col font-sans antialiased selection:bg-brand-accent selection:text-white transition-colors duration-500">
			{#if children}
				{@render children()}
			{/if}
		</div>
	</div>
</QueryClientProvider>
