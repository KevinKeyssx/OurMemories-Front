<script lang="ts">
	import type { Component } from 'svelte';
	import {
		Crown,
		Award,
		Trophy,
		Sparkles,
		CheckCircle2,
		Lock,
		Gift,
		ChevronRight,
		ChevronLeft,
		Mic,
		Layers,
		Palette,
		BookOpen,
		Users,
		Heart,
		Music2,
		MessageCircle,
		FolderHeart
	} from '@lucide/svelte';
	import type { LevelDefinition, AchievementTier } from '$lib/types/gamification';

	interface Props {
		levels        : LevelDefinition[];
		currentPoints : number;
		class        ?: string;
	}

	let {
		levels,
		currentPoints,
		class: customClass = ''
	}: Props = $props();

	let scrollContainer: HTMLDivElement | null = $state( null );

	const iconMap: Record<string, Component<{ size?: number; class?: string }>> = {
		Crown,
		Award,
		Trophy,
		Sparkles,
		Gift,
		Mic,
		Layers,
		Palette,
		BookOpen,
		Users,
		Heart,
		Music2,
		MessageCircle,
		FolderHeart
	};

	function scrollTimeline( direction: 'left' | 'right' ): void {
		if ( !scrollContainer ) {
			return;
		}

		const distance = direction === 'left' ? -320 : 320;
		scrollContainer.scrollBy({
			left     : distance,
			behavior : 'smooth'
		});
	}

	function getLevelStatus(
		level: LevelDefinition,
		index: number,
		allLevels: LevelDefinition[],
		points: number
	): {
		isReached : boolean;
		isCurrent : boolean;
		isLocked  : boolean;
	} {
		const isReached = points >= level.requiredPoints;
		const nextLevel = allLevels[ index + 1 ];
		const isCurrent = isReached && ( !nextLevel || points < nextLevel.requiredPoints );
		const isLocked = !isReached;

		return {
			isReached,
			isCurrent,
			isLocked
		};
	}

	function getTierPillClasses( tier: AchievementTier, isReached: boolean, isMilestone: boolean ): string {
		if ( !isReached ) {
			return 'border-zinc-800 bg-zinc-900/80 text-zinc-500';
		}

		if ( isMilestone || tier === 'PURPLE' ) {
			return 'border-purple-400/40 bg-purple-950/70 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]';
		}

		if ( tier === 'GOLD' ) {
			return 'border-amber-400/40 bg-amber-950/70 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.25)]';
		}

		return 'border-slate-400/30 bg-slate-900/70 text-slate-200 shadow-[0_0_10px_rgba(148,163,184,0.2)]';
	}
</script>

