<script lang="ts">
	import type { Component } from 'svelte';
	import {
		Camera,
		Mic,
		Archive,
		Hourglass,
		Compass,
		ShieldAlert,
		Sparkles,
		FolderHeart,
		Music2,
		KeyRound,
		Infinity as InfinityIcon,
		Gift,
		Trophy,
		Lock,
		CheckCircle2,
		Sparkle,
		Flame
	} from '@lucide/svelte';
	import type { AchievementDefinition, AchievementTier } from '$lib/types/gamification';
	import LogoCover from '$lib/components/shared/LogoCover.svelte';

	interface Props {
		achievement : AchievementDefinition;
		onclick    ?: ( achievement: AchievementDefinition ) => void;
		class      ?: string;
	}

	let {
		achievement,
		onclick,
		class: customClass = ''
	}: Props = $props();

	const iconMap: Record<string, Component<{ size?: number; class?: string }>> = {
		Camera,
		Mic,
		Archive,
		Hourglass,
		Compass,
		ShieldAlert,
		Sparkles,
		FolderHeart,
		Music2,
		KeyRound,
		Infinity : InfinityIcon,
		Gift,
		Trophy,
		Sparkle,
		Flame
	};

	const IconComponent = $derived<Component<{ size?: number; class?: string }>>(
		iconMap[ achievement.iconName ] || Trophy
	);

	function getTierStyles( tier: AchievementTier, unlocked: boolean ): {
		iconBg      : string;
		iconColor   : string;
		badgeBg     : string;
		badgeText   : string;
		badgeBorder : string;
		pointsColor : string;
	} {
		if ( !unlocked ) {
			return {
				iconBg      : 'bg-zinc-800/80 text-zinc-500 border border-zinc-700/50',
				iconColor   : 'text-zinc-500',
				badgeBg     : 'bg-zinc-900/80',
				badgeText   : 'text-zinc-400',
				badgeBorder : 'border-zinc-700/50',
				pointsColor : 'text-zinc-400'
			};
		}

		switch ( tier ) {
			case 'SILVER':
				return {
					iconBg      : 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900 shadow-md shadow-slate-400/20',
					iconColor   : 'text-slate-900',
					badgeBg     : 'bg-slate-900/80',
					badgeText   : 'text-slate-200',
					badgeBorder : 'border-slate-400/30',
					pointsColor : 'text-slate-300'
				};
			case 'GOLD':
				return {
					iconBg      : 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-stone-950 shadow-lg shadow-amber-500/30',
					iconColor   : 'text-stone-950',
					badgeBg     : 'bg-amber-950/80',
					badgeText   : 'text-amber-300',
					badgeBorder : 'border-amber-400/40',
					pointsColor : 'text-amber-300'
				};
			case 'PURPLE':
			default:
				return {
					iconBg      : 'bg-gradient-to-br from-purple-500 via-fuchsia-500 to-amber-400 text-white shadow-lg shadow-purple-600/40',
					iconColor   : 'text-white',
					badgeBg     : 'bg-purple-950/80',
					badgeText   : 'text-purple-300',
					badgeBorder : 'border-purple-400/40',
					pointsColor : 'text-purple-300'
				};
		}
	}

	const styles = $derived( getTierStyles( achievement.tier, achievement.unlocked ) );
</script>

<LogoCover
	tier={ achievement.tier }
	unlocked={ achievement.unlocked }
	width="100%"
	height="100%"
	class="w-full h-full min-h-77.5 sm:min-h-82.5 { customClass }"
	onclick={ () => onclick?.( achievement ) }
	ariaLabel="Lámina { achievement.title }"
>
	<!-- Fila Superior: Badge de Tier y Recompensa en Puntos -->
	<div class="relative z-10 flex items-center justify-between gap-2">
		<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border { styles.badgeBg } { styles.badgeText } { styles.badgeBorder }">
			{#if achievement.unlocked}
				<Sparkle size={ 10 } />
			{:else}
				<Lock size={ 10 } />
			{/if}
			<span>{ achievement.tier }</span>
		</span>

		<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-black/40 backdrop-blur-md border border-white/10 { styles.pointsColor }">
			<span>+{ achievement.pointsReward } pts</span>
		</span>
	</div>

	<!-- Centro: Emblema / Logo Coleccionable y Textos -->
	<div class="relative z-10 my-3 flex flex-col items-center text-center space-y-2.5">
		<!-- Contenedor del Emblema -->
		<div class="relative">
			<!-- Aura de fondo animada en tier PURPLE / GOLD -->
			{#if achievement.unlocked && ( achievement.tier === 'PURPLE' || achievement.tier === 'GOLD' )}
				<div
					class="absolute -inset-2 rounded-2xl opacity-40 blur-lg animate-pulse"
					style="background: { achievement.tier === 'PURPLE' ? 'linear-gradient(135deg, #a855f7, #fbbf24)' : '#f59e0b' };"
				></div>
			{/if}

			<div
				class="relative w-15 h-15 rounded-2xl flex items-center justify-center transition-transform duration-500 { styles.iconBg }"
			>
				<IconComponent size={ 26 } class={ styles.iconColor } />
			</div>
		</div>

		<!-- Título y Descripción -->
		<div class="space-y-1 max-w-xs px-1">
			<h4 class="text-sm font-black text-white tracking-tight line-clamp-1 transition-colors">
				{ achievement.title }
			</h4>

			<p class="text-xs text-zinc-300 dark:text-zinc-400 leading-relaxed line-clamp-2">
				{ achievement.unlocked ? achievement.description : achievement.criteriaHint }
			</p>
		</div>
	</div>

	<!-- Fila Inferior: Estado / Fecha de Desbloqueo / Candado -->
	<div class="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
		{#if achievement.unlocked}
			<span class="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
				<CheckCircle2 size={ 13 } />
				<span>Completado</span>
			</span>

			{#if achievement.unlockedAt}
				<span class="text-zinc-400 font-medium text-[10px]">
					{ achievement.unlockedAt }
				</span>
			{/if}
		{:else}
			<span class="inline-flex items-center gap-1.5 text-zinc-400 font-bold">
				<Lock size={ 12 } />
				<span>Por desbloquear</span>
			</span>

			<span class="text-[10px] text-amber-400 font-bold tracking-wide">
				Toca para ver pista
			</span>
		{/if}
	</div>
</LogoCover>
