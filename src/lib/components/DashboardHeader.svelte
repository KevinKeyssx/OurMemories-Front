<script lang="ts">
    import { scale } from 'svelte/transition';

    import {
		Plus,
		Sun,
		Moon,
		Menu,
		User,
		ChevronDown,
		LogOut,
	} from '@lucide/svelte';

    import type { Relationship }    from '$lib/types';
	import { memoriesStore }        from '$lib/store.svelte';


    interface Props {
		currentRelationship ?: Relationship;
		isScrolled           : boolean;
		onOpenMobileSidebar  : () => void;
		onOpenUploadModal    : () => void;
	}


    let {
		currentRelationship,
		isScrolled,
		onOpenMobileSidebar,
		onOpenUploadModal
	}: Props = $props();


    let isUserMenuOpen = $state<boolean>( false );

	const currentUser   = $derived( memoriesStore.currentUser );
	const userPoints    = $derived<number>( currentUser?.points || 0 );
	const userLevel     = $derived<number>( Math.floor( userPoints / 100 ) + 1 );
	const userInitials  = $derived<string>(
		`${ currentUser?.name?.charAt( 0 ) || 'U' }${ currentUser?.last_name?.charAt( 0 ) || '' }`.toUpperCase()
	);
</script>

<svelte:window onclick={() => { if ( isUserMenuOpen ) isUserMenuOpen = false; }} />

