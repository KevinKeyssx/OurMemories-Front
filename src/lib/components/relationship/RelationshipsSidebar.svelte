<script lang="ts">
	import type { Component }   from 'svelte';
	import { fade, fly }        from 'svelte/transition';

	import {
		Heart,
		Home,
		Settings2,
		X
	}                   from '@lucide/svelte';
	import { Tooltip }  from 'bits-ui';


	import type { Relationship }        from '$lib/types';
	import RelationshipCard             from './RelationshipCard.svelte';
	import { RELATIONSHIP_ICON_MAP }    from '$lib/components/shared/inputs/IconPicker.svelte';


    interface Props {
		relationships        : Relationship[];
		activeRelationshipId : string;
		isLoading            : boolean;
		isMobileOpen         : boolean;
		onCloseMobile        : () => void;
		onOpenGroupEditor    : () => void;
	}

	let {
		relationships,
		activeRelationshipId,
		isLoading,
		isMobileOpen,
		onCloseMobile,
		onOpenGroupEditor
	}: Props = $props();

	const ICON_MAP: Record<string, Component> = RELATIONSHIP_ICON_MAP;

	const sortedRelationships = $derived<Relationship[]>(
		[ ...relationships ].sort( ( a: Relationship, b: Relationship ) => {
			return new Date( a.created_at ).getTime() - new Date( b.created_at ).getTime();
		} )
	);

	const isImageAvatar = ( avatar: string | undefined ): boolean => {
		if ( !avatar ) {
			return false;
		}

		return avatar.startsWith( 'http://' ) || avatar.startsWith( 'https://' ) || avatar.startsWith( 'data:image' );
	};

	const isHomeActive = $derived<boolean>( !activeRelationshipId );
</script>

<!-- Barra Lateral Fija para Escritorio (Desktop Sidebar) -->
<aside class="hidden lg:flex fixed left-0 top-0 bottom-0 w-20 flex-col items-center py-10 border-r border-stone-200/50 dark:border-white/5 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md z-40 transition-colors duration-500 overflow-hidden select-none">
	<!-- Botón Superior Home / Dashboard Principal -->
	<a
		href="/dashboard"
		class="w-14 h-14 rounded-2xl mb-12 flex items-center justify-center text-white shadow-lg bg-linear-to-tr from-brand-accent to-pink-500 shadow-brand-accent/30 hover:shadow-brand-accent/50 hover:scale-105 active:scale-95 transition-all duration-300 shrink-0 { isHomeActive ? 'ring-3 ring-brand-accent shadow-brand-accent/50 scale-105' : 'opacity-85 hover:opacity-100' }"
		title="Ir al Dashboard Principal"
		aria-label="Ir al Dashboard Principal"
	>
		<Home size={ 26 } />
	</a>

	{#if isLoading}
		<!-- Skeleton de la lista de Relaciones -->
		<div class="flex flex-col gap-4 items-center w-full px-4 flex-1 overflow-hidden">
			{#each [ 1, 2, 3 ] as _}
				<div class="w-12 h-12 rounded-full bg-stone-200 dark:bg-white/10 animate-pulse shrink-0"></div>
			{/each}
		</div>
	{:else}
		<!-- Navegación de Relaciones con Tooltips Bits UI -->
		<Tooltip.Provider>
			<nav class="flex flex-col gap-4 items-center w-full px-2 overflow-y-auto overflow-x-hidden no-scrollbar pt-0 pb-6 flex-1">
				{#each sortedRelationships as rel (rel.id)}
					<RelationshipCard
						relationship={ rel }
						isActive={ rel.id === activeRelationshipId }
					/>
				{/each}
			</nav>
		</Tooltip.Provider>
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
			<Settings2 size={ 20 } />
		</button>
	</div>
</aside>

<!-- Menú Desplegable (Drawer) para Dispositivos Móviles -->
{#if isMobileOpen}
	<div class="lg:hidden fixed inset-0 z-50 flex">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			transition:fade={ { duration: 250 } }
			class="fixed inset-0 bg-stone-950/60 backdrop-blur-sm"
			onclick={onCloseMobile}
		></div>

		<div
			transition:fly={ { x: -280, duration: 300 } }
			class="relative w-72 max-w-[85vw] bg-white dark:bg-dark-card border-r border-stone-200/60 dark:border-white/10 h-full p-6 flex flex-col justify-between shadow-2xl z-10"
		>
			<div class="flex flex-col h-full">
				<div class="flex items-center justify-between pb-6 border-b border-stone-100 dark:border-white/5 shrink-0">
					<div class="flex items-center gap-2.5">
						<a
							href="/dashboard"
							onclick={onCloseMobile}
							class="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md bg-linear-to-tr from-brand-accent to-pink-500 shadow-brand-accent/25 hover:scale-105 active:scale-95 transition-all shrink-0 { isHomeActive ? 'ring-2 ring-brand-accent' : '' }"
							title="Ir al Dashboard Principal"
							aria-label="Ir al Dashboard Principal"
						>
							<Home size={ 20 } />
						</a>
						<div>
							<h3 class="text-sm font-bold tracking-tight">Dashboard</h3>
							<p class="text-[10px] text-stone-400 uppercase tracking-wider">OurMemories</p>
						</div>
					</div>

					<button
						type="button"
						onclick={onCloseMobile}
						class="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-white/5 transition-colors"
						aria-label="Cerrar menú"
					>
						<X size={ 18 } />
					</button>
				</div>

				<nav class="py-6 space-y-2 flex-1 overflow-y-auto no-scrollbar">
					{#if isLoading}
						{#each [ 1, 2, 3 ] as _}
							<div class="h-12 rounded-2xl bg-stone-200 dark:bg-white/10 animate-pulse"></div>
						{/each}
					{:else}
						{#each sortedRelationships as rel (rel.id)}
							{@const IconComp = ICON_MAP[ rel.avatar ] || Heart}
							{@const isActive = rel.id === activeRelationshipId}
							{@const isImage = isImageAvatar( rel.avatar )}
							<a
								href={`/dashboard/${ rel.path_name }`}
								onclick={onCloseMobile}
								class="group flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 { isActive ? 'shadow-md scale-[1.02]' : 'text-stone-500 hover:bg-stone-100/70 dark:hover:bg-white/5 hover:text-stone-800 dark:hover:text-stone-200' }"
								style={ isActive ? `background: linear-gradient(90deg, ${ rel.color }22 0%, ${ rel.color }08 100%); border-left: 4px solid ${ rel.color }; box-shadow: 0 4px 20px -4px ${ rel.color }33; color: ${ rel.color };` : '' }
							>
								<div class="flex items-center gap-3">
									<div
										class="w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 overflow-hidden"
										style={ isActive ? `box-shadow: 0 0 0 1.5px ${ rel.color }, 0 2px 8px ${ rel.color }44;` : 'background: rgba(120, 120, 120, 0.1);' }
									>
										{#if isImage}
											<img
												src={ rel.avatar }
												alt={ rel.name }
												class="w-full h-full object-cover"
											/>
										{:else}
											<IconComp
												size={ 18 }
												style="color: { isActive ? rel.color : 'currentColor' };"
											/>
										{/if}
									</div>
									<span class="font-bold">{ rel.name }</span>
								</div>

								{#if isActive}
									<div
										class="w-2 h-2 rounded-full"
										style="background-color: { rel.color }; box-shadow: 0 0 8px { rel.color };"
									></div>
								{/if}
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
						<Settings2 size={ 16 } />
						<span>Editar Relaciones</span>
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

