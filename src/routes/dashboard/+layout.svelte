<script lang="ts">
	import { page }         from '$app/state';
	import type { Snippet } from 'svelte';

	import type {
        Relationship,
        MomentEntity,
        MemoryEntity
    }                           from '$lib/types';
    import {
		useRelationshipsQuery,
		useRelationshipTypesQuery,
		useCreateRelationshipMutation,
		useUpdateRelationshipsMutation,
		useDeleteRelationshipMutation
	}                           from '$lib/services/relationshipService';
    import { memoriesStore }    from '$lib/store.svelte';
	import GroupEditor          from '$lib/components/GroupEditor.svelte';
	import UploadModal          from '$lib/components/UploadModal.svelte';
	import RelationshipsSidebar from '$lib/components/relationship/RelationshipsSidebar.svelte';
	import DashboardHeader      from '$lib/components/DashboardHeader.svelte';


	interface Props {
		children : Snippet;
	}

	let { children }: Props = $props();

	let isUploadOpen        = $state<boolean>( false );
	let isGroupEditorOpen   = $state<boolean>( false );
	let isMobileSidebarOpen = $state<boolean>( false );
	let scrollY             = $state<number>( 0 );

	const isScrolled = $derived<boolean>( scrollY > 30 );

	const relationshipsQuery        = useRelationshipsQuery();
	const relationshipTypesQuery    = useRelationshipTypesQuery();
	const createMutation            = useCreateRelationshipMutation();
	const updateMutation            = useUpdateRelationshipsMutation();
	const deleteMutation            = useDeleteRelationshipMutation();


    $effect( () => {
		if ( relationshipsQuery.data && relationshipsQuery.data.length > 0 && memoriesStore.groups.length === 0 ) {
			memoriesStore.setGroups( relationshipsQuery.data );
		}
	});

	const relationshipsList = $derived<Relationship[]>(
		memoriesStore.groups.length > 0 ? memoriesStore.groups : ( relationshipsQuery.data || [] )
	);

	const currentPathName = $derived<string>(
		page.params.relation || ''
	);

	const currentRelationship = $derived<Relationship | undefined>(
		currentPathName ? ( relationshipsList.find( ( r: Relationship ) => r.path_name === currentPathName ) || relationshipsList[ 0 ] ) : undefined
	);

	function handleAddMoment( partialMoment: Partial<MomentEntity> ): void {
		memoriesStore.addMoment( {
			relationship_id : currentRelationship?.id || relationshipsList[ 0 ]?.id || 'rel_1',
			...partialMoment
		} );
	}

	function handleAddMemory( partialMemory: Partial<MemoryEntity> ): void {
		memoriesStore.addMemory( {
			relationship_id : currentRelationship?.id || relationshipsList[ 0 ]?.id || 'rel_1',
			...partialMemory
		} );
	}

	function handleCreateRelationship( newRel: Partial<Relationship> ): void {
		createMutation.mutate( newRel );
	}

	function handleUpdateRelationships( updated: Relationship[] ): void {
		memoriesStore.setGroups( updated );
		updateMutation.mutate( updated );
	}

	function handleDeleteRelationship( id: string ): void {
		deleteMutation.mutate( id );
	}
</script>

<svelte:window bind:scrollY />

<div class="min-h-screen font-sans relative selection:bg-purple-500/25 selection:text-purple-400">
	<!-- Luces y Orbes Ambientales con Vida (Aurora Mesh Gradients) -->
	<div class="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
		<!-- Luz 1: Aurora Superior Central (Púrpura y Fucsia imperial) -->
		<div class="absolute -top-24 left-1/2 -translate-x-1/2 w-325 h-150 bg-linear-to-b from-purple-600/22 via-fuchsia-500/14 to-transparent dark:from-purple-600/35 dark:via-fuchsia-500/20 dark:to-transparent blur-3xl transition-all duration-700"></div>

		<!-- Luz 2: Orbe Lateral Izquierdo (Violeta profundo / amatista) -->
		<div class="absolute top-1/4 -left-36 w-125 h-125 bg-purple-600/16 dark:bg-purple-600/28 rounded-full blur-3xl transition-all duration-700"></div>

		<!-- Luz 3: Orbe Lateral Derecho (Dorado ámbar cálido que da vida en light y dark mode) -->
		<div class="absolute top-1/3 -right-36 w-135 h-135 bg-amber-400/20 dark:bg-amber-500/20 rounded-full blur-3xl transition-all duration-700"></div>

		<!-- Luz 4: Orbe Inferior (Violeta suave / fucsia) -->
		<div class="absolute bottom-1/4 left-1/3 w-120 h-120 bg-violet-500/16 dark:bg-violet-600/24 rounded-full blur-3xl transition-all duration-700"></div>

		<!-- Luz 5: Resplandor Dinámico según la Relación Activa -->
		{#if currentRelationship?.color}
			<div
				class="absolute top-28 right-1/4 w-100 h-100 rounded-full blur-3xl opacity-25 dark:opacity-35 transition-all duration-1000"
				style="background: radial-gradient(circle, { currentRelationship.color } 0%, transparent 70%);"
			></div>
		{/if}
	</div>

	<!-- Banner Lateral Izquierdo de Relaciones (Desktop + Drawer Móvil) -->
	<RelationshipsSidebar
		relationships           = { relationshipsList }
		activeRelationshipId    = { currentRelationship?.id || '' }
		isLoading               = { relationshipsQuery.isPending }
		isMobileOpen            = { isMobileSidebarOpen }
		onCloseMobile           = { () => ( isMobileSidebarOpen = false ) }
		onOpenGroupEditor       = { () => ( isGroupEditorOpen = true ) }
	/>

	<!-- Área Principal de Contenido -->
	<div class="lg:pl-24 flex flex-col min-h-screen relative z-10">
		<!-- Header Superior Limpio con Barra de Progreso de Puntos -->
		<DashboardHeader
			{currentRelationship}
			{isScrolled}
			onOpenMobileSidebar = { () => ( isMobileSidebarOpen = true ) }
			onOpenUploadModal   = { () => ( isUploadOpen = true ) }
		/>

		<!-- Espaciador para evitar solapamiento del header fijo -->
		<div class="h-45 sm:h-40"></div>

		<!-- Contenido de la Página Dinámica -->
		<main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pb-24 w-full">
			{@render children()}
		</main>
	</div>
</div>

<UploadModal
	isOpen          = { isUploadOpen }
	relationshipId  = { currentRelationship?.id }
	onClose         = { () => ( isUploadOpen = false )}
	onCreateMoment  = { handleAddMoment }
	onCreateMemory  = { handleAddMemory }
/>

{#if isGroupEditorOpen}
	<GroupEditor
		isOpen              = { isGroupEditorOpen }
		relationships       = { relationshipsList }
		relationshipTypes   = { relationshipTypesQuery.data || [] }
		onClose             = { () => ( isGroupEditorOpen = false ) }
		onCreate            = { handleCreateRelationship }
		onUpdate            = { handleUpdateRelationships }
		onDelete            = { handleDeleteRelationship }
	/>
{/if}
