<script lang="ts">
	import {
		FolderPlus,
		Layers,
		LayoutGrid,
		GalleryHorizontal,
		ChevronLeft,
		ChevronRight
	} from '@lucide/svelte';

	import type {
        MemoryEntity,
        MomentEntity
    }                   from '$lib/types';
	import MemoryCard   from './MemoryCard.svelte';
	import Tooltip      from '$lib/components/shared/Tooltip.svelte';

	interface Props {
		memories        : MemoryEntity[];
		relationPath    : string;
		moments         : MomentEntity[];
		color?          : string;
		onOpenCreate    : () => void;
		onUnlockMemory ?: ( memory: MemoryEntity ) => void;
		onEditMemory   ?: ( memory: MemoryEntity ) => void;
		onDeleteMemory ?: ( memory: MemoryEntity ) => void;
	}

	let {
		memories,
		relationPath,
		moments,
		color = '#f43f5e',
		onOpenCreate,
		onUnlockMemory,
		onEditMemory,
		onDeleteMemory
	}: Props = $props();

	type ViewMode = 'carousel' | 'grid';

	const STORAGE_KEY = 'ourmemories_memories_view_pref';

	let activeView     = $state<ViewMode>( 'carousel' );
	let carouselEl     = $state<HTMLDivElement | null>( null );

	if ( typeof window !== 'undefined' ) {
		const saved = localStorage.getItem( STORAGE_KEY );

        if ( saved === 'grid' || saved === 'carousel' ) {
			activeView = saved;
		}
	}


    function setView( view: ViewMode ): void {
		activeView = view;

        if ( typeof window !== 'undefined' ) {
			localStorage.setItem( STORAGE_KEY, view );
		}
	}


    function getMomentsCount( memoryId: string ): number {
		return moments.filter( ( m: MomentEntity ) => m.memory_id === memoryId ).length;
	}


    function updateScrollState(): void {
		if ( !carouselEl ) {
			return;
		}
		const { scrollLeft, scrollWidth, clientWidth } = carouselEl;
		const maxScroll = scrollWidth - clientWidth;
		hasOverflow   = scrollWidth > clientWidth + 10;
		canScrollPrev = scrollLeft > 15;
		canScrollNext = scrollLeft < maxScroll - 15;
		isNearEnd     = scrollLeft >= maxScroll - 40;
	}


    function scrollCarousel( direction: 'prev' | 'next' ): void {
		if ( !carouselEl ) {
			return;
		}
		const { scrollLeft, scrollWidth, clientWidth } = carouselEl;
		const maxScroll = scrollWidth - clientWidth;
		const step = 310;

		if ( direction === 'next' ) {
			if ( scrollLeft >= maxScroll - 20 ) {
				// Bucle infinito: volver al inicio suavemente
				carouselEl.scrollTo( { left: 0, behavior: 'smooth' } );
			} else {
				carouselEl.scrollBy( { left: step, behavior: 'smooth' } );
			}
		} else {
			if ( scrollLeft <= 20 ) {
				// Bucle infinito: ir al final suavemente
				carouselEl.scrollTo( { left: maxScroll, behavior: 'smooth' } );
			} else {
				carouselEl.scrollBy( { left: -step, behavior: 'smooth' } );
			}
		}
	}

	$effect( () => {
		if ( activeView === 'carousel' && carouselEl ) {
			requestAnimationFrame( () => {
				updateScrollState();
			} );
		}
	} );
</script>

