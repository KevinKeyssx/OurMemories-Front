<script lang="ts">
	import { page } from '$app/state';
	import { memoriesStore } from '$lib/store.svelte';
	import type { Relationship, MomentEntity } from '$lib/types';
	import MemoryCard from '$lib/components/MemoryCard.svelte';
	import { Sparkles, Flame, Trophy, Award, Heart } from '@lucide/svelte';
	import { useRelationshipsQuery } from '$lib/services/relationshipService';

	const relationshipsQuery = useRelationshipsQuery();

	const relationshipsList = $derived<Relationship[]>(
		relationshipsQuery.data || memoriesStore.groups
	);

	const pathName = $derived<string>( page.params.relation || '' );

	const currentRelationship = $derived<Relationship | undefined>(
		relationshipsList.find( ( r: Relationship ) => r.path_name === pathName ) || relationshipsList[0]
	);

	const relationshipMoments = $derived.by<MomentEntity[]>( () => {
		if ( !currentRelationship ) {
			return [];
		}

		return memoriesStore.memories.filter( ( item: MomentEntity ) => {
			return item.relationship_id === currentRelationship.id;
		} );
	} );

	// Puntos, niveles y progreso para la relación actual
	const points = $derived<number>( currentRelationship?.points || 0 );
	const level = $derived<number>( Math.floor( points / 100 ) + 1 );
	const nextLevelPoints = $derived<number>( level * 100 );
	const currentLevelProgress = $derived<number>( points % 100 );
	const pointsRemaining = $derived<number>( 100 - currentLevelProgress );

	function handleDelete( id: string ): void {
		memoriesStore.deleteMemory( id );
	}
</script>

<svelte:head>
	<title>{currentRelationship?.name || 'Relación'} - OurMemories</title>
</svelte:head>

<div class="space-y-8">
	<!-- Sección de Nivel y Progreso de la Relación (Viva, Elegante con Animaciones) -->
	<div class="relative overflow-hidden rounded-3xl bg-white/70 dark:bg-dark-card/70 border border-stone-200/60 dark:border-white/5 p-6 sm:p-8 backdrop-blur-xl shadow-xl transition-all duration-500 hover:shadow-2xl">
		<!-- Resplandor dinámico de fondo con el color de la relación -->
		<div
			class="absolute -right-20 -top-20 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none transition-all duration-700"
			style="background-color: {currentRelationship?.color || '#f43f5e'};"
		></div>

		<div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
			<!-- Información de la Relación -->
			<div class="flex items-start sm:items-center gap-4">
				<div
					class="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 transition-transform duration-500 hover:scale-105"
					style="background: {currentRelationship?.color || '#f43f5e'}; box-shadow: 0 10px 25px -5px {currentRelationship?.color || '#f43f5e'}66;"
				>
					<Flame size={28} />
				</div>

				<div>
					<div class="flex items-center gap-2 mb-1">
						<span
							class="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full text-white shadow-sm"
							style="background: {currentRelationship?.color || '#f43f5e'};"
						>
							Nivel {level}
						</span>
						<span class="text-xs font-semibold text-stone-400">
							{points} Puntos Totales
						</span>
					</div>

					<h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
						Espacio de {currentRelationship?.name || 'Cargando...'}
					</h2>
					<p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
						Explora las memorias compartidas, dedicatorias y momentos especiales
					</p>
				</div>
			</div>

			<!-- Contador de Momentos -->
			<div class="flex items-center gap-3 bg-stone-100/70 dark:bg-white/[0.03] border border-stone-200/60 dark:border-white/5 px-4 py-2.5 rounded-2xl shrink-0 self-start md:self-auto">
				<Award size={18} class="text-brand-secondary" />
				<div class="text-xs">
					<span class="text-stone-400">Momentos: </span>
					<span class="font-extrabold text-brand-ink dark:text-white">{relationshipMoments.length}</span>
				</div>
			</div>
		</div>

		<!-- Barra de Progreso Viva con Resplandor y Animación Tailwind -->
		<div class="relative z-10 mt-6 pt-6 border-t border-stone-200/40 dark:border-white/5 space-y-2">
			<div class="flex items-center justify-between text-xs font-bold">
				<span class="text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
					<Sparkles size={14} style="color: {currentRelationship?.color || '#f43f5e'};" />
					Progreso al Nivel {level + 1}
				</span>
				<span class="text-stone-400 text-[11px] font-semibold">
					Faltan <span class="font-bold text-stone-700 dark:text-stone-200">{pointsRemaining} pts</span> ({currentLevelProgress} / 100)
				</span>
			</div>

			<!-- Contenedor de la Barra -->
			<div class="w-full h-3.5 rounded-full bg-stone-100 dark:bg-white/10 p-0.5 overflow-hidden shadow-inner">
				<div
					class="h-full rounded-full transition-all duration-1000 ease-out relative"
					style="width: {currentLevelProgress}%; background: linear-gradient(90deg, {currentRelationship?.color || '#f43f5e'}bb, {currentRelationship?.color || '#f43f5e'}); box-shadow: 0 0 15px {currentRelationship?.color || '#f43f5e'}88;"
				>
					<!-- Efecto de brillo animado en la punta de la barra -->
					<div class="absolute right-0 top-0 bottom-0 w-2 bg-white/60 rounded-full blur-[1px]"></div>
				</div>
			</div>
		</div>
	</div>

	<!-- Renderizado con Skeletons o Galería de Momentos -->
	{#if relationshipsQuery.isPending}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each [ 1, 2, 3 ] as _}
				<div class="h-80 rounded-3xl bg-stone-100 dark:bg-white/5 animate-pulse border border-stone-200/50 dark:border-white/5 shadow-sm"></div>
			{/each}
		</div>
	{:else if relationshipMoments.length === 0}
		<div class="py-20 flex flex-col items-center justify-center text-center bg-white/30 dark:bg-white/[0.01] border border-dashed border-stone-200 dark:border-white/5 rounded-3xl">
			<div class="w-16 h-16 rounded-3xl bg-stone-100 dark:bg-white/5 flex items-center justify-center text-stone-400 mb-4 shadow-inner">
				<Sparkles size={28} />
			</div>
			<h3 class="text-lg font-bold">No hay momentos aún en esta relación</h3>
			<p class="text-sm text-stone-500 max-w-sm mt-1">
				Sé el primero en guardar un momento o memoria especial para "{currentRelationship?.name}".
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each relationshipMoments as memory (memory.id)}
				<MemoryCard
					{memory}
					onDelete={handleDelete}
				/>
			{/each}
		</div>
	{/if}
</div>
