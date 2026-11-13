<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	import {
		ArrowLeft,
		Images,
		Clock,
		Plus,
		Calendar,
		Sparkles,
		FolderHeart,
		Edit3,
		Trash2
	} from '@lucide/svelte';

	import type {
		MemoryEntity,
		MomentEntity,
		Relationship
	} from '$lib/types';
	import { memoriesStore }   from '$lib/store.svelte';
	import MomentList          from '$lib/components/moments/MomentList.svelte';
	import UploadModal         from '$lib/components/UploadModal.svelte';
	import SecurityUnlockModal from '$lib/components/shared/SecurityUnlockModal.svelte';
	import ConfirmDialog       from '$lib/components/shared/ConfirmDialog.svelte';
	import EditMemoryModal     from '$lib/components/memories/EditMemoryModal.svelte';
	import Tooltip             from '$lib/components/shared/Tooltip.svelte';

	const relationParam = $derived<string>( page.params.relation || 'pareja' );
	const memoryIdParam = $derived<string>( page.params.memoryId || '' );

	const currentRelationship = $derived<Relationship | undefined>(
		memoriesStore.groups.find( ( r: Relationship ) => r.path_name === relationParam ) || memoriesStore.groups[ 0 ]
	);

	const memory = $derived<MemoryEntity | undefined>(
		memoriesStore.memories.find( ( m: MemoryEntity ) => m.id === memoryIdParam )
	);

	const memoryMoments = $derived<MomentEntity[]>(
		memoriesStore.moments.filter( ( item: MomentEntity ) => item.memory_id === memoryIdParam )
	);

	const canManage = $derived<boolean>(
		memoriesStore.currentUser.role === 'super_admin' ||
		memoriesStore.currentUser.role === 'admin' ||
		Boolean( memory?.created_by && memory.created_by === memoriesStore.currentUser.id )
	);

	let isUploadOpen              = $state<boolean>( false );
	let unlockMomentTarget        = $state<MomentEntity | null>( null );
	let isUnlockMomentOpen        = $state<boolean>( false );
	let isEditMemoryOpen          = $state<boolean>( false );
	let isConfirmDeleteMemoryOpen = $state<boolean>( false );

	const isMemoryUnlocked = $derived<boolean>(
		!memory?.password || ( memory ? memoriesStore.isMemoryUnlocked( memory.id ) : true )
	);

	const isUnlockOpen = $derived<boolean>(
		Boolean( memory?.password && !isMemoryUnlocked )
	);

	const memoryRemainingSeconds = $derived<number | undefined>(
		memory ? memoriesStore.getMemoryRemainingSeconds( memory.id ) : undefined
	);

	function handleMemoryUnlockSuccess(): void {
		if ( memory ) {
			memoriesStore.unlockMemory( memory.id, memory.timer );
		}
	}

	function handleUnlockMoment( moment: MomentEntity ): void {
		unlockMomentTarget = moment;
		isUnlockMomentOpen = true;
	}

	function handleUnlockMomentSuccess(): void {
		if ( unlockMomentTarget ) {
			memoriesStore.unlockMoment( unlockMomentTarget.id );
		}

		isUnlockMomentOpen = false;
		unlockMomentTarget = null;
	}

	function handleDeleteMoment( id: string ): void {
		memoriesStore.deleteMoment( id );
	}

	function handleRecordView( momentId: string ): void {
		memoriesStore.recordMomentView( momentId, memoriesStore.currentUser.id );
	}

	function handleConfirmDeleteMemory(): void {
		if ( memory ) {
			const memoryId = memory.id;

            memoriesStore.deleteMemory( memoryId );

            goto( `/dashboard/${ relationParam }` );
		}
		isConfirmDeleteMemoryOpen = false;
	}
</script>

<svelte:head>
	<title>{ memory?.title || 'Memoria' } - OurMemories</title>
</svelte:head>

