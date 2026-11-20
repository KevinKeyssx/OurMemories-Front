<script lang="ts">
	import type { Component } from 'svelte';
	import { page } from '$app/state';
	import {
		Trophy,
		Sparkles,
		Filter,
		CheckCircle2,
		Lock,
		Zap,
		ShieldCheck,
		Gift,
		Layers
	} from '@lucide/svelte';
	import { memoriesStore } from '$lib/store.svelte';
	import type { Relationship } from '$lib/types';
	import type {
		GamificationScope,
		AchievementDefinition,
		AchievementCategory,
		LevelDefinition
	} from '$lib/types/gamification';
	import {
		USER_LEVELS,
		RELATION_LEVELS,
		USER_ACHIEVEMENTS,
		RELATION_ACHIEVEMENTS,
		calculateGamificationProgress,
		resolveUnlockedEffects
	} from '$lib/data/mock-gamification';
	import Tabs from '$lib/components/shared/Tabs.svelte';
	import type { TabItem } from '$lib/components/shared/Tabs.svelte';
	import GamificationHeader from '$lib/components/gamification/GamificationHeader.svelte';
	import LevelTimeline from '$lib/components/gamification/LevelTimeline.svelte';
	import AchievementCard from '$lib/components/gamification/AchievementCard.svelte';
	import AchievementDetailModal from '$lib/components/gamification/AchievementDetailModal.svelte';

	// Relationships from store
	const relationships = $derived<Relationship[]>(
		memoriesStore.groups.length > 0 ? memoriesStore.groups : []
	);

	// URL query param resolution
	const queryRelationId = $derived<string | null>(
		page.url.searchParams.get( 'relationId' )
	);

	let scope = $state<GamificationScope>( 'USER' );
	let selectedRelationId = $state<string>( '' );

	$effect( () => {
		if ( queryRelationId ) {
			scope = 'RELATION';
			selectedRelationId = queryRelationId;
		} else if ( !selectedRelationId && relationships.length > 0 ) {
			selectedRelationId = relationships[ 0 ].id;
		}
	});

	// Current active relationship
	const currentRelation = $derived<Relationship | undefined>(
		relationships.find( ( r: Relationship ) => r.id === selectedRelationId ) || relationships[ 0 ]
	);

	// Current points
	const currentPoints = $derived<number>(
		scope === 'USER'
			? ( memoriesStore.currentUser?.points ?? 450 )
			: ( currentRelation?.points ?? 320 )
	);

	// Active levels and achievements sets
	const activeLevels = $derived<LevelDefinition[]>(
		scope === 'USER' ? USER_LEVELS : RELATION_LEVELS
	);

	const activeAchievements = $derived<AchievementDefinition[]>(
		scope === 'USER' ? USER_ACHIEVEMENTS : RELATION_ACHIEVEMENTS
	);

	// Computed progress and active effects
	const progress = $derived(
		calculateGamificationProgress( scope, currentPoints, activeLevels, activeAchievements )
	);

	const activeEffects = $derived(
		resolveUnlockedEffects( activeLevels, currentPoints )
	);

	// Modal State
	let selectedAchievement = $state<AchievementDefinition | null>( null );
	let isModalOpen = $state<boolean>( false );

	function handleOpenAchievementModal( item: AchievementDefinition ): void {
		selectedAchievement = item;
		isModalOpen = true;
	}

	function handleCloseModal(): void {
		isModalOpen = false;
		selectedAchievement = null;
	}

	function handleScopeChange( newScope: GamificationScope ): void {
		scope = newScope;
		if ( newScope === 'RELATION' && !selectedRelationId && relationships.length > 0 ) {
			selectedRelationId = relationships[ 0 ].id;
		}
	}

	function handleRelationChange( newRelationId: string ): void {
		selectedRelationId = newRelationId;
	}

	// Filters
	let filterCategory = $state<AchievementCategory | 'ALL'>( 'ALL' );
	let filterStatus = $state<'ALL' | 'UNLOCKED' | 'LOCKED'>( 'ALL' );

	const statusTabs = $derived<TabItem[]>([
		{
			id    : 'ALL',
			label : `Todas (${ activeAchievements.length })`
		},
		{
			id    : 'UNLOCKED',
			label : 'Desbloqueadas',
			icon  : CheckCircle2 as Component
		},
		{
			id    : 'LOCKED',
			label : 'Bloqueadas',
			icon  : Lock as Component
		}
	]);

	const filteredAchievements = $derived<AchievementDefinition[]>(
		activeAchievements.filter( ( item: AchievementDefinition ) => {
			const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;
			const matchesStatus =
				filterStatus === 'ALL' ||
				( filterStatus === 'UNLOCKED' && item.unlocked ) ||
				( filterStatus === 'LOCKED' && !item.unlocked );

			return matchesCategory && matchesStatus;
		} )
	);
