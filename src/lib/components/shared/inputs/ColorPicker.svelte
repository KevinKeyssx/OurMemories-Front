<script lang="ts">
	import { Palette, X } from '@lucide/svelte';
	import { DEFAULT_RELATIONSHIP_COLORS } from '$lib/data';

	interface Props {
		value      ?: string;
		colors     ?: string[];
		label      ?: string;
		allowReset ?: boolean;
		class      ?: string;
	}

	let {
		value = $bindable( '' ),
		colors = DEFAULT_RELATIONSHIP_COLORS,
		label = 'Color de fondo:',
		allowReset = true,
		class: customClass = ''
	}: Props = $props();
</script>

<div class="grid items-center gap-3 { customClass }">
	{#if label}
		<span class="text-xs font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1.5 shrink-0">
			<Palette size={ 14 } />
			<span>{ label }</span>
		</span>
	{/if}

	<div class="flex items-center gap-1.5 flex-wrap">
		{#if allowReset}
			<button
				type="button"
				onclick={() => ( value = '' )}
				class="w-6 h-6 rounded-full border border-stone-300 dark:border-white/20 text-[10px] font-bold flex items-center justify-center text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-all { !value ? 'ring-2 ring-brand-accent scale-105' : '' }"
				title="Predeterminado / Sin color"
				aria-label="Restablecer color predeterminado"
			>
				<X size={ 12 } />
			</button>
		{/if}

		{#each colors as col (col)}
			<button
				type="button"
				onclick={() => ( value = col )}
				class="w-6 h-6 rounded-full border border-black/10 dark:border-white/10 transition-transform hover:scale-110 { value === col ? 'ring-2 ring-brand-accent scale-110 shadow-sm' : '' }"
				style="background-color: { col };"
				aria-label={`Seleccionar color ${ col }`}
				title={col}
			></button>
		{/each}
	</div>
</div>