<div class="space-y-8 transition-all duration-300 { !isMemoryUnlocked ? 'filter blur-md pointer-events-none select-none' : '' }">
	<!-- Botón Regresar -->
	<div>
		<a
			href={`/dashboard/${ relationParam }`}
			class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/70 dark:bg-white/5 border border-stone-200/60 dark:border-white/10 text-stone-600 dark:text-stone-300 hover:text-brand-accent text-xs font-bold transition-all shadow-sm active:scale-95 hover:border-brand-accent/50"
		>
			<ArrowLeft size={ 16 } />
			<span>Volver a { currentRelationship?.name || 'la relación' }</span>
		</a>
	</div>

	{#if !memory}
		<div class="py-20 text-center space-y-3 bg-white/30 dark:bg-white/1 rounded-3xl border border-dashed border-stone-200 dark:border-white/5">
			<FolderHeart size={ 36 } class="mx-auto text-stone-400" />
			<h3 class="text-base font-bold">No se encontró esta memoria</h3>
			<p class="text-xs text-stone-400">Es posible que haya sido eliminada o desvinculada.</p>
		</div>
	{:else}
		<!-- Cabecera Inmersiva de la Memoria -->
		<div class="relative overflow-hidden rounded-3xl min-h-65 flex flex-col justify-between p-6 sm:p-10 border border-stone-200/60 dark:border-white/10 shadow-2xl">
			{#if memory.cover_url}
				<img
					src={ memory.cover_url }
					alt={ memory.title }
					class="absolute inset-0 w-full h-full object-cover brightness-100 dark:brightness-60 transition-all duration-700"
				/>
				<!-- Gradiente optimizado: suave en light mode para conservar los colores y luz de la foto, y profundo en dark mode -->
				<div class="absolute inset-0 bg-linear-to-t from-black/45 via-black/15 to-transparent dark:from-black/85 dark:via-black/35 dark:to-black/20"></div>
			{:else}
				<div class="absolute inset-0 bg-linear-to-tr from-brand-accent/35 via-purple-600/35 to-pink-500/30 dark:from-brand-accent/40 dark:via-purple-600/40 dark:to-pink-500/40"></div>
				<!-- Suave viñeta en lugar de bloque negro profundo -->
				<div class="absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent dark:from-black/75 dark:via-black/30 dark:to-transparent"></div>
			{/if}

			<!-- Badges Superiores y Botones de Acción -->
			<div class="relative z-10 flex flex-wrap items-center justify-between gap-3">
				<div class="flex items-center gap-2">
					<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-black/30 dark:bg-black/50 backdrop-blur-md border border-white/20 shadow-xs">
						<Images size={ 14 } />
						<span>{ memoryMoments.length } momentos</span>
					</span>

					{#if memory.timer}
						<span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-amber-300 bg-black/30 dark:bg-amber-950/70 backdrop-blur-md border border-amber-400/30 { isMemoryUnlocked && memoryRemainingSeconds !== undefined ? 'animate-pulse' : '' }">
							<Clock size={ 14 } />
							{#if isMemoryUnlocked && memoryRemainingSeconds !== undefined}
								<span>{ memoryRemainingSeconds }s restantes</span>
							{:else}
								<span>{ memory.timer }s límite</span>
							{/if}
						</span>
					{/if}
				</div>

				<div class="flex items-center gap-2">
					{#if canManage}
						<Tooltip text="Editar esta memoria">
							<button
								type="button"
								onclick={ () => ( isEditMemoryOpen = true ) }
								class="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-black/30 dark:bg-black/50 hover:bg-black/45 dark:hover:bg-black/75 text-white text-xs font-bold backdrop-blur-md border border-white/20 hover:border-white/40 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
								aria-label="Editar memoria"
							>
								<Edit3 size={ 14 } />
								<span class="hidden sm:inline">Editar</span>
							</button>
						</Tooltip>

						<Tooltip text="Eliminar esta memoria y su contenido">
							<button
								type="button"
								onclick={ () => ( isConfirmDeleteMemoryOpen = true ) }
								class="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-black/30 dark:bg-black/50 hover:bg-rose-950/80 text-rose-300 hover:text-rose-200 text-xs font-bold backdrop-blur-md border border-white/20 hover:border-rose-500/40 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
								aria-label="Eliminar memoria"
							>
								<Trash2 size={ 14 } />
								<span class="hidden sm:inline">Eliminar</span>
							</button>
						</Tooltip>
					{/if}

					<button
						type="button"
						onclick={ () => ( isUploadOpen = true ) }
						class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/90 hover:bg-white text-stone-900 text-xs font-extrabold shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
					>
						<Plus size={ 16 } />
						<span>Añadir a esta Memoria</span>
					</button>
				</div>
			</div>

			<!-- Información de la Memoria -->
			<div class="relative z-10 space-y-2 text-white max-w-2xl pt-8">
				<div class="flex items-center gap-2 text-[11px] font-semibold text-white/90 drop-shadow-xs">
					<Calendar size={ 13 } />
					<span>Creado el { new Date( memory.created_at ).toLocaleDateString( 'es-ES', { month: 'long', day: 'numeric', year: 'numeric' } ) }</span>
				</div>

				<h1
					class="text-3xl sm:text-5xl font-black tracking-tight leading-tight drop-shadow-md"
					style="color: { currentRelationship?.color || '#f43f5e' };"
				>
					{ memory.title }
				</h1>

				{#if memory.description}
					<p class="text-sm text-white/90 leading-relaxed font-normal drop-shadow-sm">
						{ memory.description }
					</p>
				{/if}
			</div>
		</div>

		<!-- Galería de Momentos de la Memoria -->
		<div class="space-y-4 pt-4">
			<div class="flex items-center gap-2">
				<div
					class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
					style="background-color: { currentRelationship?.color || '#f43f5e' }18; color: { currentRelationship?.color || '#f43f5e' };"
				>
					<Sparkles size={ 18 } />
				</div>

                <div>
					<h3 class="text-base font-extrabold tracking-tight">Momentos en { memory.title }</h3>

                    <p class="text-[11px] text-stone-400 font-medium">Contenido registrado dentro de este capítulo</p>
				</div>
			</div>

			<MomentList
				moments         = { memoryMoments }
				currentUserId   = { memoriesStore.currentUser.id }
				relationName    = { memory.title }
				relationPath    = { relationParam }
				color           = { currentRelationship?.color || '#f43f5e' }
				onDelete        = { handleDeleteMoment }
				onUnlock        = { handleUnlockMoment }
				onRecordView    = { handleRecordView }
			/>
		</div>
	{/if}
</div>

<!-- Modal para Desbloquear la Memoria si tiene Contraseña -->
{#if memory?.password && !isMemoryUnlocked}
	<SecurityUnlockModal
		isOpen={ isUnlockOpen }
		title="Memoria Protegida con Clave"
		description="Esta memoria es privada. Ingresa la contraseña para visualizarla."
		correctPassword={ memory.password }
		onSuccess={ handleMemoryUnlockSuccess }
		onClose={ () => {
			goto( `/dashboard/${ relationParam }` );
		} }
	/>
{/if}

<!-- Modal para Desbloquear Momentos Individuales con Contraseña -->
<SecurityUnlockModal
	isOpen={ isUnlockMomentOpen }
	title="Momento Protegido"
	description="Ingresa la contraseña para desbloquear y revelar este momento."
	correctPassword={ unlockMomentTarget?.metadata?.password || '' }
	onSuccess={ handleUnlockMomentSuccess }
	onClose={ () => {
		isUnlockMomentOpen = false;
		unlockMomentTarget = null;
	} }
/>

<!-- Modal de Confirmación para Eliminar Memoria (Advertencia de Borrado en Cascada) -->
<ConfirmDialog
	isOpen={ isConfirmDeleteMemoryOpen }
	title="¿Eliminar esta memoria y su contenido?"
	description={ `¿Estás seguro de que deseas eliminar permanentemente la memoria "${ memory?.title || '' }"? Al eliminarla, se eliminarán definitivamente TODOS los momentos, dedicatorias y fotos asociados a ella. Esta acción no se puede deshacer.` }
	confirmText="Sí, eliminar todo"
	cancelText="Cancelar"
	variant="danger"
	onConfirm={ handleConfirmDeleteMemory }
	onClose={ () => ( isConfirmDeleteMemoryOpen = false ) }
/>

<!-- Modal Independiente para Editar Memoria -->
{#if memory}
	<EditMemoryModal
		isOpen={ isEditMemoryOpen }
		{memory}
		color={ currentRelationship?.color }
		onClose={ () => ( isEditMemoryOpen = false ) }
	/>
{/if}

<!-- Modal para Agregar Momento a la Memoria -->
{#if memory}
	<UploadModal
		isOpen={ isUploadOpen }
		relationshipId={ currentRelationship?.id }
		initialTab="moment"
		initialMemoryId={ memory.id }
		onClose={ () => ( isUploadOpen = false ) }
	/>
{/if}
