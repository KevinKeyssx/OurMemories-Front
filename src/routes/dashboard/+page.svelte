<script lang="ts">
	import type { Component } from 'svelte';

	import {
		Sparkles,
		Award,
		Heart,
		FolderHeart,
		ArrowRight,
		Layers,
	} from '@lucide/svelte';

	import type {
        Relationship,
        MomentEntity,
        MemoryEntity
    }                                   from '$lib/types';
	import MemoryCard                   from '$lib/components/memories/MemoryCard.svelte';
	import MomentList                   from '$lib/components/moments/MomentList.svelte';
	import SecurityUnlockModal          from '$lib/components/shared/SecurityUnlockModal.svelte';
	import { memoriesStore }            from '$lib/store.svelte';
	import { useRelationshipsQuery }    from '$lib/services/relationshipService';
	import { RELATIONSHIP_ICON_MAP }    from '$lib/components/shared/inputs/IconPicker.svelte';


    const ICON_MAP: Record<string, Component> = RELATIONSHIP_ICON_MAP;


    function isImageAvatar( avatar: string | undefined ): boolean {
		if ( !avatar ) {
			return false;
		}

		return avatar.startsWith( 'http://' ) || avatar.startsWith( 'https://' ) || avatar.startsWith( 'data:image' );
	}

	const relationshipsQuery = useRelationshipsQuery();

	const relationshipsList = $derived<Relationship[]>(
		relationshipsQuery.data || memoriesStore.groups
	);

	const allMemories = $derived<MemoryEntity[]>(
		memoriesStore.memories
	);

	const allMoments = $derived<MomentEntity[]>(
		memoriesStore.moments
	);

	const totalPoints = $derived<number>(
		relationshipsList.reduce( ( sum: number, r: Relationship ) => sum + ( r.points || 0 ), 0 ) + ( memoriesStore.currentUser.points || 0 )
	);

	// Modales de desbloqueo de seguridad
	let unlockTarget = $state<{ type: 'memory' | 'moment'; item: MemoryEntity | MomentEntity } | null>( null );
	let isUnlockOpen = $state<boolean>( false );

	function handleUnlockMemory( memory: MemoryEntity ): void {
		unlockTarget = { type: 'memory', item: memory };
		isUnlockOpen = true;
	}

	function handleUnlockMoment( moment: MomentEntity ): void {
		unlockTarget = { type: 'moment', item: moment };
		isUnlockOpen = true;
	}

	function handleUnlockSuccess(): void {
		if ( unlockTarget ) {
			if ( unlockTarget.type === 'memory' ) {
				const mem = unlockTarget.item as MemoryEntity;
				const rel = relationshipsList.find( ( r: Relationship ) => r.id === mem.relationship_id ) || relationshipsList[ 0 ];
				const relPath = rel?.path_name || 'pareja';
				window.location.href = `/dashboard/${ relPath }/memory/${ mem.id }`;
			} else {
				const moment = unlockTarget.item as MomentEntity;
				memoriesStore.unlockMoment( moment.id );
			}
		}

		isUnlockOpen = false;
		unlockTarget = null;
	}

	function handleDeleteMoment( id: string ): void {
		memoriesStore.deleteMoment( id );
	}

	function handleRecordView( momentId: string ): void {
		memoriesStore.recordMomentView( momentId, memoriesStore.currentUser.id );
	}

	function getRelationshipPath( relId: string ): string {
		const rel = relationshipsList.find( ( r: Relationship ) => r.id === relId );
		return rel?.path_name || 'pareja';
	}

	function getRelationshipColor( relId: string ): string {
		const rel = relationshipsList.find( ( r: Relationship ) => r.id === relId );
		return rel?.color || '#f43f5e';
	}

	function getMomentsCountForMemory( memoryId: string ): number {
		return allMoments.filter( ( m: MomentEntity ) => m.memory_id === memoryId ).length;
	}
</script>

