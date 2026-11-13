<script lang="ts">
    import { fly } from 'svelte/transition';
    import { untrack } from 'svelte';

    import {
		Sparkles,
		Video,
		Quote as QuoteIcon,
		Headphones,
		Music
	} from '@lucide/svelte';

	import type {
        MemoryEntity,
        MomentEntity,
        MomentTag
    }                                   from '$lib/types';
	import Select, { type SelectItem }  from '$lib/components/shared/inputs/Select.svelte';
	import { memoriesStore }            from '$lib/store.svelte';
	import Tabs, { type TabItem }       from '$lib/components/shared/Tabs.svelte';
	import MediaUploader                from '$lib/components/shared/inputs/MediaUploader.svelte';
	import VoiceRecorder                from '$lib/components/shared/inputs/VoiceRecorder.svelte';
	import ColorPicker                  from '$lib/components/shared/inputs/ColorPicker.svelte';
	import DatePicker                   from '$lib/components/shared/inputs/DatePicker.svelte';
	import SecurityOptionsSection       from '$lib/components/shared/SecurityOptionsSection.svelte';
	import { extractYouTubeVideoId }    from '$lib/utils/youtube';

	interface Props {
		relationshipId   : string;
		memories         : MemoryEntity[];
		initialMemoryId ?: string;
		editingMoment   ?: MomentEntity | null;
		color           ?: string;
		onSubmit         : ( data: Partial<MomentEntity> ) => void;
		onCancel         : () => void;
	}

	let {
		relationshipId,
		memories,
		initialMemoryId = '',
		editingMoment = null,
		color,
		onSubmit,
		onCancel
	}: Props = $props();

	let selectedMemoryId = $state<string>( '' );
	let activeTab        = $state<string>( 'media' );
	let title            = $state<string>( '' );
	let content          = $state<string>( '' );
	let mediaUrl         = $state<string>( '' );
	let imageUrl         = $state<string>( '' );
	let videoUrl         = $state<string>( '' );
	let audioUrl         = $state<string>( '' );
	let audioDuration    = $state<number>( 0 );
	let videoDuration    = $state<number>( 0 );
	let youtubeInput     = $state<string>( '' );
	let youtubeVideoId   = $state<string>( '' );
	let bgColor          = $state<string>( '' );
	let captureDate      = $state<string>( new Date().toISOString().split( 'T' )[ 0 ] );

	// Opciones del momento (Seguridad, Efimeridad y Desbloqueo a futuro)
	let isTemporal       = $state<boolean>( false );
	let password         = $state<string>( '' );
	let timer            = $state<number | undefined>( undefined );
	let isFutureUnlock   = $state<boolean>( false );
	let unlockDate       = $state<string>( '' );
	let unlockTime       = $state<string>( '' );

	const momentTabs: TabItem[] = [
		{
			id    : 'media',
			label : 'Video / Imagen',
			icon  : Video
		},
		{
			id    : 'quote',
			label : 'Dedicatoria',
			icon  : QuoteIcon
		},
		{
			id    : 'voice',
			label : 'Nota de Voz',
			icon  : Headphones
		}
	];

	let lastLoadedMomentId = $state<string | null>( null );

	$effect( () => {
		const currentId = editingMoment?.id || ( initialMemoryId ? `create_${ initialMemoryId }` : '__create__' );
		if ( currentId !== lastLoadedMomentId ) {
			lastLoadedMomentId = currentId;
			untrack( () => {
				if ( editingMoment ) {
					selectedMemoryId = editingMoment.memory_id || '';
					title            = editingMoment.title || '';
					content          = editingMoment.content || '';
					const initialUrl = ( editingMoment.metadata?.url || '' ).trim();
					mediaUrl         = initialUrl;
					imageUrl         = editingMoment.tags?.includes( 'image' ) ? initialUrl : '';
					videoUrl         = editingMoment.tags?.includes( 'video' ) ? initialUrl : '';
					audioUrl         = editingMoment.tags?.includes( 'voice note' ) ? initialUrl : '';
					audioDuration    = editingMoment.metadata?.audioDuration || 0;
					youtubeVideoId   = editingMoment.metadata?.youtubeVideoId || '';
					youtubeInput     = editingMoment.metadata?.youtubeVideoId ? `https://youtube.com/watch?v=${ editingMoment.metadata.youtubeVideoId }` : '';
					bgColor          = editingMoment.metadata?.bgColor || '';
					captureDate      = editingMoment.capture_date || new Date().toISOString().split( 'T' )[ 0 ];
					password         = editingMoment.metadata?.password || '';
					timer            = editingMoment.metadata?.timer;
					isTemporal       = editingMoment.metadata?.is_temporal || false;
					videoDuration    = editingMoment.metadata?.videoDuration || 0;

					if ( editingMoment.metadata?.unlock_at ) {
						isFutureUnlock = true;
						try {
							const dateObj = new Date( editingMoment.metadata.unlock_at );
							unlockDate = dateObj.toISOString().split( 'T' )[ 0 ];
							unlockTime = `${ String( dateObj.getHours() ).padStart( 2, '0' ) }:${ String( dateObj.getMinutes() ).padStart( 2, '0' ) }`;
						} catch {}
					}

					if ( editingMoment.tags?.includes( 'voice note' ) ) {
						activeTab = 'voice';
					} else if ( editingMoment.tags?.includes( 'quote' ) && !initialUrl ) {
						activeTab = 'quote';
					} else {
						activeTab = 'media';
					}
				} else {
					selectedMemoryId = initialMemoryId;
					activeTab        = 'media';
					title            = '';
					content          = '';
					mediaUrl         = '';
					imageUrl         = '';
					videoUrl         = '';
					audioUrl         = '';
					audioDuration    = 0;
					videoDuration    = 0;
					youtubeVideoId   = '';
					youtubeInput     = '';
					bgColor          = '';
					captureDate      = new Date().toISOString().split( 'T' )[ 0 ];
					password         = '';
					timer            = undefined;
					isTemporal       = false;
					isFutureUnlock   = false;
					unlockDate       = '';
					unlockTime       = '';
				}
			} );
		}
	} );

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

	// Asignar duración por defecto al timer si es efímero y se detecta audio o video
	$effect( () => {
		if ( isTemporal && !timer ) {
			if ( activeTab === 'voice' && audioDuration > 0 ) {
				timer = Math.max( 5, Math.ceil( audioDuration ) );
			} else if ( activeTab === 'media' && videoDuration > 0 ) {
				timer = Math.max( 5, Math.ceil( videoDuration ) );
			}
		}
	} );

	// Validación reactiva según la pestaña activa
	const hasContent = $derived<boolean>(
		activeTab === 'media'
			? Boolean( mediaUrl.trim() || imageUrl.trim() || videoUrl.trim() || content.trim() )
			: activeTab === 'quote'
				? Boolean( content.trim() )
				: Boolean( mediaUrl.trim() || audioUrl.trim() || content.trim() )
	);

	const isTimerValid = $derived<boolean>(
		!isTemporal || Boolean( timer && timer >= 5 && timer <= 180 )
	);

	const isFutureUnlockValid = $derived<boolean>(
		!isFutureUnlock || Boolean( unlockDate && unlockTime )
	);

	const isValid = $derived<boolean>( hasContent && isTimerValid && isFutureUnlockValid );

	async function handlePasteYouTube(): Promise<void> {
		if ( typeof navigator !== 'undefined' && navigator.clipboard?.readText ) {
			try {
				const text = await navigator.clipboard.readText();
				if ( text ) {
					youtubeInput = text;
					const extracted = extractYouTubeVideoId( text );
					youtubeVideoId = extracted || '';
				}
			} catch {}
		}
	}

	function handleYouTubeInput(): void {
		const extracted = extractYouTubeVideoId( youtubeInput );
		youtubeVideoId = extracted || '';
	}

	function handleFormSubmit( e: SubmitEvent ): void {
		e.preventDefault();
		if ( !isValid ) {
			return;
		}

		let finalUrl = '';
		if ( activeTab === 'voice' ) {
			finalUrl = ( audioUrl || mediaUrl ).trim();
		} else if ( activeTab === 'media' ) {
			finalUrl = ( mediaUrl || imageUrl || videoUrl ).trim();
		} else {
			finalUrl = '';
		}

		const tags: MomentTag[] = [];

		if ( activeTab === 'voice' || ( finalUrl && ( finalUrl.startsWith( 'data:audio' ) || finalUrl.endsWith( '.mp3' ) || finalUrl.endsWith( '.wav' ) || finalUrl.endsWith( '.ogg' ) || finalUrl.endsWith( '.webm' ) ) ) ) {
			tags.push( 'voice note' );
		} else if ( activeTab === 'media' && finalUrl ) {
			if ( videoUrl || finalUrl.includes( 'youtube.com' ) || finalUrl.includes( 'youtu.be' ) || finalUrl.endsWith( '.mp4' ) || finalUrl.endsWith( '.mov' ) ) {
				tags.push( 'video' );
			} else {
				tags.push( 'image' );
			}
		}

		if ( activeTab === 'quote' || ( !finalUrl && content.trim() ) ) {
			tags.push( 'quote' );
		}
		if ( content.trim() && !tags.includes( 'quote' ) && !tags.includes( 'voice note' ) ) {
			tags.push( 'text' );
		}

		let unlockAt: string | undefined = undefined;
		if ( isFutureUnlock && unlockDate && unlockTime ) {
			try {
				unlockAt = new Date( `${ unlockDate }T${ unlockTime }:00` ).toISOString();
			} catch {
				unlockAt = undefined;
			}
		}

		onSubmit( {
			relationship_id : relationshipId,
			memory_id       : selectedMemoryId ? selectedMemoryId : undefined,
			title           : title.trim() || undefined,
			content         : content.trim() || undefined,
			author          : editingMoment?.author || memoriesStore.currentUser.name || 'Kevin',
			capture_date    : captureDate || undefined,
			tags            : tags.length > 0 ? tags : [ 'quote' ],
			metadata        : {
				url            : finalUrl || undefined,
				audioDuration  : activeTab === 'voice' ? ( audioDuration || undefined ) : undefined,
				videoDuration  : activeTab === 'media' && ( videoUrl || mediaUrl ) ? ( videoDuration || undefined ) : undefined,
				youtubeVideoId : youtubeVideoId || undefined,
				unlock_at      : unlockAt,
				bgColor        : bgColor || undefined,
				is_temporal    : isTemporal,
				password       : password.trim() || undefined,
				timer          : timer ? Number( timer ) : undefined,
				is_blocked     : Boolean( password.trim() || unlockAt )
			}
		} );
	}
