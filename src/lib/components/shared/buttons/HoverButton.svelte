<script lang="ts">
	import { Clapperboard } from '@lucide/svelte';

	interface Props {
		onclick ?: () => void;
	}

	let {
		onclick
	}: Props = $props();
</script>

<!-- From Uiverse.io by Itskrish01 - Customized for OurMemories -->
<div class="relative group inline-block select-none">
	<div
		class="relative h-11 px-5 overflow-hidden rounded-2xl bg-[#10081c]/85 backdrop-blur-md z-10 flex items-center justify-center border border-white/10 transition-all duration-300 group-hover:scale-[1.03] group-hover:border-purple-400/40 group-active:scale-[0.97] shadow-lg shadow-purple-950/30"
	>
		<!-- Luz animada giratoria en hover (morado y dorado) -->
		<div
			class="absolute -inset-4 duration-1000 group-hover:animate-spin w-[150%] h-24 -top-6 -left-6 bg-linear-to-r from-purple-600 via-fuchsia-500 to-amber-400 blur-xl opacity-60 group-hover:opacity-100 transition-opacity"
		></div>

		<!-- Fondo interior de cristal morado noche (no negro) -->
		<div
			class="absolute inset-0.5 rounded-[14px] bg-[#10081c]/90 backdrop-blur-md transition-colors group-hover:bg-[#130b22]/85 shadow-inner"
		></div>

		<!-- Destello de luz diagonal que cruza en hover -->
		<div
			class="absolute z-10 -translate-x-36 group-hover:translate-x-56 transition-transform duration-700 ease-in-out h-full w-24 bg-linear-to-r from-transparent via-white/15 to-transparent -skew-x-12 pointer-events-none"
		></div>

		<!-- Botón interactivo y contenido -->
		<button
			type="button"
			{ onclick }
			class="relative z-10 font-bold text-sm h-full w-full flex items-center justify-center gap-2 cursor-pointer text-white tracking-wide"
		>
			<Clapperboard
				size={ 17 }
				class="text-amber-400 shrink-0 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
			/>
			<span>Modo Cine</span>
		</button>
	</div>
</div>