<div class="fixed top-0 left-0 lg:left-24 right-0 z-30 transition-all duration-700 {isScrolled ? 'bg-brand-paper/95 dark:bg-dark-paper/95 backdrop-blur-xl shadow-xl border-b border-stone-200/20 dark:border-white/5' : 'bg-transparent'}">
	<header class="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 transition-all duration-700 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 {isScrolled ? 'py-3' : 'pt-10 pb-6'}">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<!-- Botón para abrir el Drawer de Relaciones en Móvil -->
				<button
					type="button"
					onclick={onOpenMobileSidebar}
					class="lg:hidden p-2.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-stone-200/60 dark:border-white/10 text-stone-600 dark:text-stone-300 shadow-sm active:scale-95 transition-transform"
					aria-label="Abrir relaciones"
				>
					<Menu size={20} />
				</button>

				<div class="transition-all duration-500 select-none">
					<div class="flex items-center gap-3 transition-all duration-500 origin-left {isScrolled ? 'opacity-0 h-0 overflow-hidden mb-0 scale-75' : 'opacity-100 h-6 mb-2'}">
						<span class="text-[10px] uppercase tracking-[0.4em] text-brand-secondary dark:text-brand-secondary font-black whitespace-nowrap">Nuestras memorias digitales</span>
						<div class="h-px w-12 bg-brand-secondary/30"></div>
					</div>
					<h1 class="font-black tracking-tighter text-brand-ink dark:text-dark-ink transition-all duration-500 origin-left {isScrolled ? 'text-2xl sm:text-3xl' : 'text-4xl sm:text-6xl'}">
						Our<span class="italic transition-colors duration-500" style="color: {currentRelationship?.color || '#f43f5e'};">Memories</span>
					</h1>
					<!-- <p class="text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 {isScrolled ? 'opacity-0 scale-90 h-0 overflow-hidden' : 'opacity-50 mt-1'}">
						Relación: {currentRelationship?.name || 'Cargando...'}
					</p> -->
				</div>
			</div>

			<div class="flex items-center gap-2 md:hidden">
				<button
					type="button"
					onclick={() => memoriesStore.toggleTheme()}
					class="p-2.5 rounded-2xl border border-stone-200/60 dark:border-white/10 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors text-stone-600 dark:text-stone-300 active:scale-95"
					aria-label="Cambiar tema"
				>
					{#if memoriesStore.theme === 'light'}
						<Moon size={18} />
					{:else}
						<Sun size={18} />
					{/if}
				</button>

				<button
					type="button"
					onclick={onOpenUploadModal}
					class="p-2.5 rounded-2xl text-white shadow-lg active:scale-95 transition-all hover:brightness-110"
					style="background-color: { currentRelationship?.color || '#f43f5e' }; box-shadow: 0 8px 20px -4px { currentRelationship?.color || '#f43f5e' }66;"
					aria-label="Nuevo"
				>
					<Plus size={ 18 } />
				</button>
			</div>
		</div>

		<!-- Área Derecha: Perfil de Usuario Interactivo y Acciones -->
		<div class="flex items-center gap-3 sm:gap-5">
			<!-- Cápsula Interactivade Perfil del Usuario -->
			<div class="relative">
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<button
					type="button"
					onclick={( e ) => {
						e.stopPropagation();
						isUserMenuOpen = !isUserMenuOpen;
					}}
					class="flex items-center gap-3 bg-white/70 dark:bg-dark-card/70 border border-stone-200/60 dark:border-white/10 pl-2 pr-3 py-1.5 rounded-2xl shadow-sm backdrop-blur-md transition-all hover:shadow-md hover:border-brand-accent/50 group text-left active:scale-[0.98]"
				>
					<!-- Avatar con Iniciales y Degradado Vibrante -->
					<div class="w-9 h-9 rounded-xl bg-linear-to-tr from-brand-accent via-purple-500 to-pink-500 flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-brand-accent/20 group-hover:scale-105 transition-transform duration-300">
						{userInitials}
					</div>

					<!-- Datos del Usuario -->
					<div class="hidden sm:flex flex-col pr-1">
						<span class="text-xs font-bold tracking-tight text-stone-800 dark:text-stone-100 group-hover:text-brand-accent transition-colors">
							{currentUser.name} {currentUser.last_name}
						</span>
						<div class="flex items-center gap-1.5">
							<span class="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-brand-accent/10 text-brand-accent dark:text-dark-accent">
								Nivel {userLevel}
							</span>
							<span class="text-[10px] font-semibold text-stone-400">
								{userPoints} pts
							</span>
						</div>
					</div>

					<ChevronDown size={14} class="text-stone-400 transition-transform duration-300 {isUserMenuOpen ? 'rotate-180' : ''}" />
				</button>

				<!-- Menú Desplegable Flotante del Usuario -->
				{#if isUserMenuOpen}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						transition:scale={{ start: 0.95, duration: 150 }}
						onclick={( e ) => e.stopPropagation()}
						class="absolute right-0 top-14 w-60 bg-white dark:bg-dark-card border border-stone-200/70 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden"
					>
						<div class="px-3 py-2.5 border-b border-stone-100 dark:border-white/5 mb-1">
							<p class="text-xs font-bold text-stone-800 dark:text-stone-100">{currentUser.name} {currentUser.last_name}</p>
							<p class="text-[11px] text-stone-400 truncate">{currentUser.email}</p>
							<div class="mt-2 flex items-center gap-2">
								<span class="text-[10px] font-bold uppercase tracking-wider text-stone-400">Puntos Totales:</span>
								<span class="text-xs font-extrabold text-brand-accent">{userPoints} pts</span>
							</div>
						</div>

						<a
							href="/profile"
							onclick={() => ( isUserMenuOpen = false )}
							class="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/5 rounded-xl transition-colors"
						>
							<User size={15} class="text-brand-accent" />
							<span>Mi Perfil y Ajustes</span>
						</a>

						<button
							type="button"
							onclick={() => {
								isUserMenuOpen = false;
								memoriesStore.logout();
							}}
							class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors mt-1"
						>
							<LogOut size={15} />
							<span>Cerrar Sesión</span>
						</button>
					</div>
				{/if}
			</div>

			<!-- Botón de Tema (Desktop) -->
			<button
				type="button"
				onclick={() => memoriesStore.toggleTheme()}
				class="hidden md:flex p-3 rounded-2xl border border-stone-200/60 dark:border-white/10 hover:bg-stone-100 dark:hover:bg-white/5 transition-all text-stone-600 dark:text-stone-300 active:scale-95 hover:scale-105"
				title="Cambiar tema"
				aria-label="Cambiar tema"
			>
				{#if memoriesStore.theme === 'light'}
					<Moon size={18} />
				{:else}
					<Sun size={18} />
				{/if}
			</button>

			<!-- Botón Nuevo (Desktop) -->
			<button
				type="button"
				onclick={onOpenUploadModal}
				class="hidden md:flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-semibold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all whitespace-nowrap hover:brightness-110"
				style="background-color: { currentRelationship?.color || '#f43f5e' }; box-shadow: 0 10px 25px -5px { currentRelationship?.color || '#f43f5e' }66;"
			>
				<Plus size={ 16 } />
				<span class="hidden lg:block">Nuevo</span>
			</button>
		</div>
	</header>
</div>