<div class="space-y-4">
	<!-- Cabecera de la sección de Memorias -->
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-2">
			<div
				class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
				style="background-color: { color }18; color: { color };"
			>
				<Layers size={ 18 } />
			</div>
			<div>
				<div class="flex items-center gap-2">
					<h3 class="text-base font-extrabold tracking-tight">Memorias</h3>
					<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-white/10 text-stone-500 dark:text-stone-300">
						{ memories.length }
					</span>
				</div>
				<p class="text-[11px] text-stone-400 font-medium">Colecciones temáticas de momentos</p>
			</div>
		</div>

		<div class="flex items-center gap-2">
			<!-- Selector de Vistas: Carrusel vs Cuadrícula (5 columnas) -->
			<div class="flex items-center p-1 rounded-2xl bg-stone-100 dark:bg-white/5 border border-stone-200/60 dark:border-white/10 shadow-xs">
				<Tooltip text="Vista Carrusel Infinita">
					<button
						type="button"
						onclick={ () => setView( 'carousel' ) }
						class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer { activeView === 'carousel' ? 'bg-white dark:bg-white/15 text-stone-900 dark:text-white shadow-xs' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200' }"
						style={ activeView === 'carousel' ? `color: ${ color };` : '' }
						aria-label="Ver memorias en carrusel"
					>
						<GalleryHorizontal size={ 15 } />
						<span class="hidden sm:inline">Carrusel</span>
					</button>
				</Tooltip>

				<Tooltip text="Vista Cuadrícula">
					<button
						type="button"
						onclick={ () => setView( 'grid' ) }
						class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer { activeView === 'grid' ? 'bg-white dark:bg-white/15 text-stone-900 dark:text-white shadow-xs' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200' }"
						style={ activeView === 'grid' ? `color: ${ color };` : '' }
						aria-label="Ver memorias en cuadrícula de 5 columnas"
					>
						<LayoutGrid size={ 15 } />
						<span class="hidden sm:inline">Grilla</span>
					</button>
				</Tooltip>
			</div>

			<!-- Botón Nueva Memoria -->
			<button
				type="button"
				onclick={ onOpenCreate }
				class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 cursor-pointer hover:brightness-110 shadow-xs"
				style="color: { color }; border-color: { color }66; background-color: { color }0d;"
			>
				<FolderPlus size={ 14 } />
				<span>Nueva Memoria</span>
			</button>
		</div>
	</div>

	{#if activeView === 'grid'}
		<!-- VISTA 1: Cuadrícula con grid-cols-5 (Adaptativa: 1 -> 2 -> 3 -> 4 -> 5 columnas) -->
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pt-1">
			<!-- Tarjeta de Acción Rápida para Crear Memoria (w-full en grid) -->
			<button
				type="button"
				onclick={ onOpenCreate }
				class="group flex flex-col items-center justify-center h-64 w-full rounded-3xl border-2 border-dashed border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-white/1 transition-all duration-300 p-6 text-center space-y-3 cursor-pointer hover:scale-[1.02]"
				onmouseenter={( e: MouseEvent ) => {
					( e.currentTarget as HTMLElement ).style.borderColor = `${ color }80`;
					( e.currentTarget as HTMLElement ).style.backgroundColor = `${ color }0d`;
				}}
				onmouseleave={( e: MouseEvent ) => {
					( e.currentTarget as HTMLElement ).style.borderColor = '';
					( e.currentTarget as HTMLElement ).style.backgroundColor = '';
				}}
			>
				<div
					class="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm"
					style="background-color: { color }18; color: { color };"
				>
					<FolderPlus size={ 22 } />
				</div>
				<div>
					<p class="text-xs font-bold text-stone-800 dark:text-stone-200">Crear Memoria</p>
					<p class="text-[10px] text-stone-400 mt-0.5">Agrupa momentos en un capítulo especial</p>
				</div>
			</button>

			{#each memories as memory (memory.id)}
				<MemoryCard
					{memory}
					{relationPath}
					{color}
					layoutMode="grid"
					momentsCount={ getMomentsCount( memory.id ) }
					onUnlock={ onUnlockMemory }
					onEdit={ onEditMemory }
					onDelete={ onDeleteMemory }
				/>
			{/each}
		</div>
	{:else}
		<!-- VISTA 2: Carrusel Infinito con Botones Laterales Difuminados (Alineados al Ras, Sin Bordes Redondeados Arriba/Abajo) -->
		<div class="relative group/carousel">
			{#if memories.length > 0}
				<!-- Botón Flotante Anterior (Difuminado hacia el interior, a ras de borde izquierdo, esquinas exteriores redondeadas) -->
				<div class="absolute left-0 top-1 z-30 h-64 flex items-center justify-start pointer-events-auto">
					<Tooltip text="Memorias anteriores">
						<button
							type="button"
							onclick={ () => scrollCarousel( 'prev' ) }
							class="group/btn relative h-64 w-8 sm:w-10 rounded-l-2xl rounded-r-none flex items-center justify-center text-white backdrop-blur-xs transition-all duration-300 hover:w-11 active:opacity-80 cursor-pointer overflow-hidden border-none"
							style="background: linear-gradient(to right, { color }80 0%, { color }30 50%, transparent 100%); box-shadow: -2px 0 10px -2px { color }40;"
							aria-label="Ver memorias anteriores"
						>
							<ChevronLeft size={ 22 } class="relative z-10 transition-transform duration-200 group-hover/btn:scale-125 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]" />
						</button>
					</Tooltip>
				</div>
			{/if}

			<!-- Carril Deslizable del Carrusel con Padding Lateral Suave -->
			<div
				bind:this={ carouselEl }
				onscroll={ updateScrollState }
				class="flex items-center gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth px-8 sm:px-10"
			>
				<!-- Tarjeta de Acción Rápida para Crear Memoria (w-60 shrink-0) -->
				<button
					type="button"
					onclick={ onOpenCreate }
					class="group flex flex-col items-center justify-center h-64 w-60 shrink-0 rounded-3xl border-2 border-dashed border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-white/1 transition-all duration-300 p-6 text-center space-y-3 cursor-pointer"
					onmouseenter={( e: MouseEvent ) => {
						( e.currentTarget as HTMLElement ).style.borderColor = `${ color }80`;
						( e.currentTarget as HTMLElement ).style.backgroundColor = `${ color }0d`;
					}}
					onmouseleave={( e: MouseEvent ) => {
						( e.currentTarget as HTMLElement ).style.borderColor = '';
						( e.currentTarget as HTMLElement ).style.backgroundColor = '';
					}}
				>
					<div
						class="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm"
						style="background-color: { color }18; color: { color };"
					>
						<FolderPlus size={ 22 } />
					</div>
					<div>
						<p class="text-xs font-bold text-stone-800 dark:text-stone-200">Crear Memoria</p>
						<p class="text-[10px] text-stone-400 mt-0.5">Agrupa momentos en un capítulo especial</p>
					</div>
				</button>

				{#each memories as memory (memory.id)}
					<MemoryCard
						{memory}
						{relationPath}
						{color}
						layoutMode="carousel"
						momentsCount={ getMomentsCount( memory.id ) }
						onUnlock={ onUnlockMemory }
						onEdit={ onEditMemory }
						onDelete={ onDeleteMemory }
					/>
				{/each}
			</div>

			{#if memories.length > 0}
				<!-- Botón Flotante Siguiente (Difuminado hacia el interior, a ras de borde derecho, esquinas exteriores redondeadas) -->
				<div class="absolute right-0 top-1 z-30 h-64 flex items-center justify-end pointer-events-auto">
					<Tooltip text="Siguientes memorias">
						<button
							type="button"
							onclick={ () => scrollCarousel( 'next' ) }
							class="group/btn relative h-64 w-8 sm:w-10 rounded-r-2xl rounded-l-none flex items-center justify-center text-white backdrop-blur-xs transition-all duration-300 hover:w-11 active:opacity-80 cursor-pointer overflow-hidden border-none"
							style="background: linear-gradient(to left, { color }80 0%, { color }30 50%, transparent 100%); box-shadow: 2px 0 10px -2px { color }40;"
							aria-label="Ver siguientes memorias"
						>
							<ChevronRight size={ 22 } class="relative z-10 transition-transform duration-200 group-hover/btn:scale-125 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]" />
						</button>
					</Tooltip>
				</div>
			{/if}
		</div>
	{/if}
</div>