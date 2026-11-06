<script lang="ts">
	import {
		Flame,
		Eye,
		Lock,
		ShieldAlert,
		RotateCcw,
		Hand
	} from '@lucide/svelte';

	interface Props {
		isViewed        : boolean;
		canReplay      ?: boolean;
		bgColor        ?: string;
		secondsLeft    ?: number;
		totalDuration  ?: number;
		onStartHolding  : () => void;
		onStopHolding   : () => void;
		onReplay       ?: () => void;
	}

	let {
		isViewed,
		canReplay = false,
		bgColor = '#7C3AED',
		secondsLeft,
		totalDuration = 5,
		onStartHolding,
		onStopHolding,
		onReplay
	}: Props = $props();

	const isPaused = $derived<boolean>(
		Boolean( secondsLeft !== undefined && secondsLeft > 0 && secondsLeft < totalDuration )
	);
</script>

<div
	class="absolute inset-x-0 top-0 bottom-11.25 z-20 flex flex-col items-center justify-center p-5 text-center backdrop-blur-2xl select-none overflow-hidden transition-colors duration-300 border-b border-stone-200/50 dark:border-white/10"
>
	<!-- Fondo base para modo claro y oscuro -->
	<div class="absolute inset-0 pointer-events-none bg-stone-50/95 dark:bg-stone-950/95"></div>
	<!-- Gradiente radial con el tinte del momento -->
	<div
		class="absolute inset-0 pointer-events-none opacity-80 dark:opacity-100"
		style="background: radial-gradient(circle at 50% 35%, { bgColor }24 0%, transparent 80%);"
	></div>

	<!-- Resplandor ambiental suave del color del momento -->
	<div
		class="absolute -top-12 -right-12 w-44 h-44 rounded-full pointer-events-none opacity-20 dark:opacity-35 blur-3xl transition-transform duration-700"
		style="background-color: { bgColor };"
	></div>
	<div
		class="absolute -bottom-12 -left-12 w-40 h-40 rounded-full pointer-events-none opacity-15 dark:opacity-30 blur-3xl transition-transform duration-700"
		style="background-color: { bgColor };"
	></div>

	{#if isViewed}
		<div
			class="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center mb-2.5 shadow-md transition-transform hover:scale-105 duration-300"
			style="background-color: { bgColor }18; color: { bgColor }; border: 1px solid { bgColor }40; box-shadow: 0 0 20px -4px { bgColor }30;"
		>
			<Lock size={ 22 } />
		</div>
		<h4 class="relative z-10 text-sm font-extrabold text-stone-900 dark:text-white tracking-tight">
			Momento efímero ya visto
		</h4>
		<p class="relative z-10 text-[11px] text-stone-500 dark:text-stone-300 max-w-xs mt-1 leading-relaxed">
			Este momento solo podía visualizarse una única vez y ya ha sido consumido.
		</p>
		{#if canReplay && onReplay}
			<button
				type="button"
				onpointerdown={( e: PointerEvent ) => {
					e.stopPropagation();
				}}
				onpointerup={( e: PointerEvent ) => {
					e.stopPropagation();
				}}
				onclick={( e: MouseEvent ) => {
					e.stopPropagation();
					onReplay();
				}}
				class="relative z-10 mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md hover:brightness-105 select-none"
				style="background: linear-gradient(135deg, { bgColor }25 0%, { bgColor }15 100%); color: { bgColor }; border: 1px solid { bgColor }50; box-shadow: 0 4px 15px -3px { bgColor }30;"
			>
				<RotateCcw size={ 13 } />
				<span>Volver a ver (Super Admin)</span>
			</button>
		{/if}
	{:else}
		<div class="relative z-10 w-12 h-12 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center mb-2 shadow-md border border-amber-500/25">
			<Flame size={ 22 } />
		</div>
		<div class="relative z-10 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold uppercase tracking-widest mb-1.5 border border-amber-500/25">
			<ShieldAlert size={ 11 } />
			<span>Ver una sola vez</span>
		</div>
		<h4 class="relative z-10 text-sm font-extrabold text-stone-900 dark:text-white">
			{ isPaused ? 'Momento Pausado' : 'Momento Confidencial' }
		</h4>
		<p class="relative z-10 text-[11px] text-stone-600 dark:text-stone-300 max-w-xs mt-1 mb-3 leading-relaxed">
			{#if isPaused}
				Mantén presionado para continuar viendo. Te quedan { secondsLeft } segundos restantes.
			{:else}
				Mantén presionado el botón para ver este recuerdo. Si sueltas el clic el temporizador se pausará.
			{/if}
		</p>

		<button
			type="button"
			onpointerdown={( e: PointerEvent ) => {
				e.preventDefault();
				onStartHolding();
			}}
			onpointerup={( e: PointerEvent ) => {
				e.preventDefault();
				onStopHolding();
			}}
			onpointercancel={( e: PointerEvent ) => {
				e.preventDefault();
				onStopHolding();
			}}
			class="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-amber-500 to-rose-500 text-white text-xs font-bold shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer select-none"
		>
			{#if isPaused}
				<Hand size={ 14 } class="animate-bounce" />
				<span>Mantén presionado ({ secondsLeft }s restantes)</span>
			{:else}
				<Eye size={ 14 } />
				<span>Mantén presionado para ver</span>
			{/if}
		</button>
	{/if}
</div>