</script>

<form onsubmit={ handleFormSubmit } class="space-y-4">
	<!-- Selector de Destino: Memoria o Suelto con Select bits-ui -->
	<Select
		items={ memorySelectItems }
		bind:value={ selectedMemoryId }
		label="Destino del Momento"
		placeholder="Selecciona el destino del momento..."
		id="mom-destination"
	/>

	<!-- Título del Momento (Opcional) -->
	<div>
		<label for="mom-title" class="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
			Título ( Opcional )
		</label>
		<input
			id="mom-title"
			type="text"
			bind:value={ title }
			placeholder="Ej. Una tarde en la playa..."
			class="w-full px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-white/4 border border-stone-200/80 dark:border-white/10 text-xs font-medium focus:outline-hidden hover:border-brand-accent/50 focus:border-brand-accent transition-colors"
		/>
	</div>

	<!-- Selector de Modo con Tabs (Video/Imagen | Dedicatoria | Nota de Voz) -->
	<div class="space-y-1.5">
		<span class="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
			Tipo de Contenido del Momento
		</span>
		<Tabs
			tabs={ momentTabs }
			bind:activeId={ activeTab }
			{color}
		/>
	</div>

	<!-- Contenido Dinámico según la Pestaña Activa con Transición Suave -->
	{#if activeTab === 'media'}
		<div in:fly={{ y: 8, duration: 200 }} class="space-y-3">
			<!-- Multimedia Unificada (Local o URL) -->
			<MediaUploader
				bind:url={ mediaUrl }
				bind:imageUrl={ imageUrl }
				bind:videoUrl={ videoUrl }
				bind:videoDuration={ videoDuration }
				{color}
				label="Foto o Video del Momento"
				onDurationChange={ ( dur: number ) => {
					if ( isTemporal && dur > 0 && !timer ) {
						timer = Math.max( 5, Math.ceil( dur ) );
					}
				} }
			/>

			<!-- Texto / Descripción Acompañante -->
			<div>
				<label for="mom-content" class="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
					Texto o Descripción
				</label>
				<textarea
					id="mom-content"
					bind:value={ content }
					rows={ 3 }
					placeholder="Escribe lo que sentiste, una frase célebre o un mensaje inolvidable..."
					class="w-full px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-white/4 border border-stone-200/80 dark:border-white/10 text-sm font-medium focus:outline-hidden hover:border-brand-accent/50 focus:border-brand-accent resize-none transition-colors"
				></textarea>
			</div>
		</div>
	{:else if activeTab === 'quote'}
		<div in:fly={{ y: 8, duration: 200 }} class="space-y-1.5">
			<!-- Dedicatoria Grande -->
			<div class="flex items-center justify-between">
				<label for="mom-quote" class="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
					Dedicatoria, Frase o Reflexión Extensa
				</label>
				<span class="text-[10px] text-amber-500 font-semibold">Espacio amplio para dedicar</span>
			</div>
			<textarea
				id="mom-quote"
				bind:value={ content }
				rows={ 7 }
				placeholder="Escribe aquí tu dedicatoria completa, palabras del corazón, carta o frase especial..."
				class="w-full p-4 rounded-2xl bg-stone-100 dark:bg-white/4 border border-stone-200/80 dark:border-white/10 text-sm leading-relaxed font-serif italic focus:outline-hidden hover:border-brand-accent/50 focus:border-brand-accent resize-none transition-colors"
			></textarea>
		</div>
	{:else if activeTab === 'voice'}
		<div in:fly={{ y: 8, duration: 200 }} class="space-y-3">
			<!-- Grabadora de Nota de Voz -->
			<span class="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
				Grabación de Audio / Nota de Voz
			</span>
			<VoiceRecorder
				bind:url={ audioUrl }
				bind:audioUrl={ audioUrl }
				bind:audioDuration={ audioDuration }
				{color}
				onAudioChange={ ( data: { url: string; duration: number } ) => {
					audioUrl = data.url;
					audioDuration = data.duration;
					mediaUrl = data.url;
					if ( isTemporal && data.duration > 0 && !timer ) {
						timer = Math.max( 5, Math.ceil( data.duration ) );
					}
				} }
			/>

			<div>
				<label for="mom-voice-text" class="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
					Texto o Mensaje Complementario
				</label>
				<textarea
					id="mom-voice-text"
					bind:value={ content }
					rows={ 2 }
					placeholder="Añade un texto o título explicativo de la nota de voz (opcional)..."
					class="w-full px-4 py-2 rounded-2xl bg-stone-100 dark:bg-white/4 border border-stone-200/80 dark:border-white/10 text-xs font-medium focus:outline-hidden hover:border-brand-accent/50 focus:border-brand-accent resize-none transition-colors"
				></textarea>
			</div>
		</div>
	{/if}

	<!-- Música de Fondo de YouTube (General para todo el momento) -->
	<div class="space-y-1.5 pt-1">
		<div class="flex items-center justify-between">
			<label for="mom-youtube" class="flex items-center gap-1.5 text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
				<Music size={ 13 } class="text-rose-500" />
				<span>Música de Fondo ( YouTube )</span>
			</label>
			{#if youtubeVideoId}
				<button
					type="button"
					onclick={ () => { youtubeInput = ''; youtubeVideoId = ''; } }
					class="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
				>
					Quitar música
				</button>
			{/if}
		</div>

		<div class="relative flex items-center">
			<div class="absolute left-3.5 text-stone-400 pointer-events-none">
				<Music size={ 15 } />
			</div>

			<input
				id="mom-youtube"
				type="text"
				bind:value={ youtubeInput }
				oninput={ handleYouTubeInput }
				placeholder="Pega la URL de YouTube (ej. https://youtube.com/watch?v=...)"
				class="w-full pl-10 pr-28 py-2.5 rounded-2xl bg-stone-100 dark:bg-white/4 border border-stone-200/80 dark:border-white/10 text-xs font-medium focus:outline-hidden hover:border-brand-accent/50 focus:border-brand-accent transition-colors"
			/>

			<button
				type="button"
				onclick={ handlePasteYouTube }
				class="absolute right-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-white/10 text-stone-700 dark:text-stone-200 hover:text-brand-accent border border-stone-200/60 dark:border-white/10 shadow-xs active:scale-95 transition-all cursor-pointer"
			>
				Pegar enlace
			</button>
		</div>

		{#if youtubeVideoId}
			<div class="flex items-center gap-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold animate-in fade-in-0 duration-200">
				<Music size={ 14 } />
				<span>Canción de YouTube vinculada (ID: { youtubeVideoId })</span>
			</div>
		{/if}
	</div>

	<!-- Color de Fondo Reutilizable (bgColor) -->
	<ColorPicker
		bind:value={ bgColor }
		label="Color de fondo:"
	/>

	<!-- Selector de Fecha de Captura -->
	<DatePicker
		bind:value={ captureDate }
		label="Fecha del Momento"
		id="mom-date"
	/>

	<!-- Opciones del Momento (Desbloqueo a futuro, Efimeridad y Contraseña) -->
	<SecurityOptionsSection
		bind:password={ password }
		bind:timer={ timer }
		bind:isTemporal={ isTemporal }
		bind:isFutureUnlock={ isFutureUnlock }
		bind:unlockDate={ unlockDate }
		bind:unlockTime={ unlockTime }
		showFutureUnlock={ true }
		showEphemeral={ true }
		title="Opciones del momento"
	/>

	<!-- Botones de Acción -->
	<div class="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-white/5">
		{#if !isValid}
			<p class="text-[11px] font-semibold text-amber-500">
				{#if !hasContent}
					{#if activeTab === 'media'}
						* Añade una foto, video o texto para guardar el momento.
					{:else if activeTab === 'quote'}
						* Escribe el texto de tu dedicatoria para continuar.
					{:else}
						* Graba una nota de voz o escribe un mensaje para continuar.
					{/if}
				{:else if !isTimerValid}
					* El momento efímero requiere un temporizador entre 5s y 180s.
				{:else if !isFutureUnlockValid}
					* Configura la fecha y hora para el desbloqueo a futuro.
				{/if}
			</p>
		{:else}
			<div></div>
		{/if}

		<div class="flex items-center gap-3">
			<button
				type="button"
				onclick={ onCancel }
				class="px-5 py-2.5 rounded-2xl text-xs font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
			>
				Cancelar
			</button>

			<button
				type="submit"
				disabled={ !isValid }
				class="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-white text-xs font-bold active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer { color ? '' : 'bg-linear-to-r from-brand-accent to-purple-600 shadow-lg shadow-brand-accent/25 hover:shadow-brand-accent/40' }"
				style={ color ? `background-color: ${ color }; box-shadow: 0 4px 14px -2px ${ color }66;` : '' }
			>
				<Sparkles size={ 16 } />
				<span>{ editingMoment ? 'Guardar Cambios' : 'Guardar Momento' }</span>
			</button>
		</div>
	</div>
</form>
