<script lang="ts">
	import { Sun, Moon, Sparkles, ArrowRight, Lock, Heart } from '@lucide/svelte';
	import { memoriesStore } from '$lib/store.svelte';

	const firstRelationPath: string = memoriesStore.groups[0]?.path_name || 'pareja';
</script>

<svelte:head>
	<title>Our Memories - Atesora tus momentos</title>
</svelte:head>

<div class="min-h-screen flex flex-col justify-between p-6 md:p-12">
	<header class="flex items-center justify-between max-w-6xl w-full mx-auto">
		<div class="flex items-center gap-3">
			<div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-accent to-pink-500 flex items-center justify-center text-white shadow-lg shadow-brand-accent/30">
				<Sparkles size={20} />
			</div>
			<span class="text-xl font-bold font-display tracking-tight">OurMemories</span>
		</div>

		<div class="flex items-center gap-4">
			<button
				onclick={() => memoriesStore.toggleTheme()}
				class="p-2.5 rounded-2xl border border-stone-200/60 dark:border-white/10 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors text-stone-600 dark:text-stone-300"
				aria-label="Cambiar tema"
			>
				{#if memoriesStore.theme === 'light'}
					<Moon size={18} />
				{:else}
					<Sun size={18} />
				{/if}
			</button>

			<a
				href="/login"
				class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-stone-200/70 dark:border-white/10 hover:border-brand-accent text-stone-700 dark:text-stone-200 hover:text-brand-accent transition-all"
			>
				<Lock size={15} />
				<span>Acceso</span>
			</a>
		</div>
	</header>

	<main class="max-w-4xl w-full mx-auto text-center py-16 space-y-8">
		<div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent dark:text-dark-accent text-xs font-semibold">
			<Heart size={14} class="fill-current" />
			<span>Tu espacio íntimo y organizado</span>
		</div>

		<h1 class="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
			Cada relación tiene su propia historia y sus recuerdos
		</h1>

		<p class="text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto font-normal">
			Organiza tus momentos especiales por relaciones y galerías: fotos, frases inolvidables, videos, memes y anécdotas, todo protegido.
		</p>

		<div class="flex flex-wrap items-center justify-center gap-4 pt-4">
			<a
				href={`/dashboard/${firstRelationPath}`}
				class="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-accent to-purple-600 text-white font-semibold shadow-xl shadow-brand-accent/25 hover:shadow-brand-accent/40 hover:scale-105 active:scale-95 transition-all text-base"
			>
				<span>Ir al Dashboard</span>
				<ArrowRight size={18} />
			</a>

			<a
				href="/login"
				class="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white dark:bg-white/5 border border-stone-200/80 dark:border-white/10 text-stone-800 dark:text-stone-200 font-semibold hover:border-brand-accent transition-all text-base"
			>
				<span>Iniciar Sesión</span>
			</a>
		</div>
	</main>

	<footer class="text-center text-xs text-stone-400 py-4">
		&copy; 2026 OurMemories. Construido con SvelteKit.
	</footer>
</div>
