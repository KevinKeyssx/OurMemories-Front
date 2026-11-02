<script lang="ts">
	import {
		Search,
		Sparkles,
		Image as ImageIcon,
		Video as VideoIcon,
		FileText,
		Quote as QuoteIcon,
		Layers,
		Compass
	} from '@lucide/svelte';
	import type { Component } from 'svelte';
	import type { MomentEntity, MomentTag } from '$lib/types';
	import { memoriesStore } from '$lib/store.svelte';
	import MomentCard from './MomentCard.svelte';

	interface Props {
		moments        : MomentEntity[];
		currentUserId  : string;
		relationName  ?: string;
		onDelete      ?: ( id: string ) => void;
		onUnlock      ?: ( moment: MomentEntity ) => void;
		onRecordView  ?: ( momentId: string ) => void;
	}

	let {
		moments,
		currentUserId,
		relationName = 'Relación',
		onDelete,
		onUnlock,
		onRecordView
	}: Props = $props();

	let searchQuery = $state<string>( '' );
	let selectedScope = $state<'all' | 'standalone'>( 'all' );
	let selectedTag = $state<MomentTag | 'all'>( 'all' );

	interface TagFilterOption {
		id    : MomentTag | 'all';
		label : string;
		icon  : Component;
	}

	const TAG_FILTERS: TagFilterOption[] = [
		{ id: 'all',   label: 'Todos',        icon: Sparkles as Component },
		{ id: 'image', label: 'Fotos',        icon: ImageIcon as Component },
		{ id: 'video', label: 'Videos',       icon: VideoIcon as Component },
		{ id: 'text',  label: 'Textos',       icon: FileText as Component },
		{ id: 'quote', label: 'Dedicatorias', icon: QuoteIcon as Component }
	];

	const filteredMoments = $derived.by<MomentEntity[]>( () => {
		return moments.filter( ( m: MomentEntity ) => {
			// Filtro por alcance ( Todos vs Solo Sueltos )
			if ( selectedScope === 'standalone' && m.memory_id ) {
				return false;
			}

			// Filtro por tag automático
			if ( selectedTag !== 'all' && !m.tags.includes( selectedTag ) ) {
				return false;
			}

			// Buscador por título o contenido
			if ( searchQuery.trim() !== '' ) {
				const query = searchQuery.toLowerCase().trim();
				const matchTitle = m.title?.toLowerCase().includes( query ) || false;
				const matchContent = m.content?.toLowerCase().includes( query ) || false;
				const matchAuthor = m.author?.toLowerCase().includes( query ) || false;
				return matchTitle || matchContent || matchAuthor;
			}

			return true;
		} );
	} );
</script>

<div class="space-y-6">
	<!-- Barra de Búsqueda y Filtros de Momentos -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-dark-card/50 p-4 rounded-3xl border border-stone-200/50 dark:border-white/5 backdrop-blur-md">
		<!-- Input Buscador -->
		<div class="relative flex-1 max-w-md flex items-center">
			<div class="absolute left-3.5 text-stone-400 pointer-events-none">
				<Search size={ 16 } />
			</div>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Buscar momentos por título, autor o contenido..."
				class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-white/5 border border-stone-200/70 dark:border-white/10 text-xs font-medium focus:outline-hidden focus:border-brand-accent transition-colors"
			/>
		</div>

		<!-- Selector de Alcance: Todos vs Sueltos -->
		<div class="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-white/5 rounded-2xl shrink-0">
			<button
				type="button"
				onclick={() => ( selectedScope = 'all' )}
				class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all { selectedScope === 'all' ? 'bg-white dark:bg-stone-800 text-brand-ink dark:text-white shadow-sm' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200' }"
			>
				<Layers size={ 13 } />
				<span>Todos ( { moments.length } )</span>
			</button>

			<button
				type="button"
				onclick={() => ( selectedScope = 'standalone' )}
				class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all { selectedScope === 'standalone' ? 'bg-white dark:bg-stone-800 text-brand-ink dark:text-white shadow-sm' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200' }"
			>
				<Compass size={ 13 } />
				<span>Sueltos ( { moments.filter( ( m ) => !m.memory_id ).length } )</span>
			</button>
		</div>
	</div>

	<!-- Pills de Filtros por Tags -->
	<div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
		{#each TAG_FILTERS as filterItem}
			{@const TagIcon = filterItem.icon}
			{@const isSelected = selectedTag === filterItem.id}
			<button
				type="button"
				onclick={() => ( selectedTag = filterItem.id )}
				class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all active:scale-95 { isSelected ? 'bg-brand-accent text-white shadow-md shadow-brand-accent/25' : 'bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-white/10' }"
			>
				<TagIcon size={ 13 } />
				<span>{ filterItem.label }</span>
			</button>
		{/each}
	</div>

	<!-- Galería de Tarjetas de Momentos -->
	{#if filteredMoments.length === 0}
		<div class="py-16 flex flex-col items-center justify-center text-center bg-white/30 dark:bg-white/1 border border-dashed border-stone-200 dark:border-white/5 rounded-3xl p-6">
			<div class="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-white/5 flex items-center justify-center text-stone-400 mb-3 shadow-inner">
				<Sparkles size={ 24 } />
			</div>
			<h4 class="text-base font-bold text-stone-800 dark:text-stone-200">
				No se encontraron momentos
			</h4>
			<p class="text-xs text-stone-500 max-w-sm mt-1 leading-relaxed">
				{#if searchQuery.trim() !== ''}
					No hay momentos que coincidan con "{ searchQuery }". Intenta con otra palabra.
				{:else}
					Aún no hay momentos con este filtro para { relationName }.
				{/if}
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each filteredMoments as moment (moment.id)}
				<MomentCard
					{moment}
					{currentUserId}
					isViewed={memoriesStore.hasUserViewedMoment( moment.id, currentUserId )}
					{onDelete}
					{onUnlock}
					{onRecordView}
				/>
			{/each}
		</div>
	{/if}
</div>