<svelte:head>
	<title>Dashboard Principal - OurMemories</title>
</svelte:head>

<div class="space-y-12">
	<!-- Hero Banner Global con Métricas Clave -->
	<div class="relative overflow-hidden rounded-3xl bg-white/70 dark:bg-dark-card/70 border border-stone-200/60 dark:border-white/5 p-6 sm:p-8 backdrop-blur-xl shadow-xl transition-all duration-500">
		<div class="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-brand-accent/15 blur-3xl pointer-events-none"></div>

		<div class="relative z-10 space-y-6">
			<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-xs font-bold mb-2">
						<Sparkles size={ 14 } />
						<span>Centro Global de Memorias</span>
					</div>
					<h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
						Hola, { memoriesStore.currentUser.name }
					</h2>
					<p class="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-xl">
						Explora y revive todos tus recuerdos, dedicatorias y momentos especiales distribuidos en tus relaciones.
					</p>
				</div>
			</div>

			<!-- Tarjetas Resumen de Estadísticas Globales -->
			<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
				<div class="p-4 rounded-2xl bg-stone-50/80 dark:bg-white/3 border border-stone-200/50 dark:border-white/5 flex items-center gap-3.5">
					<div class="w-11 h-11 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
						<Heart size={ 22 } />
					</div>
					<div>
						<p class="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Relaciones</p>
						<p class="text-xl font-extrabold text-stone-900 dark:text-white">{ relationshipsList.length }</p>
					</div>
				</div>

				<div class="p-4 rounded-2xl bg-stone-50/80 dark:bg-white/3 border border-stone-200/50 dark:border-white/5 flex items-center gap-3.5">
					<div class="w-11 h-11 rounded-xl bg-brand-accent/15 text-brand-accent flex items-center justify-center shrink-0">
						<FolderHeart size={ 22 } />
					</div>
					<div>
						<p class="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Memorias</p>
						<p class="text-xl font-extrabold text-stone-900 dark:text-white">{ allMemories.length }</p>
					</div>
				</div>

				<div class="p-4 rounded-2xl bg-stone-50/80 dark:bg-white/3 border border-stone-200/50 dark:border-white/5 flex items-center gap-3.5">
					<div class="w-11 h-11 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
						<Layers size={ 22 } />
					</div>
					<div>
						<p class="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Momentos</p>
						<p class="text-xl font-extrabold text-stone-900 dark:text-white">{ allMoments.length }</p>
					</div>
				</div>

				<div class="p-4 rounded-2xl bg-stone-50/80 dark:bg-white/3 border border-stone-200/50 dark:border-white/5 flex items-center gap-3.5">
					<div class="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
						<Award size={ 22 } />
					</div>
					<div>
						<p class="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Puntos Globales</p>
						<p class="text-xl font-extrabold text-stone-900 dark:text-white">{ totalPoints } pts</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Sección: Tus Relaciones (Tarjetas de Acceso Directo) -->
	<section class="space-y-4">
		<div class="flex items-center justify-between">
			<div>
				<h3 class="text-lg sm:text-xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
					Tus Relaciones
				</h3>
				<p class="text-xs text-stone-400">
					Espacios dedicados con recuerdos y dinámicas independientes
				</p>
			</div>

			<span class="text-xs font-bold text-stone-400 bg-stone-100 dark:bg-white/5 px-3 py-1 rounded-full">
				{ relationshipsList.length } activas
			</span>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
			{#each relationshipsList as rel (rel.id)}
				{@const IconComp = ICON_MAP[ rel.avatar ] || Heart}
				{@const relMemoriesCount = allMemories.filter( ( m: MemoryEntity ) => m.relationship_id === rel.id ).length}
				{@const relMomentsCount = allMoments.filter( ( m: MomentEntity ) => m.relationship_id === rel.id ).length}
				{@const relLevel = Math.floor( ( rel.points || 0 ) / 100 ) + 1}

				<a
					href={`/dashboard/${ rel.path_name }`}
					class="group relative overflow-hidden rounded-3xl bg-white/70 dark:bg-dark-card/70 border border-stone-200/60 dark:border-white/5 p-5 backdrop-blur-md shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between"
				>
					<div
						class="absolute top-0 right-0 w-32 h-32 rounded-full opacity-15 blur-2xl pointer-events-none transition-transform group-hover:scale-125"
						style="background-color: { rel.color || '#f43f5e' };"
					></div>

					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<div
								class="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110 overflow-hidden"
								style="background: { rel.color || '#f43f5e' }; box-shadow: 0 6px 16px -3px { rel.color || '#f43f5e' }66;"
							>
								{#if isImageAvatar( rel.avatar )}
									<img
										src={ rel.avatar }
										alt={ rel.name }
										class="w-full h-full object-cover"
									/>
								{:else}
									<IconComp size={ 24 } />
								{/if}
							</div>

							<span
								class="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white"
								style="background-color: { rel.color || '#f43f5e' };"
							>
								Nivel { relLevel }
							</span>
						</div>

						<div>
							<h4 class="text-base font-extrabold text-stone-900 dark:text-white group-hover:text-brand-accent transition-colors">
								{ rel.name }
							</h4>
							<p class="text-xs text-stone-400 mt-0.5">
								{ rel.points || 0 } puntos acumulados
							</p>
						</div>
					</div>

					<div class="pt-5 mt-4 border-t border-stone-100 dark:border-white/5 flex items-center justify-between text-xs">
						<div class="flex items-center gap-3 text-stone-500 dark:text-stone-400">
							<span class="font-medium">{ relMemoriesCount } memorias</span>
							<span class="text-stone-300 dark:text-stone-600">•</span>
							<span class="font-medium">{ relMomentsCount } momentos</span>
						</div>

						<span class="text-brand-accent font-bold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
							<span>Abrir</span>
							<ArrowRight size={ 14 } />
						</span>
					</div>
				</a>
			{/each}
		</div>
	</section>

	<!-- Sección: Memorias Destacadas (Global) -->
	{#if allMemories.length > 0}
		<section class="space-y-4">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-lg sm:text-xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
						Memorias Destacadas
					</h3>
					<p class="text-xs text-stone-400">
						Colecciones de recuerdos de todas tus relaciones
					</p>
				</div>
			</div>

			<div class="flex items-center gap-5 overflow-x-auto no-scrollbar py-2 px-1">
				{#each allMemories as memory (memory.id)}
					<MemoryCard
						{memory}
						relationPath={ getRelationshipPath( memory.relationship_id ) }
						color={ getRelationshipColor( memory.relationship_id ) }
						momentsCount={ getMomentsCountForMemory( memory.id ) }
						onUnlock={ handleUnlockMemory }
					/>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Sección: Momentos Recientes (Feed Global) -->
	<section class="space-y-4">
		<div class="flex items-center justify-between">
			<div>
				<h3 class="text-lg sm:text-xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
					Momentos Recientes
				</h3>
				<p class="text-xs text-stone-400">
					Fotos, videos y dedicatorias capturadas
				</p>
			</div>
		</div>

		<MomentList
			moments={allMoments}
			currentUserId={memoriesStore.currentUser.id}
			relationName="Global"
			color="#7C3AED"
			onDelete={handleDeleteMoment}
			onUnlock={handleUnlockMoment}
			onRecordView={handleRecordView}
		/>
	</section>
</div>

{#if isUnlockOpen && unlockTarget}
	<SecurityUnlockModal
		isOpen={isUnlockOpen}
		correctPassword={unlockTarget.type === 'memory' ? ( unlockTarget.item as MemoryEntity ).password : ( ( unlockTarget.item as MomentEntity ).metadata?.password || '' )}
		onClose={() => {
			isUnlockOpen = false;
			unlockTarget = null;
		}}
		onSuccess={handleUnlockSuccess}
	/>
{/if}