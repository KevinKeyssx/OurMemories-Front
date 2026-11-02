<script lang="ts">
	import type { Component } from 'svelte';
	import { page } from '$app/state';

	import {
		Sparkles,
		Award,
		Heart,
		Home,
		Users,
		Users2,
		Baby,
		Palmtree,
		Grid,
		Smile,
		Camera,
		Quote,
		Video,
		FileText,
		Plus,
		Settings2,
		FolderHeart
	} from '@lucide/svelte';

	import type { Relationship, MomentEntity, MemoryEntity } from '$lib/types';
	import MemoryCarousel                                    from '$lib/components/memories/MemoryCarousel.svelte';
	import MomentList                                        from '$lib/components/moments/MomentList.svelte';
	import SecurityUnlockModal                               from '$lib/components/shared/SecurityUnlockModal.svelte';
	import UploadModal                                       from '$lib/components/UploadModal.svelte';
	import { memoriesStore }                                 from '$lib/store.svelte';
	import { useRelationshipsQuery }                         from '$lib/services/relationshipService';

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

	const relationshipsQuery = useRelationshipsQuery();

	const relationshipsList   = $derived<Relationship[]>( relationshipsQuery.data || memoriesStore.groups );
	const pathName            = $derived<string>( page.params.relation || '' );
	const currentRelationship = $derived<Relationship | undefined>( relationshipsList.find( ( r: Relationship ) => r.path_name === pathName ) || relationshipsList[ 0 ] );
	const RelationshipIcon    = $derived<Component>(
		( currentRelationship?.avatar ? ICON_MAP[ currentRelationship.avatar ] : null ) || ( Heart as Component )
	);

	const relationshipMemories = $derived.by<MemoryEntity[]>( () => {
		if ( !currentRelationship ) {
			return [];
		}

		return memoriesStore.memories.filter( ( item: MemoryEntity ) => {
			return item.relationship_id === currentRelationship.id;
		} );
	} );

	const relationshipMoments = $derived.by<MomentEntity[]>( () => {
		if ( !currentRelationship ) {
			return [];
		}

		return memoriesStore.moments.filter( ( item: MomentEntity ) => {
			return item.relationship_id === currentRelationship.id;
		} );
	} );

	// Puntos, niveles y progreso para la relación actual
	const points               = $derived<number>( currentRelationship?.points || 0 );
	const level                = $derived<number>( Math.floor( points / 100 ) + 1 );
	const currentLevelProgress = $derived<number>( points % 100 );
	const pointsRemaining      = $derived<number>( 100 - currentLevelProgress );

	// Modales de desbloqueo y creación rápida
	let isCreateMemoryOpen = $state<boolean>( false );
	let unlockTarget = $state<{ type: 'memory' | 'moment'; item: MemoryEntity | MomentEntity } | null>( null );
	let isUnlockOpen = $state<boolean>( false );

	function handleUnlockMemory( memory: MemoryEntity ): void {
		unlockTarget = { type: 'memory', item: memory };
		isUnlockOpen = true;
	}

	function handleUnlockMoment( moment: MomentEntity ): void {
		unlockTarget = { type: 'moment', item: moment };
		isUnlockOpen = true;
	}

	function handleUnlockSuccess(): void {
		if ( unlockTarget ) {
			if ( unlockTarget.type === 'memory' ) {
				window.location.href = `/dashboard/${ pathName }/memory/${ unlockTarget.item.id }`;
			} else {
				const moment = unlockTarget.item as MomentEntity;
				if ( moment.metadata ) {
					moment.metadata.password = undefined;
					moment.metadata.is_blocked = false;
				}
			}
		}
		isUnlockOpen = false;
		unlockTarget = null;
	}

	function handleDeleteMoment( id: string ): void {
		memoriesStore.deleteMoment( id );
	}

	function handleRecordView( momentId: string ): void {
		memoriesStore.recordMomentView( momentId, memoriesStore.currentUser.id );
	}
</script>

<svelte:head>
	<title>{ currentRelationship?.name || 'Relación' } - OurMemories</title>
</svelte:head>