</script>

<svelte:head>
	<title>Álbum de Logros y Niveles | OurMemories</title>
</svelte:head>

<div class="space-y-10">
	<!-- Main Header and Progress Card -->
	<GamificationHeader
		{scope}
		{selectedRelationId}
		{relationships}
		{progress}
		onScopeChange={handleScopeChange}
		onRelationChange={handleRelationChange}
	/>

	<!-- Active Perks & Unlocked Effects Summary -->
	<section class="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl space-y-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2.5">
				<div class="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
					<Zap size={16} />
				</div>
				<div>
					<h3 class="text-sm font-bold text-white tracking-wide">
						Ventajas y Efectos Activos
					</h3>
					<p class="text-xs text-zinc-400">
						Beneficios que tienes disponibles según tus puntos acumulados en este ámbito.
					</p>
				</div>
			</div>
			<span class="text-xs font-semibold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
				Nivel {progress.currentLevel.levelNumber} Activo
			</span>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
			<div class="rounded-2xl border border-white/5 bg-black/30 p-3 flex items-center gap-3">
				<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300">
					<ShieldCheck size={18} />
				</div>
				<div>
					<span class="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Audio Extra</span>
					<span class="text-xs font-semibold text-white">+{activeEffects.EXTRA_AUDIO_SEC || 0}s permitidos</span>
				</div>
			</div>

			<div class="rounded-2xl border border-white/5 bg-black/30 p-3 flex items-center gap-3">
				<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
					<Layers size={18} />
				</div>
				<div>
					<span class="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Cupos de Momentos</span>
					<span class="text-xs font-semibold text-white">+{activeEffects.EXTRA_MOMENT_SLOT || 0} slots</span>
				</div>
			</div>

			<div class="rounded-2xl border border-white/5 bg-black/30 p-3 flex items-center gap-3">
				<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-500/20 text-pink-300">
					<Gift size={18} />
				</div>
				<div>
					<span class="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Cápsula Colaborativa</span>
					<span class="text-xs font-semibold {activeEffects.UNLOCK_COLLAB_CAPSULE ? 'text-emerald-400' : 'text-zinc-500'}">
						{activeEffects.UNLOCK_COLLAB_CAPSULE ? 'Desbloqueada' : 'Bloqueada (Nivel 5)'}
					</span>
				</div>
			</div>

			<div class="rounded-2xl border border-white/5 bg-black/30 p-3 flex items-center gap-3">
				<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
					<Sparkles size={18} />
				</div>
				<div>
					<span class="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Efecto Modo Cine</span>
					<span class="text-xs font-semibold {activeEffects.CINEMA_EFFECT ? 'text-emerald-400' : 'text-zinc-500'}">
						{activeEffects.CINEMA_EFFECT ? 'Efecto Exclusivo' : 'Bloqueado (Nivel 10)'}
					</span>
				</div>
			</div>
		</div>
	</section>

	<!-- Level Progress Route / Timeline -->
	<section class="space-y-4">
		<LevelTimeline
			levels={activeLevels}
			currentPoints={currentPoints}
		/>
	</section>

	<!-- Collectible Album Grid Section -->
	<section class="space-y-6">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
			<div>
				<h3 class="text-xl font-bold text-white flex items-center gap-2">
					<Trophy size={20} class="text-amber-400" />
					Álbum de Láminas Coleccionables
				</h3>
				<p class="text-xs text-zinc-400 mt-0.5">
					Haz clic en cualquier lámina para inspeccionarla en detalle en 3D y conocer su historia.
				</p>
			</div>

			<!-- Filters: Category and Status -->
			<div class="flex flex-wrap items-center gap-2.5">
				<!-- Status filter tabs usando componente compartido -->
				<Tabs
					tabs={ statusTabs }
					activeId={ filterStatus }
					size="small"
					onChange={ ( id: string ) => { filterStatus = id as 'ALL' | 'UNLOCKED' | 'LOCKED'; } }
				/>
			</div>
		</div>

		<!-- Cards Grid -->
		{#if filteredAchievements.length > 0}
			<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
				{#each filteredAchievements as achievement ( achievement.id )}
					<AchievementCard
						{achievement}
						onclick={handleOpenAchievementModal}
					/>
				{/each}
			</div>
		{:else}
			<div class="rounded-2xl border border-white/10 bg-white/5 p-12 text-center space-y-2">
				<Filter size={32} class="mx-auto text-zinc-500" />
				<h4 class="text-sm font-bold text-white">No hay láminas con este filtro</h4>
				<p class="text-xs text-zinc-400">Prueba cambiando los filtros seleccionados arriba.</p>
			</div>
		{/if}
	</section>
</div>

<!-- Modal de detalle de logro 3D -->
<AchievementDetailModal
	achievement={selectedAchievement}
	open={isModalOpen}
	onclose={handleCloseModal}
/>
