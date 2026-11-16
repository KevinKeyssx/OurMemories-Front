<script lang="ts">
	import { Sparkles, ArrowRight, Lock, ChevronDown } from '@lucide/svelte';

    import LogoCover from '$lib/components/shared/LogoCover.svelte';


    interface Props {
		firstRelationPath : string;
	}


    let { firstRelationPath }: Props = $props();


    function handleScrollDown( e: MouseEvent ): void {
		e.preventDefault();

        const target = document.getElementById( 'funciones' );

        if ( target ) {
			target.scrollIntoView({
				behavior : 'smooth',
				block    : 'start'
			});

            window.history.pushState( null, '', '#funciones' );
		}
	}
</script>

<section class="min-h-screen flex flex-col justify-between items-center px-4 sm:px-6 pt-24 sm:pt-28 pb-6 sm:pb-8 text-center max-w-6xl mx-auto relative">
	<div class="flex-1 flex flex-col justify-center items-center w-full my-auto">
		<!-- Logo Protagonista Central Interactivo 3D (LogoCover) -->
		<div class="flex justify-center mb-5 sm:mb-7 text-[11px] sm:text-[14px] md:text-[16px]">
			<div class="relative group">
				<div class="absolute inset-0 bg-linear-to-tr from-amber-300/25 via-fuchsia-400/20 to-purple-400/25 dark:from-amber-400/30 dark:via-fuchsia-500/25 dark:to-purple-600/35 rounded-full blur-3xl transform scale-125 pointer-events-none animate-pulse"></div>

                <LogoCover />
			</div>
		</div>

		<!-- Badge de Privacidad e Intimidad -->
		<div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 dark:bg-purple-400/10 border border-purple-500/25 text-purple-800 dark:text-purple-300 text-xs font-bold mb-5 backdrop-blur-md shadow-xs">
			<Sparkles size={ 14 } class="text-amber-500 animate-spin" style="animation-duration: 6s;" />

            <span>Tu espacio íntimo, personal y seguro</span>
		</div>

		<!-- Título Monumental -->
		<h1 class="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] max-w-4xl mx-auto mb-5 text-purple-950 dark:text-white">
			Donde los recuerdos se guardan, <br class="hidden sm:inline" />
			<span class="bg-linear-to-r from-amber-400 via-rose-500 to-purple-500 bg-clip-text text-transparent">no se publican.</span>
		</h1>

		<!-- Subtítulo Envolvente -->
		<p class="text-sm sm:text-lg md:text-xl text-purple-900/80 dark:text-purple-200/85 max-w-2xl mx-auto leading-relaxed font-normal mb-7 sm:mb-9">
			Crea espacios privados e íntimos para compartir álbumes, fotografías, videos, notas de voz y dedicatorias solo con las personas que realmente importan. <span class="font-bold text-purple-950 dark:text-purple-100">Sin algoritmos, sin likes públicos y lejos del ruido.</span>
		</p>

		<!-- Botones de Acción (CTAs) -->
		<div class="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
			<a
				href={`/dashboard/${ firstRelationPath }`}
				class="inline-flex items-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-extrabold text-white shadow-2xl hover:scale-105 active:scale-95 transition-all group"
				style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 35%, #e11d48 75%, #7c3aed 100%); box-shadow: 0 15px 35px -5px rgba(245, 158, 11, 0.45), 0 5px 20px -2px rgba(124, 58, 237, 0.35);"
			>
				<span>Comenzar mi espacio privado</span>

                <ArrowRight size={ 18 } class="transition-transform group-hover:translate-x-1" />
			</a>

			<a
				href="/login"
				class="inline-flex items-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl bg-white/90 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 text-purple-900 dark:text-purple-100 text-sm sm:text-base font-bold hover:border-brand-accent hover:bg-purple-50 dark:hover:bg-purple-900/40 transition-all shadow-md shadow-purple-950/5 active:scale-95"
			>
				<Lock size={ 16 } />
				<span>Acceder a mi cuenta</span>
			</a>
		</div>
	</div>

	<!-- Indicador sutil de scroll hacia abajo -->
	<div class="pt-4 pb-1">
		<a
			href="#funciones"
			onclick={handleScrollDown}
			class="inline-flex flex-col items-center gap-1 text-[11px] font-bold text-purple-800/70 dark:text-purple-300/70 hover:text-purple-950 dark:hover:text-white transition-colors group cursor-pointer"
			aria-label="Ir a las funciones"
		>
			<span class="tracking-wider uppercase text-[10px]">Descubre las funciones</span>
			<ChevronDown size={ 18 } class="animate-bounce text-amber-500 group-hover:translate-y-0.5 transition-transform" />
		</a>
	</div>
</section>
