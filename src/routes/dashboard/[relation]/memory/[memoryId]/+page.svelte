<script lang="ts">
	import { page } from '$app/state';

    import {
		ArrowLeft,
		Images,
		Clock,
		Plus,
		Calendar,
		Sparkles,
		FolderHeart
	} from '@lucide/svelte';

    import type {
        MemoryEntity,
        MomentEntity,
        Relationship
    }                           from '$lib/types';
	import { memoriesStore }    from '$lib/store.svelte';
	import MomentList           from '$lib/components/moments/MomentList.svelte';
	import UploadModal          from '$lib/components/UploadModal.svelte';
	import SecurityUnlockModal  from '$lib/components/shared/SecurityUnlockModal.svelte';


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

	let isUploadOpen        = $state<boolean>( false );
	let isUnlockOpen        = $state<boolean>( false );
	let isUnlockedSession   = $state<boolean>( false );
	let unlockMomentTarget  = $state<MomentEntity | null>( null );
	let isUnlockMomentOpen  = $state<boolean>( false );


    $effect( () => {
		if ( memory?.password && !isUnlockedSession ) {
			isUnlockOpen = true;
		}
	});


    function handleMemoryUnlockSuccess(): void {
		isUnlockedSession = true;
		isUnlockOpen = false;
	}


    function handleUnlockMoment( moment: MomentEntity ): void {
		unlockMomentTarget = moment;
		isUnlockMomentOpen = true;
	}


    function handleUnlockMomentSuccess(): void {
		if ( unlockMomentTarget?.metadata ) {
			unlockMomentTarget.metadata.password = undefined;
			unlockMomentTarget.metadata.is_blocked = false;
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
</script>

<svelte:head>
	<title>{ memory?.title || 'Memoria' } - OurMemories</title>
</svelte:head>

<div class="space-y-8">
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
					class="absolute inset-0 w-full h-full object-cover brightness-75 dark:brightness-50 transition-all duration-700"
				/>
			{:else}
				<div class="absolute inset-0 bg-linear-to-tr from-brand-accent/40 via-purple-600/40 to-pink-500/40"></div>
			{/if}

			<div class="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-black/20"></div>

			<!-- Badges Superiores -->
			<div class="relative z-10 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-black/50 backdrop-blur-md border border-white/15 shadow-sm">
						<Images size={ 14 } />
						<span>{ memoryMoments.length } momentos</span>
					</span>

					{#if memory.timer}
						<span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-amber-300 bg-amber-950/70 backdrop-blur-md border border-amber-400/30">
							<Clock size={ 14 } />
							<span>{ memory.timer }s límite</span>
						</span>
					{/if}
				</div>

				<button
					type="button"
					onclick={() => ( isUploadOpen = true )}
					class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/90 hover:bg-white text-stone-900 text-xs font-extrabold shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
				>
					<Plus size={ 16 } />
					<span>Añadir a esta Memoria</span>
				</button>
			</div>

			<!-- Información de la Memoria -->
			<div class="relative z-10 space-y-2 text-white max-w-2xl pt-8">
				<div class="flex items-center gap-2 text-[11px] font-semibold text-white/70">
					<Calendar size={ 13 } />
					<span>Creado el { new Date( memory.created_at ).toLocaleDateString( 'es-ES', { month: 'long', day: 'numeric', year: 'numeric' } ) }</span>
				</div>

				<h1 class="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
					{ memory.title }
				</h1>

				{#if memory.description}
					<p class="text-sm text-white/80 leading-relaxed font-normal">
						{ memory.description }
					</p>
				{/if}
			</div>
		</div>

		<!-- Galería de Momentos de la Memoria -->
		<div class="space-y-4 pt-4">
			<div class="flex items-center gap-2">
				<div class="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
					<Sparkles size={ 18 } />
				</div>
				<div>
					<h3 class="text-base font-extrabold tracking-tight">Momentos en { memory.title }</h3>
					<p class="text-[11px] text-stone-400 font-medium">Contenido registrado dentro de este capítulo</p>
				</div>
			</div>

			<MomentList
				moments={memoryMoments}
				currentUserId={memoriesStore.currentUser.id}
				relationName={memory.title}
				onDelete={handleDeleteMoment}
				onUnlock={handleUnlockMoment}
				onRecordView={handleRecordView}
			/>
		</div>
	{/if}
</div>

<!-- Modal para Desbloquear la Memoria si tiene Contraseña -->
{#if memory?.password && !isUnlockedSession}
	<SecurityUnlockModal
		isOpen={isUnlockOpen}
		title="Memoria Protegida con Clave"
		description="Esta memoria es privada. Ingresa la contraseña para visualizarla."
		correctPassword={memory.password}
		onSuccess={handleMemoryUnlockSuccess}
		onClose={() => {
			isUnlockOpen = false;
			window.location.href = `/dashboard/${ relationParam }`;
		}}
	/>
{/if}

<!-- Modal para Desbloquear Momentos Individuales con Contraseña -->
<SecurityUnlockModal
	isOpen={isUnlockMomentOpen}
	title="Momento Protegido"
	description="Ingresa la contraseña para desbloquear y revelar este momento."
	correctPassword={unlockMomentTarget?.metadata?.password || ''}
	onSuccess={handleUnlockMomentSuccess}
	onClose={() => {
		isUnlockMomentOpen = false;
		unlockMomentTarget = null;
	}}
/>

<!-- Modal para Agregar Momento a la Memoria -->
{#if memory}
	<UploadModal
		isOpen={isUploadOpen}
		relationshipId={currentRelationship?.id}
		initialTab="moment"
		initialMemoryId={memory.id}
		onClose={() => ( isUploadOpen = false )}
	/>
{/if}

