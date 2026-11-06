<script lang="ts">
	import type { Component }   from 'svelte';
	import { goto }             from '$app/navigation';

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
		ExternalLink,
		Palette,
		ShieldCheck,
		UserPlus,
		History,
		ChevronRight,
		Trash2,
		Edit3,
		Image as ImageIcon
	}                               from '@lucide/svelte';
    import {
		draggable,
		dropTargetForElements
	}                               from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
	import {
		attachClosestEdge,
		extractClosestEdge,
		type Edge
	}                               from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
    import { Tooltip, ContextMenu } from 'bits-ui';

	import type { Relationship }            from '$lib/types';
	import { memoriesStore }                from '$lib/store.svelte';
	import { DEFAULT_RELATIONSHIP_COLORS }  from '$lib/data';


	interface Props {
		relationship          : Relationship;
		isActive              : boolean;
		onOpenManage         ?: ( rel: Relationship, initialTab?: 'relacion' | 'roles' | 'invitar' | 'historial' ) => void;
		onDeleteRelationship ?: ( rel: Relationship ) => void;
	}

	let {
		relationship,
		isActive,
		onOpenManage,
		onDeleteRelationship
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

	function isImageAvatar( avatar: string | undefined ): boolean {
		if ( !avatar ) {
			return false;
		}

		return avatar.startsWith( 'http://' ) || avatar.startsWith( 'https://' ) || avatar.startsWith( 'data:image' );
	}

	const isImage = $derived<boolean>( isImageAvatar( relationship.avatar ) );
	const IconComp = $derived<Component>( ICON_MAP[ relationship.avatar ] || Heart );


	const isOwnerOrSuperAdmin = $derived<boolean>(
		memoriesStore.currentUser.role === 'super_admin' ||
		Boolean( relationship.created_by === memoriesStore.currentUser.id )
	);

	function handleOpen(): void {
		goto( `/dashboard/${ relationship.path_name }` );
	}

	function handleManage( tab: 'relacion' | 'roles' | 'invitar' | 'historial' = 'relacion' ): void {
		if ( onOpenManage ) {
			onOpenManage( relationship, tab );
		}
	}

	function handleQuickColor( col: string ): void {
		memoriesStore.updateRelationship( relationship.id, { color: col } );
	}

	function handleDeletePrompt(): void {
		if ( onDeleteRelationship ) {
			onDeleteRelationship( relationship );
		}
	}

	let cardElement = $state<HTMLDivElement | null>( null );
	let isDragging  = $state<boolean>( false );
	let closestEdge = $state<Edge | null>( null );

	$effect( () => {
		if ( !cardElement ) {
			return;
		}

		const cleanDraggable = draggable( {
			element        : cardElement,
			getInitialData : () => ({
				id    : relationship.id,
				order : relationship.order,
				type  : 'relationship'
			}),
			onDragStart : () => {
				isDragging = true;
			},
			onDrop : () => {
				isDragging = false;
			}
		} );

		const cleanDropTarget = dropTargetForElements( {
			element : cardElement,
			canDrop : ( { source } ) => {
				return source.data.type === 'relationship' && source.data.id !== relationship.id;
			},
			getData : ( { input, element, source } ) => {
				const data = {
					id    : relationship.id,
					order : relationship.order,
					type  : 'relationship'
				};

				const sourceOrder = typeof source.data.order === 'number' ? ( source.data.order as number ) : -1;
				const currentOrder = typeof relationship.order === 'number' ? relationship.order : -1;

				let allowedEdges: Edge[] = [ 'top', 'bottom' ];
				if ( sourceOrder !== -1 && currentOrder !== -1 ) {
					if ( sourceOrder === currentOrder - 1 ) {
						allowedEdges = [ 'bottom' ];
					} else if ( sourceOrder === currentOrder + 1 ) {
						allowedEdges = [ 'top' ];
					}
				}

				return attachClosestEdge( data, {
					element,
					input,
					allowedEdges
				} );
			},
			onDragEnter : ( { self } ) => {
				closestEdge = extractClosestEdge( self.data );
			},
			onDrag : ( { self } ) => {
				closestEdge = extractClosestEdge( self.data );
			},
			onDragLeave : () => {
				closestEdge = null;
			},
			onDrop : () => {
				closestEdge = null;
			}
		} );

		return () => {
			cleanDraggable();
			cleanDropTarget();
		};
	} );
</script>

<div
	bind:this={ cardElement }
	class="group relative w-full flex items-center justify-center py-1 transition-all duration-200 cursor-grab active:cursor-grabbing { isDragging ? 'opacity-35 scale-95' : 'opacity-100' }"
>
	<!-- Indicador de soltado superior (Drop Indicator Top) -->
	{#if closestEdge === 'top'}
		<div
			class="absolute -top-1.5 left-2 right-2 h-1 rounded-full z-30 transition-all pointer-events-none animate-pulse"
			style="background-color: { relationship.color }; box-shadow: 0 0 12px { relationship.color };"
		></div>
	{/if}

	<!-- Indicador de soltado inferior (Drop Indicator Bottom) -->
	{#if closestEdge === 'bottom'}
		<div
			class="absolute -bottom-1.5 left-2 right-2 h-1 rounded-full z-30 transition-all pointer-events-none animate-pulse"
			style="background-color: { relationship.color }; box-shadow: 0 0 12px { relationship.color };"
		></div>
	{/if}

	<!-- Píldora indicadora lateral izquierda con animación suave -->
	<div
		class="absolute left-0 w-1.5 rounded-r-full transition-all duration-300 ease-out { isActive ? 'h-8 opacity-100' : 'h-0 opacity-0 group-hover:h-3.5 group-hover:opacity-60' }"
		style="background-color: { relationship.color }; box-shadow: 0 0 12px { relationship.color };"
	></div>

	<!-- Context Menu Bits UI activado con Click Derecho -->
	<ContextMenu.Root>
		<ContextMenu.Trigger>
			{#snippet child({ props: contextMenuProps })}
				<!-- Tooltip Bits UI con Trigger en el avatar circular de la relación -->
				<Tooltip.Root delayDuration={ 150 }>
					<Tooltip.Trigger>
						{#snippet child({ props: tooltipProps })}
							<a
								href={`/dashboard/${ relationship.path_name }`}
								draggable="false"
								{...contextMenuProps}
								{...tooltipProps}
								class="relative size-11 ml-2 flex items-center justify-center rounded-full transition-all duration-300 shrink-0 select-none { isActive ? 'scale-110 shadow-lg' : 'hover:scale-105 bg-stone-100/70 dark:bg-white/5 hover:bg-stone-200/70 dark:hover:bg-white/10 text-stone-400 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200' }"
								style={ isActive ? `box-shadow: 0 0 0 2px ${ relationship.color }, 0 8px 24px -4px ${ relationship.color }77; background: ${ isImage ? 'transparent' : `${ relationship.color }18` }; color: ${ relationship.color };` : '' }
								aria-label={ relationship.name }
							>
								{#if isImage}
									<img
										src={ relationship.avatar }
										alt={ relationship.name }
										draggable="false"
										class="w-full h-full rounded-full object-cover transition-all duration-300 { isActive ? '' : 'opacity-85 group-hover:opacity-100' }"
									/>
								{:else}
									<IconComp
										size={ isActive ? 22 : 20 }
										class="transition-all duration-300"
										style={ isActive ? `filter: drop-shadow(0 0 8px ${ relationship.color }88);` : '' }
									/>
								{/if}
							</a>
						{/snippet}
					</Tooltip.Trigger>

					<Tooltip.Portal>
						<Tooltip.Content
							side="right"
							sideOffset={ 14 }
							class="z-50 rounded-xl px-3 py-1.5 text-xs font-semibold text-white bg-stone-900/95 dark:bg-[#1a1228]/95 shadow-xl border border-white/10 backdrop-blur-md select-none"
						>
							<p>{ relationship.name }</p>
							<span class="text-[10px] text-stone-400 font-normal">Click derecho para opciones</span>
							<Tooltip.Arrow class="fill-stone-900/95 dark:fill-[#1a1228]/95" />
						</Tooltip.Content>
					</Tooltip.Portal>
				</Tooltip.Root>
			{/snippet}
		</ContextMenu.Trigger>

		<ContextMenu.Portal>
			<ContextMenu.Content
				class="z-50 min-w-56 rounded-2xl bg-white/95 dark:bg-[#1a1228]/95 border border-stone-200/80 dark:border-white/10 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 select-none text-xs"
			>
				<!-- Encabezado del Menú Contextual -->
				<div class="px-3 py-2 flex items-center gap-2.5 border-b border-stone-100 dark:border-white/5 mb-1">
					<div
						class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-[10px]"
						style="background-color: { relationship.color };"
					>
						{ relationship.name.charAt( 0 ).toUpperCase() }
					</div>
					<div class="min-w-0">
						<p class="font-extrabold text-stone-900 dark:text-white truncate">
							{ relationship.name }
						</p>
						<p class="text-[10px] text-stone-400">Menú de relación</p>
					</div>
				</div>

				<ContextMenu.Item
					onclick={ handleOpen }
					class="flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/10 hover:text-brand-accent transition-colors cursor-pointer outline-hidden"
				>
					<ExternalLink size={ 14 } />
					<span>Abrir Espacio</span>
				</ContextMenu.Item>

				<ContextMenu.Item
					onclick={ () => handleManage( 'relacion' ) }
					class="flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/10 hover:text-brand-accent transition-colors cursor-pointer outline-hidden"
				>
					<Settings2 size={ 14 } />
					<span>Gestionar Relación (Dialog)</span>
				</ContextMenu.Item>

				<ContextMenu.Item
					onclick={ () => handleManage( 'roles' ) }
					class="flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/10 hover:text-brand-accent transition-colors cursor-pointer outline-hidden"
				>
					<ShieldCheck size={ 14 } />
					<span>Ver Roles y Permisos</span>
				</ContextMenu.Item>

				<ContextMenu.Item
					onclick={ () => handleManage( 'invitar' ) }
					class="flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/10 hover:text-brand-accent transition-colors cursor-pointer outline-hidden"
				>
					<UserPlus size={ 14 } />
					<span>Invitar Miembros (5 min)</span>
				</ContextMenu.Item>

				<ContextMenu.Item
					onclick={ () => handleManage( 'historial' ) }
					class="flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/10 hover:text-brand-accent transition-colors cursor-pointer outline-hidden"
				>
					<History size={ 14 } />
					<span>Historial de Invitaciones</span>
				</ContextMenu.Item>

				<ContextMenu.Separator class="my-1 h-px bg-stone-200/50 dark:bg-white/10" />

				<!-- Submenú de Edición Rápida con Bits UI ContextMenu.Sub -->
				<ContextMenu.Sub>
					<ContextMenu.SubTrigger
						class="flex items-center justify-between w-full px-3 py-2 rounded-xl font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors cursor-pointer outline-hidden"
					>
						<div class="flex items-center gap-2.5">
							<Palette size={ 14 } />
							<span>Edición Rápida</span>
						</div>
						<ChevronRight size={ 14 } class="text-stone-400" />
					</ContextMenu.SubTrigger>

					<ContextMenu.SubContent
						class="z-50 min-w-52 rounded-2xl bg-white/95 dark:bg-[#1a1228]/95 border border-stone-200/80 dark:border-white/10 p-2.5 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 select-none"
					>
						<div class="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-stone-400">
							Color de Resaltado
						</div>
						<div class="grid grid-cols-5 gap-1.5 p-1 mb-2">
							{#each DEFAULT_RELATIONSHIP_COLORS.slice( 0, 10 ) as colorOption}
								<button
									type="button"
									onclick={ () => handleQuickColor( colorOption ) }
									class="size-6 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer { relationship.color === colorOption ? 'border-white ring-2 ring-brand-accent scale-105' : 'border-transparent' }"
									style="background-color: { colorOption };"
									aria-label={`Color ${ colorOption }`}
								></button>
							{/each}
						</div>

						<ContextMenu.Separator class="my-1.5 h-px bg-stone-200/50 dark:bg-white/10" />

						<ContextMenu.Item
							onclick={ () => handleManage( 'relacion' ) }
							class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors cursor-pointer outline-hidden"
						>
							<Edit3 size={ 13 } />
							<span>Cambiar Nombre</span>
						</ContextMenu.Item>

						<ContextMenu.Item
							onclick={ () => handleManage( 'relacion' ) }
							class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors cursor-pointer outline-hidden"
						>
							<ImageIcon size={ 13 } />
							<span>Cambiar Avatar</span>
						</ContextMenu.Item>
					</ContextMenu.SubContent>
				</ContextMenu.Sub>

				{#if isOwnerOrSuperAdmin}
					<ContextMenu.Separator class="my-1 h-px bg-stone-200/50 dark:bg-white/10" />

					<ContextMenu.Item
						onclick={ handleDeletePrompt }
						class="flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 transition-colors cursor-pointer outline-hidden"
					>
						<Trash2 size={ 14 } />
						<span>Eliminar Relación</span>
					</ContextMenu.Item>
				{/if}
			</ContextMenu.Content>
		</ContextMenu.Portal>
	</ContextMenu.Root>

	<!-- Indicador de soltado inferior (Drop Indicator Bottom) -->
	{#if closestEdge === 'bottom'}
		<div
			class="absolute -bottom-1.5 left-2 right-2 h-1 rounded-full z-30 transition-all pointer-events-none animate-pulse"
			style="background-color: { relationship.color }; box-shadow: 0 0 12px { relationship.color };"
		></div>
	{/if}
</div>
