<script lang="ts">
	import { Flame, Clock } from '@lucide/svelte';

	interface Props {
		secondsLeft      : number;
		progressPercent  : number;
		showBadge       ?: boolean;
		class           ?: string;
	}

	let {
		secondsLeft,
		progressPercent,
		showBadge = false,
		class: customClass = ''
	}: Props = $props();
</script>

<div class="relative w-full { customClass }">
	<!-- Insignia flotante opcional con contador y llama -->
	{#if showBadge && secondsLeft > 0}
		<div class="flex items-center justify-between px-3.5 py-2 mb-2 rounded-2xl bg-amber-500/95 text-stone-950 backdrop-blur-md shadow-xl border border-amber-300/40 animate-pulse">
			<div class="flex items-center gap-1.5 font-black text-xs tracking-tight">
				<Flame size={ 16 } class="animate-bounce text-red-700" />
				<span>Momento Efímero</span>
			</div>
			<div class="flex items-center gap-1.5 font-black text-xs bg-black/25 px-2.5 py-0.5 rounded-full text-white">
				<Clock size={ 13 } />
				<span>{ secondsLeft }s restantes</span>
			</div>
		</div>
	{/if}

	<!-- Pista base de la mecha -->
	<div class="relative z-40 w-full h-1.5 bg-black/40 overflow-visible rounded-full">
		<!-- Pista brillante que se consume hacia la izquierda sincronizada 1:1 -->
		<div
			class="h-full relative rounded-r-full shadow-[0_0_12px_rgba(249,115,22,0.85),0_0_4px_rgba(254,240,138,1)] transition-[width] duration-75 ease-linear"
			style="width: { progressPercent }%; background: linear-gradient(90deg, #dc2626 0%, #ea580c 45%, #f59e0b 80%, #fef08a 100%);"
		>
			<!-- Punta incandescente / Chispa de fuego en el extremo que se va consumiendo -->
			<div class="absolute -top-1.5 -right-2 size-4.5 rounded-full flex items-center justify-center pointer-events-none z-50">
				<!-- Halo pulsante de combustión -->
				<span class="absolute inset-0 rounded-full bg-orange-500/80 blur-xs animate-ping"></span>
				<!-- Resplandor ardiente -->
				<span class="absolute -inset-1 rounded-full bg-amber-400/60 blur-xs"></span>
				<!-- Núcleo incandescente al rojo vivo -->
				<span class="relative size-3.5 rounded-full bg-white shadow-[0_0_10px_3px_#f97316,0_0_18px_6px_#ef4444] border-2 border-amber-300"></span>
			</div>
		</div>
	</div>
</div>

