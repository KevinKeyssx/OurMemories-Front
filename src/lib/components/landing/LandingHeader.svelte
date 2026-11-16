<script lang="ts">
	import { Sun, Moon, Lock, ArrowRight } from '@lucide/svelte';

    import { memoriesStore } from '$lib/store.svelte';


    interface Props {
		firstRelationPath : string;
	}


    let { firstRelationPath }: Props = $props();


    let isScrolled = $state<boolean>( false );


    function handleScroll(): void {
		isScrolled = window.scrollY > 20;
	}


    function handleNavClick( e: MouseEvent, sectionId: string ): void {
		if ( typeof window !== 'undefined' && ( window.location.pathname === '/' || window.location.pathname === '' ) ) {
			e.preventDefault();

            const target = document.getElementById( sectionId );

            if ( target ) {
				target.scrollIntoView({
					behavior : 'smooth',
					block    : 'start'
				});

                window.history.pushState( null, '', `#${ sectionId }` );
			}
		}
	}


    function handleLogoClick( e: MouseEvent ): void {
		if ( typeof window !== 'undefined' && ( window.location.pathname === '/' || window.location.pathname === '' ) ) {
			e.preventDefault();

            window.scrollTo({
				top      : 0,
				behavior : 'smooth'
			});

            window.history.pushState( null, '', '/' );
		}
	}
</script>

<svelte:window onscroll={handleScroll} />

<header class="fixed top-4 left-0 right-0 z-50 max-w-6xl w-[calc(100%-2rem)] mx-auto px-4 sm:px-6 rounded-3xl backdrop-blur-xl border transition-all duration-300 { isScrolled ? 'py-2.5 bg-white/95 dark:bg-dark-card/95 border-purple-300/80 dark:border-purple-500/40 shadow-2xl shadow-purple-950/20' : 'py-3.5 bg-white/85 dark:bg-dark-card/90 border-purple-200/70 dark:border-purple-500/25 shadow-xl shadow-purple-950/10' }">
	<div class="flex items-center justify-between">
		<!-- Logo e Isotipo Oficial -->
		<a href="/" onclick={handleLogoClick} class="flex items-center gap-3 group select-none cursor-pointer" aria-label="Ir al inicio de OurMemories">
			<div class="relative">
				<div class="absolute inset-0 bg-purple-500/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>

				<img
					src="/logo.avif"
					alt="Logo OurMemories"
					class="size-9 object-contain drop-shadow-md select-none transition-transform duration-300 group-hover:scale-105"
				/>
			</div>

			<div class="flex items-baseline gap-1">
				<span class="text-xl font-black tracking-tight text-purple-950 dark:text-white">Our<span class="italic bg-linear-to-r from-purple-600 to-amber-500 dark:from-purple-500 dark:to-amber-500 bg-clip-text text-transparent inline-block pr-1.5">Memories</span></span>
			</div>
		</a>

		<!-- Navegación de Anclajes Internos -->
		<nav class="hidden md:flex items-center gap-6 text-xs font-bold text-purple-900/80 dark:text-purple-200">
			<a href="/#funciones" onclick={ ( e: MouseEvent ) => handleNavClick( e, 'funciones' ) } class="hover:text-brand-accent dark:hover:text-dark-accent transition-colors cursor-pointer">Funciones</a>
			<a href="/#proposito" onclick={ ( e: MouseEvent ) => handleNavClick( e, 'proposito' ) } class="hover:text-brand-accent dark:hover:text-dark-accent transition-colors cursor-pointer">¿Qué es?</a>
			<a href="/#organizacion" onclick={ ( e: MouseEvent ) => handleNavClick( e, 'organizacion' ) } class="hover:text-brand-accent dark:hover:text-dark-accent transition-colors cursor-pointer">Organización</a>
			<a href="/#innovacion" onclick={ ( e: MouseEvent ) => handleNavClick( e, 'innovacion' ) } class="hover:text-brand-accent dark:hover:text-dark-accent transition-colors cursor-pointer">Innovación</a>
			<a href="/#planes" onclick={ ( e: MouseEvent ) => handleNavClick( e, 'planes' ) } class="hover:text-brand-accent dark:hover:text-dark-accent transition-colors cursor-pointer">Planes</a>
		</nav>

		<!-- Controles: Selector de Tema y Botones de Acceso -->
		<div class="flex items-center gap-2.5 sm:gap-3">
			<button
				type="button"
				onclick={ () => memoriesStore.toggleTheme() }
				class="size-10 rounded-2xl flex items-center justify-center border border-purple-200/70 dark:border-purple-500/25 hover:bg-purple-100/60 dark:hover:bg-purple-950/60 transition-all text-purple-800 dark:text-purple-200 cursor-pointer active:scale-95 shadow-xs bg-white/60 dark:bg-purple-950/30"
				aria-label="Cambiar tema visual"
			>
				{#if memoriesStore.theme === 'light'}
					<Moon size={ 18 } />
				{:else}
					<Sun size={ 18 } />
				{/if}
			</button>

			<a
				href="/login"
				class="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold border border-purple-200/70 dark:border-purple-500/25 hover:border-brand-accent text-purple-900 dark:text-purple-200 hover:text-brand-accent bg-purple-50/70 dark:bg-purple-950/40 transition-all shadow-xs active:scale-95"
			>
				<Lock size={ 13 } />
				<span>Acceso</span>
			</a>

			<a
				href={`/dashboard/${ firstRelationPath }`}
				class="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-2xl text-xs font-extrabold text-white shadow-lg active:scale-95 transition-all hover:scale-105"
				style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 35%, #e11d48 75%, #7c3aed 100%); box-shadow: 0 8px 20px -3px rgba(245, 158, 11, 0.45);"
			>
				<span>Entrar</span>
				<ArrowRight size={ 14 } />
			</a>
		</div>
	</div>
</header>
