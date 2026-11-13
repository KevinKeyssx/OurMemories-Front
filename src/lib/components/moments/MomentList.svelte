<script lang="ts">
    import type { Component } from 'svelte';

    import {
		Search,
		Sparkles,
		Image as ImageIcon,
		Video as VideoIcon,
		FileText,
		Quote as QuoteIcon,
        Lock,
        MessageSquareHeart
	} from '@lucide/svelte';

    import type {
        MomentEntity,
        MomentTag
    }                           from '$lib/types';
	import { memoriesStore }    from '$lib/store.svelte';
	import MomentCard           from './MomentCard.svelte';
	import ConfirmDialog        from '$lib/components/shared/ConfirmDialog.svelte';
	import UploadModal          from '$lib/components/UploadModal.svelte';
	import Tooltip              from '$lib/components/shared/Tooltip.svelte';


    interface Props {
		moments        : MomentEntity[];
		currentUserId  : string;
		relationName  ?: string;
		relationPath  ?: string;
		color         ?: string;
		onDelete      ?: ( id: string ) => void;
		onEdit        ?: ( moment: MomentEntity ) => void;
		onUnlock      ?: ( moment: MomentEntity ) => void;
		onRecordView  ?: ( momentId: string ) => void;
	}


    let {
		moments,
		currentUserId,
		relationName = 'Relación',
		relationPath = 'pareja',
		color = '#f43f5e',
		onDelete,
		onEdit,
		onUnlock,
		onRecordView
	}: Props = $props();


    let searchQuery         = $state<string>( '' );
	let selectedScope       = $state<'all' | 'locked'>( 'all' );
	let selectedTag         = $state<MomentTag | 'all'>( 'all' );
	let editingMoment       = $state<MomentEntity | null>( null );
	let momentIdToDelete    = $state<string | null>( null );
	let isConfirmDeleteOpen = $state<boolean>( false );

	function handleRequestEdit( moment: MomentEntity ): void {
		if ( onEdit ) {
			onEdit( moment );
		} else {
			editingMoment = moment;
		}
	}

	function handleRequestDelete( id: string ): void {
		momentIdToDelete = id;
		isConfirmDeleteOpen = true;
	}

	function handleConfirmDelete(): void {
		if ( momentIdToDelete ) {
			memoriesStore.deleteMoment( momentIdToDelete );
			onDelete?.( momentIdToDelete );
			momentIdToDelete = null;
		}
		isConfirmDeleteOpen = false;
	}

	function handleCancelDelete(): void {
		momentIdToDelete = null;
		isConfirmDeleteOpen = false;
	}

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
			// Filtro por alcance ( Todos vs Bloqueados )
			if ( selectedScope === 'locked' && !m.metadata?.password && !m.metadata?.is_blocked ) {
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

	let innerWidth = $state<number>( typeof window !== 'undefined' ? window.innerWidth : 1200 );

	const columnCount = $derived<number>(
		innerWidth < 768 ? 1 : innerWidth < 1024 ? 2 : 3
	);

	const columns = $derived.by<MomentEntity[][]>( () => {
		const count = columnCount;
		const buckets: MomentEntity[][] = Array.from({ length: count }, () => [] );

		filteredMoments.forEach( ( moment: MomentEntity, index: number ) => {
			buckets[ index % count ].push( moment );
		} );

		return buckets;
	} );
</script>

<svelte:window bind:innerWidth />

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
				class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-white/5 border border-stone-200/70 dark:border-white/10 text-xs font-medium focus:outline-hidden transition-colors"
				onfocus={( e: FocusEvent ) => {
					( e.currentTarget as HTMLInputElement ).style.borderColor = color;
				}}
				onblur={( e: FocusEvent ) => {
					( e.currentTarget as HTMLInputElement ).style.borderColor = '';
				}}
			/>
		</div>

		<!-- Selector de Alcance: Todos vs Bloqueados -->
		<div class="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-white/5 rounded-2xl shrink-0">
			<Tooltip text="Todos los momentos">
				<button
					type="button"
					onclick={ () => ( selectedScope = 'all' ) }
					class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer { selectedScope === 'all' ? 'shadow-xs' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200' }"
					style={ selectedScope === 'all' ? `background-color: ${ color }1f; color: ${ color }; border: 1px solid ${ color }4d;` : 'border: 1px solid transparent;' }
					aria-label="Todos los momentos"
				>
					<MessageSquareHeart size={ 15 } />
					<span>( { moments.length } )</span>
				</button>
			</Tooltip>

			<Tooltip text="Momentos bloqueados con contraseña">
				<button
					type="button"
					onclick={ () => ( selectedScope = 'locked' ) }
					class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer { selectedScope === 'locked' ? 'shadow-xs' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200' }"
					style={ selectedScope === 'locked' ? `background-color: ${ color }1f; color: ${ color }; border: 1px solid ${ color }4d;` : 'border: 1px solid transparent;' }
					aria-label="Momentos bloqueados con contraseña"
				>
					<Lock size={ 15 } />
					<span>( { moments.filter( ( m: MomentEntity ) => Boolean( m.metadata?.password || m.metadata?.is_blocked ) ).length } )</span>
				</button>
			</Tooltip>
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
				class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all active:scale-95 cursor-pointer { isSelected ? 'text-white' : 'bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-white/10' }"
				style={ isSelected ? `background-color: ${ color }; box-shadow: 0 4px 14px -2px ${ color }66;` : '' }
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
				{:else if selectedScope === 'locked'}
					No hay momentos protegidos con contraseña para { relationName }.
				{:else}
					Aún no hay momentos con este filtro para { relationName }.
				{/if}
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
			{#each columns as columnBucket }
				<div class="flex flex-col gap-6 min-w-0">
					{#each columnBucket as moment (moment.id)}
						<MomentCard
							{moment}
							{currentUserId}
							{relationPath}
							relationColor={ color }
							isViewed={memoriesStore.hasUserViewedMoment( moment.id, currentUserId )}
							onEdit={handleRequestEdit}
							onDelete={handleRequestDelete}
							{onUnlock}
							{onRecordView}
						/>
					{/each}
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Modal de Edición de Momento (Reutiliza UploadModal adaptado para edición) -->
<UploadModal
	isOpen={Boolean( editingMoment )}
	editingMoment={editingMoment}
	relationshipId={editingMoment?.relationship_id}
	onClose={() => ( editingMoment = null )}
/>

<!-- Modal de Alerta de Confirmación Reutilizable -->
<ConfirmDialog
	isOpen={isConfirmDeleteOpen}
	title="¿Eliminar este momento?"
	description="Esta acción eliminará el momento de forma permanente. No se podrá recuperar."
	confirmText="Sí, eliminar"
	cancelText="Cancelar"
	variant="danger"
	onConfirm={handleConfirmDelete}
	onClose={handleCancelDelete}
/>
