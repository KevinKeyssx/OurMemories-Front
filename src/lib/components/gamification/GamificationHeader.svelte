<script lang="ts">
	import type { Component } from 'svelte';

    import {
		User,
		Heart,
		Sparkles,
		Layers,
		Crown,
		Star,
		Award
	} from '@lucide/svelte';

	import type {
        GamificationProgress,
		GamificationScope,
		AchievementTier
	}                               from '$lib/types/gamification';
    import type { Relationship }    from '$lib/types';
	import Tabs                     from '$lib/components/shared/Tabs.svelte';
	import type { TabItem }         from '$lib/components/shared/Tabs.svelte';
	import RelationPillSelector     from './RelationPillSelector.svelte';


    interface Props {
		scope              : GamificationScope;
		selectedRelationId : string;
		relationships      : Relationship[];
		progress           : GamificationProgress;
		onScopeChange      : ( scope: GamificationScope ) => void;
		onRelationChange   : ( relationId: string ) => void;
		class             ?: string;
	}


    let {
		scope,
		selectedRelationId,
		relationships,
		progress,
		onScopeChange,
		onRelationChange,
		class: customClass = ''
	}: Props = $props();


    function getTierBadgeClasses( tier: AchievementTier, isMilestone: boolean ): {
		badge : string;
		glow  : string;
		text  : string;
	} {
		if ( isMilestone || tier === 'PURPLE' ) {
			return {
				badge : 'border-purple-400/50 bg-gradient-to-r from-purple-900/80 via-fuchsia-950/70 to-purple-900/80 text-purple-200',
				glow  : 'shadow-[0_0_20px_rgba(168,85,247,0.35)]',
				text  : 'text-purple-300'
			};
		}

		if ( tier === 'GOLD' ) {
			return {
				badge : 'border-amber-400/50 bg-gradient-to-r from-amber-950/80 via-yellow-900/60 to-amber-950/80 text-amber-200',
				glow  : 'shadow-[0_0_20px_rgba(251,191,36,0.3)]',
				text  : 'text-amber-300'
			};
		}

		return {
			badge : 'border-slate-400/40 bg-gradient-to-r from-slate-900/80 via-slate-800/70 to-slate-900/80 text-slate-200',
			glow  : 'shadow-[0_0_15px_rgba(148,163,184,0.2)]',
			text  : 'text-slate-300'
		};
	}

	const tierStyle = $derived(
		getTierBadgeClasses( progress.currentLevel.tier, progress.currentLevel.isMilestone )
	);

	const scopeTabs: TabItem[] = [
		{
			id    : 'USER',
			label : 'Mi Perfil (Global)',
			icon  : User as Component
		},
		{
			id    : 'RELATION',
			label : 'Mis Relaciones',
			icon  : Heart as Component
		}
	];
</script>

