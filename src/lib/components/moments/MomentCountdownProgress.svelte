<script lang="ts">
	import { Flame } from '@lucide/svelte';

	interface Props {
		secondsLeft      : number;
		progressPercent  : number;
		showBadge       ?: boolean;
		class           ?: string;
	}

	let {
		secondsLeft,
		progressPercent,
		class: customClass = ''
	}: Props = $props();
</script>

<div class="relative w-full py-1.5 { customClass }">
	<!-- Pista base de la mecha -->
	<div class="relative z-40 w-full h-1.5 bg-black/40 overflow-visible rounded-full">
		<!-- Pista brillante que se consume hacia la izquierda sincronizada 1:1 -->
		<div
			class="h-full relative rounded-r-full shadow-[0_0_12px_rgba(249,115,22,0.85),0_0_4px_rgba(254,240,138,1)] transition-[width] duration-75 ease-linear"
			style="width: { progressPercent }%; background: linear-gradient(90deg, #dc2626 0%, #ea580c 45%, #f59e0b 80%, #fef08a 100%);"
		>
			<!-- Indicador incandescente con los números del contador en el slider móvil -->
			<div class="absolute -top-2.5 -right-4 flex items-center justify-center pointer-events-none z-50">
				<!-- Resplandor pulsante ardiente -->
				<span class="absolute inset-0 rounded-full bg-orange-500/70 blur-xs animate-ping"></span>
				<span class="absolute -inset-1 rounded-full bg-amber-400/50 blur-xs"></span>

				<!-- Badge / Cápsula con el número de segundos restantes que viaja con el slider -->
				<div class="relative px-1.5 py-0.5 rounded-full bg-stone-950/95 text-amber-300 border-2 border-amber-300 shadow-[0_0_10px_3px_#f97316,0_0_18px_6px_#ef4444] text-[10px] font-mono font-black tracking-tight flex items-center gap-0.5 leading-none select-none">
					<Flame size={ 10 } class="text-orange-400 fill-orange-400 shrink-0" />
					<span>{ secondsLeft }s</span>
				</div>
			</div>
		</div>
	</div>
</div>

