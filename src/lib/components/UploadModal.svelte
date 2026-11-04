<script lang="ts">
	import { fade, scale } from 'svelte/transition';

    import { X, Sparkles, FolderPlus } from '@lucide/svelte';

    import type {
        MemoryEntity,
        MomentEntity,
        Relationship
    }                                   from '$lib/types';
	import { memoriesStore }            from '$lib/store.svelte';
	import Tabs, { type TabItem }       from '$lib/components/shared/Tabs.svelte';
	import Select, { type SelectItem }  from '$lib/components/shared/inputs/Select.svelte';
	import CreateMomentForm             from './moments/CreateMomentForm.svelte';
	import CreateMemoryForm             from './memories/CreateMemoryForm.svelte';

	interface Props {
		isOpen           : boolean;
		relationshipId  ?: string;
		initialTab      ?: 'moment' | 'memory';
		initialMemoryId ?: string;
		editingMoment   ?: MomentEntity | null;
		onClose          : () => void;
		onCreateMemory  ?: ( data: Partial<MemoryEntity> ) => void;
		onCreateMoment  ?: ( data: Partial<MomentEntity> ) => void;
		onUpdateMoment  ?: ( id: string, data: Partial<MomentEntity> ) => void;
		onAdd           ?: ( data: Partial<MomentEntity> ) => void;
	}

	let {
		isOpen,
		relationshipId,
		initialTab = 'moment',
		initialMemoryId = '',
		editingMoment = null,
		onClose,
		onCreateMemory,
		onCreateMoment,
		onUpdateMoment,
		onAdd
	}: Props = $props();

	let activeTab = $state<string>( 'moment' );
	let selectedRelId = $state<string>( '' );

	$effect( () => {
		if ( editingMoment ) {
			activeTab = 'moment';
		} else {
			activeTab = initialTab;
		}
	} );

	$effect( () => {
		selectedRelId = editingMoment?.relationship_id || relationshipId || memoriesStore.groups[ 0 ]?.id || 'rel_1';
	} );

	const isEditMode = $derived<boolean>( Boolean( editingMoment ) );
	const isGlobalMode = $derived<boolean>( !relationshipId && !editingMoment );

	const targetRelId = $derived<string>(
		editingMoment?.relationship_id || relationshipId || selectedRelId || memoriesStore.groups[ 0 ]?.id || 'rel_1'
	);

	const relationshipSelectItems = $derived<SelectItem[]>(
		memoriesStore.groups.map( ( g: Relationship ) => ({
			value       : g.id,
			label       : g.name,
			description : `Nivel ${ Math.floor( ( g.points || 0 ) / 100 ) + 1 }`
		}) )
	);

	const relationMemories = $derived<MemoryEntity[]>(
		memoriesStore.memories.filter( ( m: MemoryEntity ) => m.relationship_id === targetRelId )
	);

	const targetRelationship = $derived<Relationship | undefined>(
		memoriesStore.groups.find( ( g: Relationship ) => g.id === targetRelId )
	);

	const modalColor = $derived<string | undefined>( targetRelationship?.color );

	const modalTabs: TabItem[] = [
		{
			id    : 'moment',
			label : 'Un Momento',
			icon  : Sparkles
		},
		{
			id    : 'memory',
			label : 'Una Memoria',
			icon  : FolderPlus
		}
	];

	function handleMomentSubmit( data: Partial<MomentEntity> ): void {
		if ( isEditMode && editingMoment ) {
			if ( onUpdateMoment ) {
				onUpdateMoment( editingMoment.id, data );
			} else {
				memoriesStore.updateMoment( editingMoment.id, data );
			}
		} else if ( onCreateMoment ) {
			onCreateMoment( data );
		} else if ( onAdd ) {
			onAdd( data );
		} else {
			memoriesStore.addMoment( data );
		}
		onClose();
	}

	function handleMemorySubmit( data: Partial<MemoryEntity> ): void {
		if ( onCreateMemory ) {
			onCreateMemory( data );
		} else {
			memoriesStore.addMemory( data );
		}
		onClose();
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<!-- Backdrop -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			transition:fade={ { duration: 200 } }
			class="fixed inset-0 bg-stone-950/75 backdrop-blur-md"
			onclick={onClose}
		></div>

		<!-- Modal Container -->
		<div
			transition:scale={ { start: 0.95, duration: 250 } }
			class="relative w-full max-w-lg rounded-3xl bg-white dark:bg-dark-card border border-stone-200/70 dark:border-white/10 p-6 sm:p-7 shadow-2xl z-10 space-y-5 max-h-[92vh] overflow-y-auto no-scrollbar"
		>
			<!-- Cabecera del Modal -->
			<div class="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-white/5">
				<div>
					<h3 class="text-lg font-extrabold tracking-tight">
						{ isEditMode ? 'Editar Momento' : 'Crear Nuevo Registro' }
					</h3>
					<p class="text-xs text-stone-400">
						{ isEditMode ? 'Actualiza los datos y contenido del momento' : 'Elige qué deseas agregar a esta relación' }
					</p>
				</div>

				<button
					type="button"
					onclick={onClose}
					class="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
					aria-label="Cerrar modal"
				>
					<X size={ 20 } />
				</button>
			</div>

			{#if !isEditMode}
				<!-- Pestañas Selectoras con Componente Reutilizable y Animación Deslizante -->
				<Tabs
					tabs={modalTabs}
					bind:activeId={activeTab}
					color={modalColor}
				/>
			{/if}

			{#if isGlobalMode}
				<div class="pt-1">
					<Select
						items={relationshipSelectItems}
						bind:value={selectedRelId}
						label="Relación de Destino"
						placeholder="Selecciona a qué relación pertenece..."
						id="upload-modal-rel"
					/>
				</div>
			{/if}

			<!-- Contenido con Transición Suave entre Formularios -->
			<div class="transition-all duration-200">
				{#if activeTab === 'moment'}
					<CreateMomentForm
						relationshipId={targetRelId}
						memories={relationMemories}
						{initialMemoryId}
						{editingMoment}
						color={modalColor}
						onSubmit={handleMomentSubmit}
						onCancel={onClose}
					/>
				{:else}
					<CreateMemoryForm
						relationshipId={targetRelId}
						color={modalColor}
						onSubmit={handleMemorySubmit}
						onCancel={onClose}
					/>
				{/if}
			</div>
		</div>
	</div>
{/if}
