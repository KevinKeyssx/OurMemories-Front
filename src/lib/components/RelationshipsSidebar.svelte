<script lang="ts">
    import type { Component } from 'svelte';
    import { fade, fly } from 'svelte/transition';

    import {
		Plus,
		Grid,
		Camera,
		Quote,
		Video,
		FileText,
		Smile,
		Heart,
		Users,
		Users2,
		Baby,
		Palmtree,
		Home,
		Settings2,
		X
	} from '@lucide/svelte';

    import type { Relationship } from '$lib/types';


    interface Props {
		relationships       : Relationship[];
		activeRelationshipId: string;
		isLoading           : boolean;
		isMobileOpen        : boolean;
		onCloseMobile       : () => void;
		onOpenGroupEditor   : () => void;
	}


    let {
		relationships,
		activeRelationshipId,
		isLoading,
		isMobileOpen,
		onCloseMobile,
		onOpenGroupEditor
	}: Props = $props();


    const ICON_MAP: Record<string, Component> = {
		Plus      : Plus,
		Grid      : Grid,
		Camera    : Camera,
		Quote     : Quote,
		Video     : Video,
		FileText  : FileText,
		Smile     : Smile,
		Heart     : Heart,
		Users     : Users,
		Users2    : Users2,
		Baby      : Baby,
		Palmtree  : Palmtree,
		Home      : Home,
		Settings2 : Settings2
	};


    const sortedRelationships = $derived<Relationship[]>(
    [ ...relationships ].sort( ( a: Relationship, b: Relationship ) => {
			return new Date( a.created_at ).getTime() - new Date( b.created_at ).getTime();
		} )
	);


    const activeRelationship = $derived<Relationship | undefined>(
		relationships.find( ( r: Relationship ) => r.id === activeRelationshipId ) || relationships[0]
	);


    const isImageAvatar = ( avatar: string | undefined ): boolean => {
		if ( !avatar ) {
			return false;
		}

        return avatar.startsWith( 'http://' ) || avatar.startsWith( 'https://' ) || avatar.startsWith( 'data:image' );
	};


    const ActiveGroupIcon = $derived<Component>(
		( activeRelationship ? ICON_MAP[activeRelationship.avatar] : null ) || ( Heart as Component )
	);
</script>