<div class="relative w-full space-y-6 {customClass}">
	<!-- Top Controls Row: Scope Switcher & Relation Selector (z-30 para desplegar por encima) -->
	<div class="relative z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<!-- Tabs de Ámbito usando componente compartido -->
		<Tabs
			tabs={ scopeTabs }
			activeId={ scope }
			class="w-full sm:w-auto min-w-[320px]"
			onChange={ ( id: string ) => onScopeChange( id as GamificationScope ) }
		/>

		<!-- Selector Pill de Relación (Visible solo en ámbito RELATION) -->
		{#if scope === 'RELATION'}
			<div class="flex items-center gap-3 animate-in fade-in duration-200">
				<span class="text-xs font-medium text-zinc-400 hidden md:inline">
					Relación activa:
				</span>
				<RelationPillSelector
					{relationships}
					selectedId={selectedRelationId}
					onSelect={onRelationChange}
				/>
			</div>
		{/if}
	</div>

	<!-- Main Progress Summary Card -->
	<div
		class="relative z-10 overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-[#1d1235]/90 via-[#130b24]/90 to-[#090514]/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-purple-950/40"
	>
		<!-- Ambient background lighting -->
		<div class="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl"></div>
		<div class="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl"></div>

		<div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
			<!-- Left: Current Level Badge & Title -->
			<div class="space-y-3">
				<div class="flex flex-wrap items-center gap-2.5">
					<!-- Level Pill -->
					<div
						class="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold tracking-wide uppercase {tierStyle.badge} {tierStyle.glow}"
					>
						{#if progress.currentLevel.isMilestone}
							<Crown size={14} class="text-amber-400 fill-amber-400" />
						{:else}
							<Award size={14} class="text-amber-300" />
						{/if}
						<span>NIVEL {progress.currentLevel.levelNumber}</span>
						<span class="opacity-50">•</span>
						<span class="{tierStyle.text}">{progress.currentLevel.tier}</span>
					</div>

					<!-- Collectible cards album counter -->
					<div
						class="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300"
					>
						<Layers size={13} class="text-purple-300" />
						<span>
							Álbum: <strong class="text-white">{progress.unlockedCount}</strong> / {progress.totalAchievements} Láminas
						</span>
					</div>
				</div>

				<div>
					<h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
						{progress.currentLevel.title}
					</h2>
					<p class="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed mt-1">
						{progress.currentLevel.description}
					</p>
				</div>
			</div>

			<!-- Right: Points & Quick Stats -->
			<div class="flex sm:flex-col items-end justify-between sm:justify-center gap-2 sm:text-right shrink-0">
				<div class="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 px-3 py-1.5 rounded-2xl shadow-inner shadow-amber-500/10">
					<Star size={16} class="fill-amber-400 text-amber-400" />
					<span class="text-xl sm:text-2xl font-black text-amber-300 font-mono">
						{progress.currentPoints.toLocaleString()}
					</span>
					<span class="text-xs font-bold text-amber-400 uppercase tracking-wider">
						pts
					</span>
				</div>

				<div class="text-xs text-zinc-400 font-medium">
					{#if progress.nextLevel}
						<span>Siguiente meta: <strong class="text-zinc-200 font-semibold">{progress.nextLevel.requiredPoints} pts</strong></span>
					{:else}
						<span class="text-amber-300 font-bold">¡Nivel Máximo de Legado!</span>
					{/if}
				</div>
			</div>
		</div>

		<!-- Progress Bar Section -->
		<div class="relative z-10 mt-6 pt-5 border-t border-white/10 space-y-2">
			<div class="flex items-center justify-between text-xs font-semibold">
				<span class="text-zinc-400 flex items-center gap-1.5">
					<Sparkles size={12} class="text-purple-400" />
					Avance hacia Nivel {progress.nextLevel ? progress.nextLevel.levelNumber : progress.currentLevel.levelNumber}
					{#if progress.nextLevel}
						<span class="text-white">({progress.nextLevel.title})</span>
					{/if}
				</span>
				<span class="text-purple-300 font-mono font-bold">
					{progress.progressPercent}%
				</span>
			</div>

			<!-- Bar Container -->
			<div class="relative h-3 w-full rounded-full bg-black/60 border border-white/10 overflow-hidden p-0.5">
				<div
					class="h-full rounded-full bg-linear-to-r from-purple-600 via-fuchsia-500 to-amber-400 shadow-[0_0_12px_rgba(168,85,247,0.7)] transition-all duration-700 ease-out"
					style="width: {progress.progressPercent}%;"
				></div>
			</div>

			<div class="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5">
				<span>{progress.currentPoints} pts acumulados</span>
				{#if progress.nextLevel}
					<span>Faltan <strong class="text-amber-300 font-semibold">{progress.pointsRemaining} pts</strong></span>
				{:else}
					<span class="text-emerald-400 font-medium">Rango Máximo Alcanzado</span>
				{/if}
			</div>
		</div>
	</div>
</div>