<div class="space-y-10">
	<!-- Sección de Nivel y Progreso de la Relación (Viva, Elegante con Animaciones) -->
	<div class="relative overflow-hidden rounded-3xl bg-white/70 dark:bg-dark-card/70 border border-stone-200/60 dark:border-white/5 p-6 sm:p-8 backdrop-blur-xl shadow-xl transition-all duration-500 hover:shadow-2xl">
		<!-- Resplandor dinámico de fondo con el color de la relación -->
		<div
			class="absolute -right-20 -top-20 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none transition-all duration-700"
			style="background-color: { currentRelationship?.color || '#f43f5e' };"
		></div>

		<div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
			<!-- Información de la Relación -->
			<div class="flex items-start sm:items-center gap-4">
				<div
					class="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 transition-transform duration-500 hover:scale-105 overflow-hidden"
					style="background: { currentRelationship?.color || '#f43f5e' }; box-shadow: 0 10px 25px -5px { currentRelationship?.color || '#f43f5e' }66;"
				>
					{#if isImageAvatar( currentRelationship?.avatar )}
						<img
							src={ currentRelationship?.avatar }
							alt={ currentRelationship?.name || 'Avatar de la relación' }
							class="w-full h-full object-cover rounded-2xl"
						/>
					{:else}
						<RelationshipIcon size={ 28 } />
					{/if}
				</div>

				<div>
					<div class="flex items-center gap-2 mb-1">
						<span
							class="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full text-white shadow-sm"
							style="background: { currentRelationship?.color || '#f43f5e' };"
						>
							Nivel { level }
						</span>
						<span class="text-xs font-semibold text-stone-400">
							{ points } Puntos Totales
						</span>
					</div>

					<h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
						Espacio de { currentRelationship?.name || 'Cargando...' }
					</h2>
					<p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
						Explora las memorias temáticas, dedicatorias y momentos especiales
					</p>
				</div>
			</div>

			<!-- Contador de Memorias y Momentos -->
			<div class="flex items-center gap-3">
				<div class="flex items-center gap-2.5 bg-stone-100/70 dark:bg-white/3 border border-stone-200/60 dark:border-white/5 px-3.5 py-2.5 rounded-2xl shrink-0">
					<FolderHeart size={ 17 } class="text-purple-500" />
					<div class="text-xs">
						<span class="text-stone-400">Memorias: </span>
						<span class="font-extrabold text-brand-ink dark:text-white">{ relationshipMemories.length }</span>
					</div>
				</div>

				<div class="flex items-center gap-2.5 bg-stone-100/70 dark:bg-white/3 border border-stone-200/60 dark:border-white/5 px-3.5 py-2.5 rounded-2xl shrink-0">
					<Award size={ 17 } class="text-brand-secondary" />
					<div class="text-xs">
						<span class="text-stone-400">Momentos: </span>
						<span class="font-extrabold text-brand-ink dark:text-white">{ relationshipMoments.length }</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Barra de Progreso Viva con Resplandor y Animación Tailwind -->
		<div class="relative z-10 mt-6 pt-6 border-t border-stone-200/40 dark:border-white/5 space-y-2">
			<div class="flex items-center justify-between text-xs font-bold">
				<span class="text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
					<Sparkles size={ 14 } style="color: { currentRelationship?.color || '#f43f5e' };" />
					Progreso al Nivel { level + 1 }
				</span>
				<span class="text-stone-400 text-[11px] font-semibold">
					Faltan <span class="font-bold text-stone-700 dark:text-stone-200">{ pointsRemaining } pts</span> ({ currentLevelProgress } / 100)
				</span>
			</div>

			<!-- Contenedor de la Barra -->
			<div class="w-full h-3.5 rounded-full bg-stone-100 dark:bg-white/10 p-0.5 overflow-hidden shadow-inner">
				<div
					class="h-full rounded-full transition-all duration-1000 ease-out relative"
					style="width: { currentLevelProgress }%; background: linear-gradient(90deg, { currentRelationship?.color || '#f43f5e' }bb, { currentRelationship?.color || '#f43f5e' }); box-shadow: 0 0 15px { currentRelationship?.color || '#f43f5e' }88;"
				>
					<!-- Efecto de brillo animado en la punta de la barra -->
					<div class="absolute right-0 top-0 bottom-0 w-2 bg-white/60 rounded-full blur-[1px]"></div>
				</div>
			</div>
		</div>
	</div>

	<!-- Sección 1: Carrusel / Grid de Memorias -->
	<MemoryCarousel
		memories={relationshipMemories}
		relationPath={pathName}
		moments={relationshipMoments}
		onOpenCreate={() => ( isCreateMemoryOpen = true )}
		onUnlockMemory={handleUnlockMemory}
	/>

	<!-- Separador Elegante -->
	<div class="h-px bg-stone-200/60 dark:bg-white/5 my-2"></div>

	<!-- Sección 2: Galería de Momentos (Filtros por Tags y Buscador) -->
	<div class="space-y-4">
		<div class="flex items-center gap-2">
			<div class="w-8 h-8 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center">
				<Sparkles size={ 18 } />
			</div>
			<div>
				<h3 class="text-base font-extrabold tracking-tight">Momentos de la Relación</h3>
				<p class="text-[11px] text-stone-400 font-medium">Fotos, videos, notas y dedicatorias compartidas</p>
			</div>
		</div>

		<MomentList
			moments={relationshipMoments}
			currentUserId={memoriesStore.currentUser.id}
			relationName={currentRelationship?.name || 'esta relación'}
			onDelete={handleDeleteMoment}
			onUnlock={handleUnlockMoment}
			onRecordView={handleRecordView}
		/>
	</div>
</div>

<!-- Modal para Desbloquear Contraseñas de Memorias o Momentos -->
<SecurityUnlockModal
	isOpen={isUnlockOpen}
	title={unlockTarget?.type === 'memory' ? 'Memoria Protegida' : 'Momento Protegido'}
	description="Ingresa la contraseña para desbloquear y revelar el contenido."
	correctPassword={unlockTarget?.type === 'memory' ? ( unlockTarget.item as MemoryEntity ).password : ( ( unlockTarget?.item as MomentEntity )?.metadata?.password || '' )}
	onSuccess={handleUnlockSuccess}
	onClose={() => {
		isUnlockOpen = false;
		unlockTarget = null;
	}}
/>

<!-- Modal para Crear Memoria Directamente -->
<UploadModal
	isOpen={isCreateMemoryOpen}
	relationshipId={currentRelationship?.id}
	initialTab="memory"
	onClose={() => ( isCreateMemoryOpen = false )}
/>
