<script lang="ts">
	import {
		Image as ImageIcon,
		Video as VideoIcon,
		CloudUpload,
		Link as LinkIcon,
		Trash,
		CircleAlert
	} from '@lucide/svelte';

    import Tabs, { type TabItem } from '$lib/components/shared/Tabs.svelte';


    export type MediaType = 'image' | 'video' | 'none';


    export interface MediaChangeEvent {
		type : MediaType;
		url  : string;
	}

	export type MediaAcceptType = 'all' | 'image' | 'video';

	interface Props {
		imageUrl      ?: string;
		videoUrl      ?: string;
		maxSizeMB     ?: number;
		accept        ?: MediaAcceptType;
		label         ?: string;
		color         ?: string;
		class         ?: string;
		onMediaChange ?: ( data: MediaChangeEvent ) => void;
	}

	let {
		imageUrl = $bindable( '' ),
		videoUrl = $bindable( '' ),
		maxSizeMB = 15,
		accept = 'all',
		label = 'Foto o Video del Momento',
		color,
		class: customClass = '',
		onMediaChange
	}: Props = $props();


    let activeMode      = $state<string>( 'local' );
	let isDragging      = $state<boolean>( false );
	let errorMsg        = $state<string>( '' );
	let fileName        = $state<string>( '' );
	let urlInput        = $state<string>( '' );
	let fileInputRef    = $state<HTMLInputElement | null>( null );


    const uploadTabs: TabItem[] = [
		{
			id    : 'local',
			label : 'Local',
			icon  : CloudUpload
		},
		{
			id    : 'url',
			label : 'URL',
			icon  : LinkIcon
		}
	];

	const currentMediaUrl   = $derived<string>( imageUrl || videoUrl );
	const currentType       = $derived<MediaType>( videoUrl ? 'video' : imageUrl ? 'image' : 'none' );


    function detectUrlType( url: string ): 'image' | 'video' {
		if ( accept === 'image' ) {
			return 'image';
		}
		if ( accept === 'video' ) {
			return 'video';
		}

		const cleanUrl = url.trim().toLowerCase();
		const videoExtensions: string[] = [ '.mp4', '.webm', '.ogg', '.mov', '.m4v' ];
		const isVideoExt = videoExtensions.some( ( ext: string ) => cleanUrl.includes( ext ) );

		if ( isVideoExt || cleanUrl.includes( 'youtube.com' ) || cleanUrl.includes( 'youtu.be' ) || cleanUrl.includes( 'vimeo.com' ) ) {
			return 'video';
		}

        return 'image';
	}


    function processFile( file: File ): void {
		errorMsg = '';

        if ( file.size > maxSizeMB * 1024 * 1024 ) {
			errorMsg = `El archivo supera el límite de ${ maxSizeMB }MB. Elige uno más liviano.`;
			return;
		}

		const isVideo = file.type.startsWith( 'video/' );
		const isImage = file.type.startsWith( 'image/' );

		if ( accept === 'image' && !isImage ) {
			errorMsg = 'Formato no soportado. Selecciona un archivo de imagen (JPG, PNG, WEBP, GIF).';
			return;
		}

		if ( accept === 'video' && !isVideo ) {
			errorMsg = 'Formato no soportado. Selecciona un archivo de video (MP4, WEBM).';
			return;
		}

		if ( !isVideo && !isImage ) {
			errorMsg = 'Formato no soportado. Selecciona una imagen o un video.';
			return;
		}

		fileName = file.name;

        const reader = new FileReader();

		reader.onload = (): void => {
			const result = reader.result as string;

            if ( isVideo ) {
				videoUrl = result;
				imageUrl = '';

                onMediaChange?.( { type: 'video', url: result } );
			} else {
				imageUrl = result;
				videoUrl = '';

                onMediaChange?.( { type: 'image', url: result } );
			}
		};

		reader.onerror = (): void => {
			errorMsg = 'Error al leer el archivo local.';
		};

		reader.readAsDataURL( file );
	}


    function handleFileInput( e: Event ): void {
		const target = e.target as HTMLInputElement;

        if ( target.files && target.files[ 0 ] ) {
			processFile( target.files[ 0 ] );
		}
	}


    function handleDrop( e: DragEvent ): void {
		e.preventDefault();

        isDragging = false;

        if ( e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[ 0 ] ) {
			processFile( e.dataTransfer.files[ 0 ] );
		}
	}


    function handleDragOver( e: DragEvent ): void {
		e.preventDefault();

        isDragging = true;
	}


    function handleDragLeave(): void {
		isDragging = false;
	}


    function handleUrlSubmit(): void {
		const val = urlInput.trim();

        errorMsg = '';

        if ( !val ) {
			return;
		}

		const detected = detectUrlType( val );

        fileName = val.split( '/' ).pop() || 'Enlace externo';

		if ( detected === 'video' ) {
			videoUrl = val;
			imageUrl = '';

            onMediaChange?.( { type: 'video', url: val } );
		} else {
			imageUrl = val;
			videoUrl = '';

            onMediaChange?.( { type: 'image', url: val } );
		}
	}


    function clearMedia(): void {
		imageUrl = '';
		videoUrl = '';
		urlInput = '';
		fileName = '';
		errorMsg = '';

        if ( fileInputRef ) {
			fileInputRef.value = '';
		}

        onMediaChange?.( { type: 'none', url: '' } );
	}
