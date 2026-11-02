<script lang="ts">
	import { Sparkles } from '@lucide/svelte';

    import type { MemoryEntity, MomentEntity } from '$lib/types';
	import { memoriesStore } from '$lib/store.svelte';
	import Select, { type SelectItem } from '$lib/components/shared/inputs/Select.svelte';
	import MediaUploader from '$lib/components/shared/inputs/MediaUploader.svelte';
	import ColorPicker from '$lib/components/shared/inputs/ColorPicker.svelte';
	import DatePicker from '$lib/components/shared/inputs/DatePicker.svelte';
	import SecurityOptionsSection from '$lib/components/shared/SecurityOptionsSection.svelte';


    interface Props {
		relationshipId   : string;
		memories         : MemoryEntity[];
		initialMemoryId ?: string;
		onSubmit         : ( data: Partial<MomentEntity> ) => void;
		onCancel         : () => void;
	}

	let {
		relationshipId,
		memories,
		initialMemoryId = '',
		onSubmit,
		onCancel
	}: Props = $props();

	let selectedMemoryId = $state<string>( '' );

	$effect( () => {
		selectedMemoryId = initialMemoryId;
	} );

	let title = $state<string>( '' );
	let content = $state<string>( '' );
	let imageUrl = $state<string>( '' );
	let videoUrl = $state<string>( '' );
	let bgColor = $state<string>( '' );
	let captureDate = $state<string>( new Date().toISOString().split( 'T' )[ 0 ] );

	// Opciones de seguridad
	let isTemporal = $state<boolean>( false );
	let password = $state<string>( '' );
	let timer = $state<number | undefined>( undefined );

	// Opciones para el selector de memoria de Bits UI
	const memorySelectItems = $derived<SelectItem[]>( [
		{
			value       : '',
			label       : 'Momento suelto en la relación',
			description : 'No pertenece a ninguna memoria'
		},
		...memories.map( ( mem: MemoryEntity ) => ({
			value       : mem.id,
			label       : `Memoria: ${ mem.title }`,
			description : mem.description || undefined
		}) )
	] );

	// Reaccionar al cambio de memoria seleccionada para heredar configuraciones
	$effect( () => {
		if ( selectedMemoryId ) {
			const targetMemory = memories.find( ( m: MemoryEntity ) => m.id === selectedMemoryId );
			if ( targetMemory ) {
				if ( targetMemory.password && !password ) {
					password = targetMemory.password;
				}
				if ( targetMemory.timer && !timer ) {
					timer = targetMemory.timer;
				}
			}
		}
	} );

	// Validación: Al menos imagen, video o texto
	const isValid = $derived<boolean>(
		Boolean( imageUrl.trim() || videoUrl.trim() || content.trim() )
	);

	function handleFormSubmit( e: SubmitEvent ): void {
		e.preventDefault();
		if ( !isValid ) {
			return;
		}

		onSubmit( {
			relationship_id : relationshipId,
			memory_id       : selectedMemoryId ? selectedMemoryId : undefined,
			title           : title.trim() || undefined,
			content         : content.trim() || undefined,
			author          : memoriesStore.currentUser.name || 'Kevin',
			capture_date    : captureDate || undefined,
			metadata        : {
				imageUrl    : imageUrl.trim() || undefined,
				videoUrl    : videoUrl.trim() || undefined,
				bgColor     : bgColor || undefined,
				is_temporal : isTemporal,
				password    : password.trim() || undefined,
				timer       : timer ? Number( timer ) : undefined,
				is_blocked  : Boolean( password.trim() )
			}
		} );
	}
</script>

<form onsubmit={handleFormSubmit} class="space-y-4">
	<!-- Selector de Destino: Memoria o Suelto con Select bits-ui -->
	<Select
		items={memorySelectItems}
		bind:value={selectedMemoryId}
		label="Destino del Momento"
		placeholder="Selecciona el destino del momento..."
		id="mom-destination"
	/>

	<!-- Título del Momento (Autor asignado automáticamente) -->
	<div>
		<label for="mom-title" class="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
			Título ( Opcional )
		</label>
		<input
			id="mom-title"
			type="text"
			bind:value={title}
			placeholder="Ej. Una tarde en la playa..."
			class="w-full px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-white/4 border border-stone-200/80 dark:border-white/10 text-xs font-medium focus:outline-hidden hover:border-brand-accent/50 focus:border-brand-accent transition-colors"
		/>
	</div>

	<!-- Multimedia Unificada (Local con Drag & Drop o URL con detección automática) -->
	<MediaUploader
		bind:imageUrl={imageUrl}
		bind:videoUrl={videoUrl}
		label="Foto o Video del Momento"
	/>

	<!-- Texto / Dedicatoria / Frase -->
	<div>
		<div class="grid items-center justify-between mb-1.5">
			<label for="mom-content" class="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
				Texto, Dedicatoria o Reflexión
			</label>
			<span class="text-[10px] text-stone-400">Si no incluyes foto ni video, se catalogará como Dedicatoria</span>
		</div>
		<textarea
			id="mom-content"
			bind:value={content}
			rows={ 3 }
			placeholder="Escribe lo que sentiste, una frase célebre o un mensaje inolvidable..."
			class="w-full px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-white/4 border border-stone-200/80 dark:border-white/10 text-sm font-medium focus:outline-hidden hover:border-brand-accent/50 focus:border-brand-accent resize-none transition-colors"
		></textarea>
	</div>

	<!-- Color de Fondo Reutilizable (bgColor) -->
	<ColorPicker
		bind:value={bgColor}
		label="Color de fondo:"
	/>

	<!-- Selector de Fecha con Bits UI DatePicker -->
	<DatePicker
		bind:value={captureDate}
		label="Fecha del Momento ( capture_date )"
		id="mom-date"
	/>

	<!-- Opciones de Seguridad y Efimeridad Modular con Bits UI Accordion -->
	<SecurityOptionsSection
		bind:password={password}
		bind:timer={timer}
		bind:isTemporal={isTemporal}
		showEphemeral={ true }
	/>

	<!-- Botones de Acción -->
	<div class="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-white/5">
		{#if !isValid}
			<p class="text-[11px] font-semibold text-amber-500">
				* Añade una foto, video o texto para guardar el momento.
			</p>
		{:else}
			<div></div>
		{/if}

		<div class="flex items-center gap-3">
			<button
				type="button"
				onclick={onCancel}
				class="px-5 py-2.5 rounded-2xl text-xs font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
			>
				Cancelar
			</button>

			<button
				type="submit"
				disabled={!isValid}
				class="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-linear-to-r from-brand-accent to-purple-600 text-white text-xs font-bold shadow-lg shadow-brand-accent/25 hover:shadow-brand-accent/40 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
			>
				<Sparkles size={ 16 } />
				<span>Guardar Momento</span>
			</button>
		</div>
	</div>
</form>