<!-- Barra Lateral Fija para Escritorio (Desktop Sidebar) -->
<aside class="hidden lg:flex fixed left-0 top-0 bottom-0 w-24 flex-col items-center py-10 border-r border-stone-200/50 dark:border-white/5 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md z-40 transition-colors duration-500 overflow-hidden select-none">
	{#if isLoading}
		<!-- Skeleton del Avatar Superior con brillo -->
		<div class="w-14 h-14 rounded-2xl mb-12 bg-stone-200 dark:bg-white/10 animate-pulse shrink-0"></div>

		<!-- Skeleton de la lista de Relaciones -->
		<div class="flex flex-col gap-6 items-center w-full px-4 flex-1 overflow-hidden">
			{#each [ 1, 2, 3 ] as _}
				<div class="w-12 h-12 rounded-2xl bg-stone-200 dark:bg-white/10 animate-pulse shrink-0"></div>
			{/each}
		</div>
	{:else}
		<!-- Avatar Superior Dinámico con Color y Resplandor -->
		<div
			class="w-14 h-14 rounded-2xl mb-12 flex items-center justify-center text-white shadow-lg transition-all duration-500 scale-110 shrink-0 overflow-hidden"
			style="background: {activeRelationship?.color || '#f43f5e'}; box-shadow: 0 10px 25px -5px {activeRelationship?.color || '#f43f5e'}66;"
		>
			{#if isImageAvatar( activeRelationship?.avatar )}
				<img
					src={activeRelationship?.avatar}
					alt={activeRelationship?.name}
					class="w-full h-full object-cover rounded-2xl"
				/>
			{:else}
				<ActiveGroupIcon size={24} fill="currentColor" />
			{/if}
		</div>

		<!-- Navegación de Relaciones -->
		<nav class="flex flex-col gap-6 items-center w-full px-2 overflow-y-auto overflow-x-hidden no-scrollbar pb-6 flex-1">
			{#each sortedRelationships as rel (rel.id)}
				{@const IconComp = ICON_MAP[rel.avatar] || Heart}
				{@const isActive = rel.id === activeRelationshipId}
				<a
					href={`/dashboard/${rel.path_name}`}
					class="group relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 shrink-0 overflow-hidden {isActive ? 'bg-white dark:bg-stone-800 shadow-md scale-110' : 'hover:scale-105 hover:bg-stone-100 dark:hover:bg-white/5'}"
					title={rel.name}
					aria-label={rel.name}
				>
					{#if isImageAvatar( rel.avatar )}
						<img
							src={rel.avatar}
							alt={rel.name}
							class="w-8 h-8 rounded-xl object-cover transition-transform group-hover:scale-110"
						/>
					{:else}
						<IconComp
							size={20}
							class="transition-colors duration-300"
							style="color: {isActive ? rel.color : '#888'};"
						/>
					{/if}

					{#if isActive}
						<div
							class="absolute -right-2 w-1.5 h-6 rounded-full transition-all duration-300"
							style="background: {rel.color};"
						></div>
					{/if}

					<!-- Tooltip animado al hacer hover -->
					<span class="absolute left-16 bg-black/85 dark:bg-stone-900/95 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-white/10 z-50">
						{rel.name}
					</span>
				</a>
			{/each}
		</nav>
	{/if}

	<div class="w-8 h-px bg-stone-200/50 dark:border-white/5 my-4 shrink-0"></div>

	<!-- Botón de Configuración -->
	<div class="flex flex-col items-center shrink-0">
		<button
			type="button"
			onclick={onOpenGroupEditor}
			class="w-12 h-12 flex items-center justify-center text-stone-500 dark:text-stone-400 hover:text-brand-secondary dark:hover:text-brand-secondary transition-all hover:scale-110 rounded-xl hover:bg-stone-100 dark:hover:bg-white/5 active:scale-95"
			title="Configurar relaciones"
			aria-label="Configurar relaciones"
		>
			<Settings2 size={20} />
		</button>
	</div>
</aside>

<!-- Menú Desplegable (Drawer) para Dispositivos Móviles -->
{#if isMobileOpen}
	<div class="lg:hidden fixed inset-0 z-50 flex">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			transition:fade={{ duration: 250 }}
			class="fixed inset-0 bg-stone-950/60 backdrop-blur-sm"
			onclick={onCloseMobile}
		></div>

		<div
			transition:fly={{ x: -280, duration: 300 }}
			class="relative w-72 max-w-[85vw] bg-white dark:bg-dark-card border-r border-stone-200/60 dark:border-white/10 h-full p-6 flex flex-col justify-between shadow-2xl z-10"
		>
			<div class="flex flex-col h-full">
				<div class="flex items-center justify-between pb-6 border-b border-stone-100 dark:border-white/5 shrink-0">
					<div class="flex items-center gap-2.5">
						<div
							class="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md overflow-hidden"
							style="background: {activeRelationship?.color || '#f43f5e'};"
						>
							{#if isImageAvatar( activeRelationship?.avatar )}
								<img
									src={activeRelationship?.avatar}
									alt={activeRelationship?.name}
									class="w-full h-full object-cover"
								/>
							{:else}
								<ActiveGroupIcon size={18} fill="currentColor" />
							{/if}
						</div>
						<div>
							<h3 class="text-sm font-bold tracking-tight">Relaciones</h3>
							<p class="text-[10px] text-stone-400 uppercase tracking-wider">{activeRelationship?.name || 'Selecciona'}</p>
						</div>
					</div>

					<button
						type="button"
						onclick={onCloseMobile}
						class="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-white/5 transition-colors"
						aria-label="Cerrar menú"
					>
						<X size={18} />
					</button>
				</div>

				<nav class="py-6 space-y-2 flex-1 overflow-y-auto no-scrollbar">
					{#if isLoading}
						{#each [ 1, 2, 3 ] as _}
							<div class="h-12 rounded-2xl bg-stone-200 dark:bg-white/10 animate-pulse"></div>
						{/each}
					{:else}
						{#each sortedRelationships as rel (rel.id)}
							{@const IconComp = ICON_MAP[rel.avatar] || Heart}
							{@const isActive = rel.id === activeRelationshipId}
							<a
								href={`/dashboard/${rel.path_name}`}
								onclick={onCloseMobile}
								class="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all {isActive ? 'bg-stone-100 dark:bg-white/10 text-brand-ink dark:text-white shadow-sm' : 'text-stone-500 hover:bg-stone-50 dark:hover:bg-white/5'}"
								style={isActive ? `border-left: 4px solid ${rel.color};` : ''}
							>
								{#if isImageAvatar( rel.avatar )}
									<img
										src={rel.avatar}
										alt={rel.name}
										class="w-6 h-6 rounded-lg object-cover"
									/>
								{:else}
									<span style="color: {rel.color};">
										<IconComp size={18} />
									</span>
								{/if}
								<span>{rel.name}</span>
							</a>
						{/each}
					{/if}
				</nav>

				<div class="pt-4 border-t border-stone-100 dark:border-white/5 flex items-center justify-end shrink-0">
					<button
						type="button"
						onclick={() => {
							onCloseMobile();
							onOpenGroupEditor();
						}}
						class="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-stone-500 hover:text-brand-accent rounded-xl hover:bg-stone-100 dark:hover:bg-white/5 transition-colors"
						title="Editar relaciones"
						aria-label="Editar relaciones"
					>
						<Settings2 size={16} />
						<span>Editar Relaciones</span>
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