</script>

<div class="w-full flex flex-col space-y-2 { customClass }">
	<div class="flex items-center justify-between">
		{#if label}
			<span class="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
				{ label }
			</span>
		{/if}

		{#if !currentMediaUrl}
			<!-- Switch de Modo: Archivo Local o URL con Tabs animados -->
			<Tabs
				tabs={uploadTabs}
				bind:activeId={activeMode}
				size="small"
				{color}
			/>
		{/if}
	</div>

	{#if currentMediaUrl}
		<!-- Vista Previa de la Multimedia Cargada -->
		<div class="relative group rounded-2xl overflow-hidden border border-stone-200/80 dark:border-white/10 bg-black/30 backdrop-blur-xs transition-all">
			{#if currentType === 'video'}
				<div class="relative w-full aspect-video max-h-56 bg-stone-950 flex items-center justify-center">
					<video
						src={currentMediaUrl}
						controls
						playsinline
						class="w-full h-full object-contain"
					>
						<track kind="captions" />
					</video>
				</div>
			{:else}
				<div class="relative w-full h-44 bg-stone-900/50 flex items-center justify-center overflow-hidden">
					<img
						src={currentMediaUrl}
						alt="Vista previa"
						class="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
					/>
				</div>
			{/if}

			<!-- Barra Flotante de Información y Eliminación -->
			<div class="p-2.5 bg-[#180D2E]/90 border-t border-white/10 backdrop-blur-md flex items-center justify-between text-white">
				<div class="flex items-center gap-2 truncate pr-2">
					<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider { currentType === 'video' ? 'bg-purple-500/30 text-purple-200 border border-purple-500/30' : 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/30' }">
						{#if currentType === 'video'}
							<VideoIcon size={ 10 } />
							<span>Video</span>
						{:else}
							<ImageIcon size={ 10 } />
							<span>Foto</span>
						{/if}
					</span>

                    <span class="text-xs font-medium text-stone-200 truncate">
						{ fileName || 'Multimedia seleccionada' }
					</span>
				</div>

				<button
					type="button"
					onclick={clearMedia}
					class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white text-xs font-semibold transition-all shrink-0 cursor-pointer"
					title="Eliminar y seleccionar otra"
				>
					<Trash size={ 13 } />
					<span>Cambiar</span>
				</button>
			</div>
		</div>
	{:else}
		<!-- Zona de Selección / Carga -->
		{#if activeMode === 'local'}
			<!-- Zona Drag and Drop para Archivo Local -->
			<div
				tabindex="0"
				role="button"
				ondrop={handleDrop}
				ondragover={handleDragOver}
				ondragleave={handleDragLeave}
				onclick={() => fileInputRef?.click()}
				onkeydown={( e: KeyboardEvent ) => {
					if ( e.key === 'Enter' || e.key === ' ' ) {
						fileInputRef?.click();
					}
				}}
				class="w-full p-4 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer select-none group { isDragging ? 'border-brand-accent bg-brand-accent/5 scale-[1.01]' : 'border-stone-200/80 dark:border-white/10 hover:border-brand-accent/60 bg-stone-50/50 dark:bg-white/2 hover:bg-stone-50 dark:hover:bg-white/5' }"
			>
				<input
					type="file"
					accept={ accept === 'image' ? 'image/*' : accept === 'video' ? 'video/*' : 'image/*,video/*' }
					bind:this={fileInputRef}
					onchange={handleFileInput}
					class="hidden"
				/>

				<div
					class="size-10 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform { color ? '' : 'bg-brand-accent/10 text-brand-accent' }"
					style={ color ? `background-color: ${ color }1a; color: ${ color };` : '' }
				>
					<CloudUpload size={ 20 } />
				</div>

				<p class="text-xs font-semibold text-stone-700 dark:text-stone-200">
					{#if accept === 'image'}
						Arrastra una imagen aquí, o <span class="underline { color ? '' : 'text-brand-accent' }" style={ color ? `color: ${ color };` : '' }>explora tus archivos</span>
					{:else if accept === 'video'}
						Arrastra un video aquí, o <span class="underline { color ? '' : 'text-brand-accent' }" style={ color ? `color: ${ color };` : '' }>explora tus archivos</span>
					{:else}
						Arrastra una foto o video aquí, o <span class="underline { color ? '' : 'text-brand-accent' }" style={ color ? `color: ${ color };` : '' }>explora tus archivos</span>
					{/if}
				</p>

				<p class="text-[10px] text-stone-400 mt-1">
					{#if accept === 'image'}
						Formatos de imagen soportados: JPG, PNG, WEBP, GIF (Máx. { maxSizeMB }MB)
					{:else if accept === 'video'}
						Formatos de video soportados: MP4, WEBM (Máx. { maxSizeMB }MB)
					{:else}
						Detección automática de imagen o video (Máx. { maxSizeMB }MB)
					{/if}
				</p>
			</div>
		{:else}
			<!-- Entrada de Enlace URL -->
			<div class="space-y-2">
				<div class="relative flex items-center">
					<div class="absolute left-3.5 text-stone-400 pointer-events-none">
						<LinkIcon size={ 14 } />
					</div>

					<input
						type="url"
						bind:value={urlInput}
						placeholder={ accept === 'image' ? 'https://ejemplo.com/imagen.jpg' : accept === 'video' ? 'https://ejemplo.com/video.mp4' : 'https://ejemplo.com/archivo.jpg o .mp4' }
						onkeydown={( e: KeyboardEvent ) => {
							if ( e.key === 'Enter' ) {
								e.preventDefault();
								handleUrlSubmit();
							}
						}}
						class="w-full pl-10 pr-20 py-2.5 rounded-2xl bg-stone-100 dark:bg-white/4 border border-stone-200/80 dark:border-white/10 text-xs font-medium focus:outline-hidden hover:border-brand-accent/50 focus:border-brand-accent transition-colors"
					/>

					<button
						type="button"
						onclick={handleUrlSubmit}
						disabled={!urlInput.trim()}
						class="absolute right-2 px-3 py-1 rounded-xl bg-brand-accent text-white text-xs font-semibold shadow-xs disabled:opacity-40 transition-all cursor-pointer"
					>
						Cargar
					</button>
				</div>

				<p class="text-[10px] text-stone-400 pl-1">
					{#if accept === 'image'}
						Detectaremos y cargaremos la imagen automáticamente.
					{:else if accept === 'video'}
						Detectaremos y cargaremos el video automáticamente.
					{:else}
						Detectaremos automáticamente si se trata de una imagen o un video.
					{/if}
				</p>
			</div>
		{/if}
	{/if}

	{#if errorMsg}
		<div class="flex items-center gap-1.5 text-xs text-rose-500 font-medium pt-1">
			<CircleAlert size={ 13 } />
			<span>{ errorMsg }</span>
		</div>
	{/if}
</div>
