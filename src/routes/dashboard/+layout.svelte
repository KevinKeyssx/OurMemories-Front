<script lang="ts">
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import { memoriesStore } from '$lib/store.svelte';
	import type { Relationship, MomentEntity, MemoryEntity } from '$lib/types';
	import GroupEditor from '$lib/components/GroupEditor.svelte';
	import UploadModal from '$lib/components/UploadModal.svelte';
	import RelationshipsSidebar from '$lib/components/relationship/RelationshipsSidebar.svelte';
	import DashboardHeader from '$lib/components/DashboardHeader.svelte';
	import {
		useRelationshipsQuery,
		useRelationshipTypesQuery,
		useCreateRelationshipMutation,
		useUpdateRelationshipsMutation,
		useDeleteRelationshipMutation
	} from '$lib/services/relationshipService';

	interface Props {
		children : Snippet;
	}

	let { children }: Props = $props();

	let isUploadOpen = $state<boolean>( false );
	let isGroupEditorOpen = $state<boolean>( false );
	let isMobileSidebarOpen = $state<boolean>( false );
	let scrollY = $state<number>( 0 );

	const isScrolled = $derived<boolean>( scrollY > 30 );

	const relationshipsQuery = useRelationshipsQuery();
	const relationshipTypesQuery = useRelationshipTypesQuery();
	const createMutation = useCreateRelationshipMutation();
	const updateMutation = useUpdateRelationshipsMutation();
	const deleteMutation = useDeleteRelationshipMutation();

	const relationshipsList = $derived<Relationship[]>(
		relationshipsQuery.data || memoriesStore.groups
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

<div class="min-h-screen transition-all duration-500 font-sans">
	<!-- Banner Lateral Izquierdo de Relaciones (Desktop + Drawer Móvil) -->
	<RelationshipsSidebar
		relationships={relationshipsList}
		activeRelationshipId={currentRelationship?.id || ''}
		isLoading={relationshipsQuery.isPending}
		isMobileOpen={isMobileSidebarOpen}
		onCloseMobile={() => ( isMobileSidebarOpen = false )}
		onOpenGroupEditor={() => ( isGroupEditorOpen = true )}
	/>

	<!-- Área Principal de Contenido -->
	<div class="lg:pl-24 flex flex-col min-h-screen">
		<!-- Header Superior Limpio con Barra de Progreso de Puntos -->
		<DashboardHeader
			{currentRelationship}
			{isScrolled}
			onOpenMobileSidebar={() => ( isMobileSidebarOpen = true )}
			onOpenUploadModal={() => ( isUploadOpen = true )}
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
	isOpen={isUploadOpen}
	relationshipId={currentRelationship?.id}
	onClose={() => ( isUploadOpen = false )}
	onCreateMoment={handleAddMoment}
	onCreateMemory={handleAddMemory}
/>

{#if isGroupEditorOpen}
	<GroupEditor
		isOpen={isGroupEditorOpen}
		relationships={relationshipsList}
		relationshipTypes={relationshipTypesQuery.data || []}
		onClose={() => ( isGroupEditorOpen = false )}
		onCreate={handleCreateRelationship}
		onUpdate={handleUpdateRelationships}
		onDelete={handleDeleteRelationship}
	/>
{/if}