<div class="relative w-full {customClass}">
	<!-- Header Bar with Scroll Controls -->
	<div class="flex items-center justify-between mb-4 px-1">
		<div class="flex items-center gap-2.5">
			<div class="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-950/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
				<Award size={18} />
			</div>
			<div>
				<h3 class="text-base font-bold text-white tracking-wide flex items-center gap-2">
					Ruta de Crecimiento
					<span class="text-xs font-normal text-zinc-400">({levels.length} Niveles de Legado)</span>
				</h3>
				<p class="text-xs text-zinc-400">
					Desbloquea nuevas capacidades, cosméticos y cuotas acumulando puntos.
				</p>
			</div>
		</div>

		<!-- Arrow controls -->
		<div class="hidden sm:flex items-center gap-1.5">
			<button
				type="button"
				onclick={() => { scrollTimeline( 'left' ); }}
				class="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 transition-all hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95"
				aria-label="Desplazar hacia la izquierda"
			>
				<ChevronLeft size={16} />
			</button>
			<button
				type="button"
				onclick={() => { scrollTimeline( 'right' ); }}
				class="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 transition-all hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95"
				aria-label="Desplazar hacia la derecha"
			>
				<ChevronRight size={16} />
			</button>
		</div>
	</div>

	<!-- Scrollable Timeline Track -->
	<div
		bind:this={scrollContainer}
		class="relative flex items-stretch gap-4 overflow-x-auto pb-4 pt-2 px-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent snap-x snap-mandatory"
	>
		{#each levels as level, index ( level.id )}
			{@const status = getLevelStatus( level, index, levels, currentPoints )}
			{@const IconComponent = iconMap[ level.iconName || '' ] || Award}

			<div
				class="relative shrink-0 snap-start transition-all duration-300 select-none {level.isMilestone ? 'w-72' : 'w-64'}"
			>
				<!-- Connecting progress track behind the card (except for first) -->
				{#if index > 0}
					<div
						class="absolute top-8 -left-4 w-4 h-0.5 z-0 transition-colors duration-500 {status.isReached ? 'bg-gradient-to-r from-purple-500 to-amber-400 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-zinc-800'}"
					></div>
				{/if}

				<!-- Card Box -->
				<div
					class="relative h-full flex flex-col justify-between rounded-2xl border p-4 backdrop-blur-md transition-all duration-300 {status.isCurrent ? 'ring-2 ring-purple-400/70 shadow-[0_0_30px_rgba(168,85,247,0.35)] scale-[1.02]' : ''} {status.isReached ? ( level.isMilestone ? 'border-purple-400/50 bg-gradient-to-b from-[#251347]/90 via-[#190d30]/90 to-[#0e071c]/95 shadow-[0_0_25px_rgba(168,85,247,0.25)]' : 'border-white/15 bg-gradient-to-b from-white/10 to-white/5 shadow-lg shadow-black/40' ) : 'border-white/5 bg-zinc-950/60 opacity-60 grayscale'}"
				>
					<!-- Top Level Number & Status Indicator -->
					<div class="flex items-center justify-between gap-2 mb-3">
						<div class="flex items-center gap-2">
							<span
								class="flex h-7 w-7 items-center justify-center rounded-lg font-bold text-xs {status.isReached ? 'bg-gradient-to-br from-amber-400 to-purple-600 text-white shadow-md' : 'bg-zinc-800 text-zinc-400'}"
							>
								{level.levelNumber}
							</span>
							<div>
								<span class="text-xs font-bold text-white block leading-tight">
									Nivel {level.levelNumber}
								</span>
								<span class="text-[10px] text-zinc-400 block font-mono">
									{level.requiredPoints} pts requeridos
								</span>
							</div>
						</div>

						<!-- Status pill -->
						{#if status.isCurrent}
							<span class="flex items-center gap-1 rounded-full border border-purple-400/50 bg-purple-950/80 px-2 py-0.5 text-[10px] font-bold text-purple-300 animate-pulse">
								<Sparkles size={10} />
								Actual
							</span>
						{:else if status.isReached}
							<span class="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
								<CheckCircle2 size={10} />
								Alcanzado
							</span>
						{:else}
							<span class="flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900/80 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
								<Lock size={10} />
								Faltan {level.requiredPoints - currentPoints} pts
							</span>
						{/if}
					</div>

					<!-- Milestone Banner if applicable -->
					{#if level.isMilestone}
						<div class="mb-3 flex items-center justify-between rounded-xl border border-purple-400/30 bg-gradient-to-r from-purple-900/50 via-fuchsia-950/40 to-purple-900/50 px-2.5 py-1 text-[11px] font-bold text-purple-200">
							<span class="flex items-center gap-1">
								<Crown size={13} class="text-amber-400 fill-amber-400" />
								Hito Épico (Nivel {level.levelNumber})
							</span>
							<span class="text-[9px] uppercase tracking-wider text-amber-300">
								Legado
							</span>
						</div>
					{/if}

					<!-- Title & Description -->
					<div class="space-y-1 mb-4 flex-1">
						<h4 class="text-sm font-bold text-white tracking-wide">
							{level.title}
						</h4>
						<p class="text-xs text-zinc-300 leading-relaxed line-clamp-3">
							{level.description}
						</p>
					</div>

					<!-- Reward Effect Box -->
					<div
						class="rounded-xl border p-2.5 transition-all {status.isReached ? 'border-amber-400/30 bg-amber-950/20 text-amber-200' : 'border-zinc-800 bg-zinc-900/40 text-zinc-400'}"
					>
						<div class="flex items-center justify-between gap-1.5 mb-1">
							<span class="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
								<Gift size={11} class="text-amber-400" />
								Recompensa
							</span>
							<span class="rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider {getTierPillClasses( level.tier, status.isReached, level.isMilestone )}">
								{level.tier}
							</span>
						</div>
						<div class="flex items-center gap-2 mt-1">
							<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg {status.isReached ? 'bg-amber-400/20 text-amber-300' : 'bg-zinc-800 text-zinc-500'}">
								<IconComponent size={13} />
							</div>
							<span class="text-xs font-semibold text-white leading-tight">
								{level.rewardLabel}
							</span>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
