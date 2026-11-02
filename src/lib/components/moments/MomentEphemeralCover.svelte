<script lang="ts">
	import { Flame, Eye, Lock, ShieldAlert } from '@lucide/svelte';

	interface Props {
		isViewed : boolean;
		onReveal : () => void;
	}

	let {
		isViewed,
		onReveal
	}: Props = $props();
</script>

<div class="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center backdrop-blur-xl bg-stone-900/90 text-white select-none">
	{#if isViewed}
		<div class="w-14 h-14 rounded-2xl bg-white/10 text-stone-400 flex items-center justify-center mb-3 shadow-inner">
			<Lock size={ 24 } />
		</div>
		<h4 class="text-sm font-bold text-stone-300">Momento efímero ya visto</h4>
		<p class="text-[11px] text-stone-500 max-w-xs mt-1 leading-relaxed">
			Este momento solo podía visualizarse una única vez y ya ha sido consumido.
		</p>
	{:else}
		<div class="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 shadow-lg animate-pulse">
			<Flame size={ 26 } />
		</div>
		<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-extrabold uppercase tracking-widest mb-2 border border-amber-500/20">
			<ShieldAlert size={ 12 } />
			<span>Ver una sola vez</span>
		</div>
		<h4 class="text-sm font-extrabold text-white">Momento Confidencial</h4>
		<p class="text-[11px] text-stone-400 max-w-xs mt-1 mb-4 leading-relaxed">
			Al tocar el botón podrás ver este recuerdo. Una vez cerrado no volverá a estar disponible para ti.
		</p>

		<button
			type="button"
			onclick={onReveal}
			class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-linear-to-r from-amber-500 to-rose-500 text-white text-xs font-bold shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all"
		>
			<Eye size={ 15 } />
			<span>Tocar para Revelar</span>
		</button>
	{/if}
</div>

