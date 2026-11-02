<script lang="ts">
	import type { Component } from 'svelte';

	export interface TabItem {
		id    : string;
		label : string;
		icon ?: Component;
	}

	export type TabSize = 'normal' | 'small';

	interface Props {
		tabs      : TabItem[];
		activeId  : string;
		size     ?: TabSize;
		onChange ?: ( id: string ) => void;
		class    ?: string;
	}

	let {
		tabs,
		activeId = $bindable(),
		size = 'normal',
		onChange,
		class: customClass = ''
	}: Props = $props();

	const activeIndex = $derived<number>(
		Math.max( 0, tabs.findIndex( ( t: TabItem ) => t.id === activeId ) )
	);

	function handleTabClick( id: string ): void {
		activeId = id;
		onChange?.( id );
	}
</script>

<div
	class="relative flex items-center bg-stone-100 dark:bg-white/4 border border-stone-200/70 dark:border-white/10 backdrop-blur-md select-none { size === 'small' ? 'p-0.5 rounded-xl' : 'p-1 rounded-2xl' } { customClass }"
>
	<!-- Pastilla de Fondo Deslizante Animada -->
	{#if tabs.length > 0}
		{#if size === 'small'}
			<div
				class="absolute top-0.5 bottom-0.5 rounded-lg bg-linear-to-r from-brand-accent to-purple-600 shadow-md shadow-brand-accent/25 transition-all duration-300 ease-out pointer-events-none"
				style="width: calc((100% - 4px) / { tabs.length }); left: calc(2px + { activeIndex } * ((100% - 4px) / { tabs.length }));"
			></div>
		{:else}
			<div
				class="absolute top-1 bottom-1 rounded-xl bg-linear-to-r from-brand-accent to-purple-600 shadow-lg shadow-brand-accent/30 transition-all duration-300 ease-out pointer-events-none"
				style="width: calc((100% - 8px) / { tabs.length }); left: calc(4px + { activeIndex } * ((100% - 8px) / { tabs.length }));"
			></div>
		{/if}
	{/if}

	<!-- Botones de Cada Pestaña -->
	{#each tabs as tab (tab.id)}
		{@const isActive = tab.id === activeId}
		{@const IconComp = tab.icon}
		<button
			type="button"
			onclick={() => handleTabClick( tab.id )}
			class="relative z-10 flex-1 flex items-center justify-center font-bold transition-colors duration-200 cursor-pointer { size === 'small' ? 'py-1 px-2.5 rounded-lg text-[11px] gap-1.5' : 'py-2.5 px-3 rounded-xl text-xs gap-2' } { isActive ? 'text-white' : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200' }"
		>
			{#if IconComp}
				<IconComp
					size={ size === 'small' ? 12 : 15 }
					class={ isActive ? 'text-white' : 'text-stone-400 group-hover:text-stone-200' }
				/>
			{/if}
			<span>{ tab.label }</span>
		</button>
	{/each}
</div>
