<script lang="ts">
	import type { Component } from 'svelte';
	import {
		X,
		Trophy,
		Lock,
		CheckCircle2,
		Calendar,
		User,
		Sparkles,
		Star,
		Sparkle,
		Flame,
		Info,
		Camera,
		Mic,
		Archive,
		Hourglass,
		Compass,
		ShieldAlert,
		FolderHeart,
		Music2,
		KeyRound,
		Infinity as InfinityIcon,
		Gift
	} from '@lucide/svelte';
	import type { AchievementDefinition, AchievementTier } from '$lib/types/gamification';

	interface Props {
		achievement : AchievementDefinition | null;
		open        : boolean;
		onclose     : () => void;
	}

	let {
		achievement,
		open,
		onclose
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

	let tiltX = $state( 0 );
	let tiltY = $state( 0 );
	let sheenX = $state( 50 );
	let sheenY = $state( 50 );
	let isHovering = $state( false );

	function handleMouseMove( event: MouseEvent ): void {
		const target = event.currentTarget as HTMLElement | null;
		if ( !target ) {
			return;
		}

		const rect = target.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		const centerX = rect.width / 2;
		const centerY = rect.height / 2;

		const rotateXValue = ( ( y - centerY ) / centerY ) * -12;
		const rotateYValue = ( ( x - centerX ) / centerX ) * 12;

		tiltX = Math.max( -15, Math.min( 15, rotateXValue ) );
		tiltY = Math.max( -15, Math.min( 15, rotateYValue ) );

		sheenX = Math.round( ( x / rect.width ) * 100 );
		sheenY = Math.round( ( y / rect.height ) * 100 );
		isHovering = true;
	}

	function handleMouseLeave(): void {
		tiltX = 0;
		tiltY = 0;
		sheenX = 50;
		sheenY = 50;
		isHovering = false;
	}

	function handleKeydown( event: KeyboardEvent ): void {
		if ( event.key === 'Escape' && open ) {
			onclose();
		}
	}

	function getTierConfig( tier: AchievementTier, unlocked: boolean ): {
		name         : string;
		glowBorder   : string;
		bannerBg     : string;
		badgeText    : string;
		badgeBorder  : string;
		badgeBg      : string;
		auraShadow   : string;
		gradientLine : string;
	} {
		if ( !unlocked ) {
			return {
				name         : 'Lámina Bloqueada',
				glowBorder   : 'border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.03)]',
				bannerBg     : 'bg-white/5',
				badgeText    : 'text-zinc-400',
				badgeBorder  : 'border-zinc-700/50',
				badgeBg      : 'bg-zinc-800/80',
				auraShadow   : 'rgba(255,255,255,0.05)',
				gradientLine : 'from-zinc-600 via-zinc-400 to-zinc-600'
			};
		}

		if ( tier === 'PURPLE' ) {
			return {
				name         : 'Lámina Legendaria',
				glowBorder   : 'border-purple-400/50 shadow-[0_0_40px_rgba(168,85,247,0.35)]',
				bannerBg     : 'bg-gradient-to-r from-purple-900/60 via-fuchsia-950/60 to-purple-900/60',
				badgeText    : 'text-purple-300',
				badgeBorder  : 'border-purple-400/40',
				badgeBg      : 'bg-purple-950/80',
				auraShadow   : 'rgba(168,85,247,0.4)',
				gradientLine : 'from-purple-500 via-amber-400 to-purple-500'
			};
		}

		if ( tier === 'GOLD' ) {
			return {
				name         : 'Lámina Dorada',
				glowBorder   : 'border-amber-400/50 shadow-[0_0_40px_rgba(251,191,36,0.35)]',
				bannerBg     : 'bg-gradient-to-r from-amber-950/60 via-yellow-900/40 to-amber-950/60',
				badgeText    : 'text-amber-300',
				badgeBorder  : 'border-amber-400/40',
				badgeBg      : 'bg-amber-950/80',
				auraShadow   : 'rgba(245,158,11,0.4)',
				gradientLine : 'from-amber-400 via-yellow-200 to-amber-500'
			};
		}

		return {
			name         : 'Lámina Plateada',
			glowBorder   : 'border-slate-300/40 shadow-[0_0_35px_rgba(148,163,184,0.25)]',
			bannerBg     : 'bg-gradient-to-r from-slate-900/60 via-slate-800/60 to-slate-900/60',
			badgeText    : 'text-slate-200',
			badgeBorder  : 'border-slate-400/30',
			badgeBg      : 'bg-slate-900/80',
			auraShadow   : 'rgba(203,213,225,0.25)',
			gradientLine : 'from-slate-300 via-white to-slate-400'
		};
	}

	const IconComp = $derived<Component<{ size?: number; class?: string }>>(
		achievement ? ( iconMap[ achievement.iconName ] || Trophy ) : Trophy
	);

	const tierConfig = $derived(
		achievement ? getTierConfig( achievement.tier, achievement.unlocked ) : getTierConfig( 'SILVER', false )
	);
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open && achievement}
	<!-- Overlay Backdrop -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md transition-opacity duration-300"
		role="dialog"
		aria-modal="true"
		aria-labelledby="achievement-modal-title"
	>
		<!-- Background click dismiss -->
		<button
			type="button"
			class="fixed inset-0 w-full h-full cursor-default bg-transparent -z-10 focus:outline-none"
			onclick={onclose}
			aria-label="Cerrar modal"
		></button>

		<!-- Modal Container -->
		<div
			class="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-gradient-to-b from-[#18112c]/95 via-[#100b20]/95 to-[#090613]/98 p-6 sm:p-8 text-white shadow-2xl shadow-purple-950/60 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
		>
			<!-- Ambient background lights -->
			<div class="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl"></div>
			<div class="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl"></div>

			<!-- Close button -->
			<button
				type="button"
				onclick={onclose}
				class="absolute top-5 right-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-all hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95"
				aria-label="Cerrar"
			>
				<X size={20} />
			</button>

			<div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
				<!-- Left column: 3D Tilt Collectible Card -->
				<div class="md:col-span-5 flex justify-center">
					<div
						class="perspective-container relative w-full max-w-[260px] aspect-[3/4.4] cursor-pointer select-none"
						onmousemove={handleMouseMove}
						onmouseleave={handleMouseLeave}
						role="presentation"
					>
						<div
							class="card-3d relative w-full h-full rounded-2xl border {tierConfig.glowBorder} p-3 transition-transform duration-150 ease-out overflow-hidden flex flex-col justify-between"
							style="transform: perspective(900px) rotateX({tiltX}deg) rotateY({tiltY}deg) scale3d({isHovering ? '1.04' : '1'}, {isHovering ? '1.04' : '1'}, 1);"
						>
							<!-- Background dynamic sheen -->
							<div
								class="pointer-events-none absolute inset-0 z-10 transition-opacity duration-200"
								style="background: radial-gradient(circle at {sheenX}% {sheenY}%, rgba(255,255,255,{achievement.unlocked ? 0.35 : 0.12}) 0%, transparent 60%); opacity: {isHovering ? 1 : 0.4};"
							></div>

							<!-- Card inner background -->
							{#if achievement.unlocked}
								<div class="absolute inset-0 bg-gradient-to-br from-[#241744] via-[#140e28] to-[#0c0819] -z-10"></div>
							{:else}
								<div class="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black -z-10 grayscale"></div>
							{/if}

							<!-- Top header of card -->
							<div class="relative z-20 flex items-center justify-between">
								<span class="rounded-md border {tierConfig.badgeBorder} {tierConfig.badgeBg} px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase {tierConfig.badgeText}">
									{achievement.tier}
								</span>
								<div class="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
									<Star size={11} class="fill-amber-400 text-amber-400" />
									<span>+{achievement.pointsReward}</span>
								</div>
							</div>

							<!-- Center Art / Emblem -->
							<div class="relative z-20 flex flex-col items-center justify-center my-auto py-2">
								<div
									class="relative flex h-24 w-24 items-center justify-center rounded-2xl border transition-all duration-300 {achievement.unlocked ? 'border-amber-400/40 bg-gradient-to-br from-amber-400/20 to-purple-600/30 text-amber-200 shadow-xl' : 'border-zinc-700 bg-zinc-800/80 text-zinc-500 grayscale'}"
									style="box-shadow: 0 0 30px {tierConfig.auraShadow};"
								>
									<IconComp size={44} />
									{#if !achievement.unlocked}
										<div class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl backdrop-blur-[1px]">
											<Lock size={28} class="text-zinc-400" />
										</div>
									{/if}
								</div>
								<div class="mt-4 text-center">
									<h4 class="text-sm font-bold tracking-wide {achievement.unlocked ? 'text-white' : 'text-zinc-400'}">
										{achievement.title}
									</h4>
									<p class="text-[10px] font-medium uppercase tracking-widest text-zinc-500 mt-0.5">
										{tierConfig.name}
									</p>
								</div>
							</div>

							<!-- Card Footer: Stamp / Seal -->
							<div class="relative z-20 rounded-xl bg-black/40 border border-white/5 p-2 flex items-center justify-between text-[10px]">
								{#if achievement.unlocked}
									<div class="flex items-center gap-1.5 text-emerald-300 font-semibold">
										<CheckCircle2 size={13} class="text-emerald-400" />
										<span>Coleccionada</span>
									</div>
									<span class="text-zinc-400 font-mono text-[9px]">{achievement.code}</span>
								{:else}
									<div class="flex items-center gap-1.5 text-zinc-400 font-semibold">
										<Lock size={13} class="text-zinc-500" />
										<span>Por descubrir</span>
									</div>
									<span class="text-zinc-600 font-mono text-[9px]">{achievement.code}</span>
								{/if}
							</div>
						</div>
					</div>
				</div>

				<!-- Right column: Full Detailed Specs -->
				<div class="md:col-span-7 flex flex-col justify-between space-y-6">
					<div>
						<!-- Badges Row -->
						<div class="flex flex-wrap items-center gap-2 mb-3">
							<span class="inline-flex items-center gap-1.5 rounded-full border {tierConfig.badgeBorder} {tierConfig.badgeBg} px-3 py-1 text-xs font-semibold {tierConfig.badgeText}">
								<Sparkles size={12} />
								{tierConfig.name}
							</span>
							<span class="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
								{#if achievement.scope === 'USER'}
									<User size={12} class="text-purple-300" />
									Perfil Global
								{:else}
									<Flame size={12} class="text-pink-400" />
									Vínculo Compartido
								{/if}
							</span>
							<span class="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
								<Star size={12} class="fill-amber-400 text-amber-400" />
								+{achievement.pointsReward} Puntos de Experiencia
							</span>
						</div>

						<!-- Title -->
						<h3 id="achievement-modal-title" class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
							{achievement.title}
						</h3>

						<!-- Description -->
						<p class="text-sm sm:text-base leading-relaxed text-zinc-300">
							{achievement.description}
						</p>
					</div>

					<!-- Divider with gradient -->
					<div class="h-px w-full bg-gradient-to-r {tierConfig.gradientLine} opacity-40"></div>

					<!-- Status Box -->
					<div class="rounded-2xl border p-4 {achievement.unlocked ? 'border-emerald-500/20 bg-emerald-950/20' : 'border-zinc-700/50 bg-zinc-900/40'}">
						{#if achievement.unlocked}
							<div class="flex items-start gap-3">
								<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
									<CheckCircle2 size={18} />
								</div>
								<div class="space-y-1">
									<p class="text-xs font-bold uppercase tracking-wider text-emerald-300">
										¡Logro desbloqueado y registrado!
									</p>
									<div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400 pt-0.5">
										{#if achievement.unlockedAt}
											<span class="flex items-center gap-1">
												<Calendar size={13} class="text-zinc-500" />
												{achievement.unlockedAt}
											</span>
										{/if}
										{#if achievement.unlockedBy}
											<span class="flex items-center gap-1">
												<User size={13} class="text-zinc-500" />
												Registrado por <strong class="text-zinc-300 font-medium">{achievement.unlockedBy}</strong>
											</span>
										{/if}
									</div>
								</div>
							</div>
						{:else}
							<div class="flex items-start gap-3">
								<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25">
									<Info size={18} />
								</div>
								<div class="space-y-1">
									<p class="text-xs font-bold uppercase tracking-wider text-amber-300">
										Misión para coleccionar
									</p>
									<p class="text-xs text-zinc-300 leading-relaxed">
										{achievement.criteriaHint}
									</p>
								</div>
							</div>
						{/if}
					</div>

					<!-- Action Buttons -->
					<div class="flex items-center justify-end gap-3 pt-2">
						<button
							type="button"
							onclick={onclose}
							class="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition-all hover:bg-white/10 hover:text-white active:scale-95"
						>
							Cerrar
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.perspective-container {
		perspective: 1000px;
	}

	.card-3d {
		transform-style: preserve-3d;
		will-change: transform;
	}
</style>
