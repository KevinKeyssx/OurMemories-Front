<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

    import { EyeOff } from '@lucide/svelte';

    import { memoriesStore } from '$lib/store.svelte';


    interface Props {
		imageUrl?       : string;
		videoUrl?       : string;
		alt?            : string;
		isEphemeral?    : boolean;
		watermarkText?  : string;
		isObscured?     : boolean;
		class?          : string;
	}


    let {
		imageUrl,
		videoUrl,
		alt = 'Contenido del momento',
		isEphemeral = false,
		watermarkText,
		isObscured: propIsObscured = false,
		class: customClass = ''
	}: Props = $props();


    let canvasElement    = $state<HTMLCanvasElement | null>( null );
	let internalObscured = $state<boolean>( false );
	let isMediaLoaded    = $state<boolean>( false );
	let blobVideoUrl     = $state<string | null>( null );

	const isObscured     = $derived<boolean>( propIsObscured || internalObscured );


    const effectiveWatermark = $derived<string>(
		watermarkText || `${ memoriesStore.currentUser.name } • ${ new Date().toLocaleDateString() } • Confidencial`
	);


    function drawProtectedImage( src: string ): void {
		if ( !canvasElement ) {
			return;
		}

		const img = new Image();

		const renderToCanvas = (): void => {
			if ( !canvasElement ) {
				return;
			}

			const canvas = canvasElement;
			const ctx = canvas.getContext( '2d' );

            if ( !ctx ) {
				return;
			}

			canvas.width = img.naturalWidth || 800;
			canvas.height = img.naturalHeight || 600;

			// Dibujar la imagen directamente en el buffer de píxeles del canvas
			ctx.drawImage( img, 0, 0, canvas.width, canvas.height );

			// Dibujar marca de agua de seguridad disuasoria
			ctx.save();
			ctx.font = 'bold 14px sans-serif';
			ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
			ctx.textAlign = 'right';
			ctx.textBaseline = 'bottom';
			ctx.fillText( effectiveWatermark, canvas.width - 16, canvas.height - 16 );
			ctx.restore();

			isMediaLoaded = true;
		};

		img.onload = renderToCanvas;

		img.onerror = (): void => {
			isMediaLoaded = false;
		};

		img.src = src;

		if ( img.complete && img.naturalWidth > 0 ) {
			renderToCanvas();
		}
	}


    async function prepareProtectedVideo( url: string ): Promise<void> {
		try {
			const res = await fetch( url );

            if ( !res.ok ) {
				blobVideoUrl = url;
				return;
			}

            const blob = await res.blob();

            blobVideoUrl = URL.createObjectURL( blob );
		} catch {
			blobVideoUrl = url;
		}
	}


	function handleWindowBlur(): void {
		if ( isEphemeral ) {
			internalObscured = true;
		}
	}

	function handleWindowFocus(): void {
		if ( isEphemeral ) {
			internalObscured = false;
		}
	}

	function handleVisibilityChange(): void {
		if ( isEphemeral && document.hidden ) {
			internalObscured = true;
		} else if ( isEphemeral && !document.hidden ) {
			internalObscured = false;
		}
	}

	function handleKeyCapture( e: KeyboardEvent ): void {
		if ( !isEphemeral ) {
			return;
		}

		// Bloqueo y detección de PrintScreen, DevTools, atajos de recorte y captura
		const isCaptureOrModifierKey =
			e.key === 'PrintScreen'
            || e.code === 'PrintScreen'
            || e.keyCode === 44
            || e.key === 'Shift'
            || e.key === 'Control'
            || e.key === 'Alt'
            || e.key === 'Meta'
            || e.key === 'F12'
            || e.shiftKey
            || e.ctrlKey
            || e.altKey
            || e.metaKey;

		if ( isCaptureOrModifierKey ) {
			internalObscured = true;

			try {
				navigator.clipboard?.writeText( '' );
			} catch {}

			setTimeout( () => {
				internalObscured = false;
			}, 1500 );
		}
	}

	$effect( () => {
		if ( isEphemeral && imageUrl && canvasElement ) {
			drawProtectedImage( imageUrl );
		}
	} );

	$effect( () => {
		if ( isEphemeral && videoUrl ) {
			prepareProtectedVideo( videoUrl );
		}
	} );

	onMount( () => {
		if ( isEphemeral ) {
			window.addEventListener( 'blur', handleWindowBlur );
			window.addEventListener( 'focus', handleWindowFocus );
			document.addEventListener( 'visibilitychange', handleVisibilityChange );
			window.addEventListener( 'keydown', handleKeyCapture );
			window.addEventListener( 'keyup', handleKeyCapture );
		}
	} );

	onDestroy( () => {
		if ( typeof window !== 'undefined' ) {
			window.removeEventListener( 'blur', handleWindowBlur );
			window.removeEventListener( 'focus', handleWindowFocus );
			document.removeEventListener( 'visibilitychange', handleVisibilityChange );
			window.removeEventListener( 'keydown', handleKeyCapture );
			window.removeEventListener( 'keyup', handleKeyCapture );
		}

        if ( blobVideoUrl && blobVideoUrl.startsWith( 'blob:' ) ) {
			URL.revokeObjectURL( blobVideoUrl );
		}
	} );
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="relative w-full h-full overflow-hidden select-none { customClass }"
	oncontextmenu={( e ) => e.preventDefault()}
	onclick={() => { if ( internalObscured ) internalObscured = false; }}
	role="region"
	aria-label="Contenido confidencial protegido"
>
	{#if isEphemeral}
		<!-- Imagen protegida en Canvas: Sin etiqueta img ni atributo src en el DOM -->
		{#if imageUrl}
			<div class="relative w-full h-full overflow-hidden select-none">
				<canvas
					bind:this={canvasElement}
					class="w-full h-full object-cover select-none pointer-events-none transition-all duration-300 { isObscured ? 'blur-2xl brightness-50' : '' }"
					aria-label={alt}
				></canvas>

				{#if !isMediaLoaded}
					<div class="absolute inset-0 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs animate-pulse">
						<div class="w-8 h-8 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin"></div>
					</div>
				{/if}
			</div>
		{:else if videoUrl}
			<!-- Video protegido con reproducción HTML5 vía Blob -->
			<!-- svelte-ignore a11y_media_has_caption -->
			<video
				src={ blobVideoUrl || videoUrl }
				class="w-full h-full object-cover select-none transition-all duration-300 { isObscured ? 'blur-2xl brightness-50' : '' }"
				controls
				controlsList="nodownload nofullscreen noremoteplayback"
				disablePictureInPicture={ true }
				playsinline
				oncontextmenu={( e ) => e.preventDefault()}
                loop={ true }
                muted={ false }
                autoplay={ true }
			></video>
		{/if}

		<!-- Escudo reactivo al perder el foco (Anti-capturas y Anti-recortes de pantalla) -->
		{#if isObscured}
			<div class="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 bg-stone-950/95 backdrop-blur-2xl text-center text-white space-y-2">
				<div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 animate-pulse">
					<EyeOff size={ 20 } />
				</div>
				<p class="text-xs font-bold text-amber-200">Protección de privacidad activa</p>
				<p class="text-[10px] text-stone-400 max-w-50">
					Haz clic en la ventana para reanudar la visualización.
				</p>
			</div>
		{/if}

		<!-- Marca de agua sutil en pantalla -->
		<div class="absolute bottom-2 right-2 pointer-events-none z-10 px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-xs text-[9px] font-mono text-white/50 tracking-wider">
			{ effectiveWatermark }
		</div>
	{:else}
		<!-- Modo estándar (no efímero) -->
		{#if imageUrl}
			<img
				src={imageUrl}
				alt={alt}
				class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
			/>
		{:else if videoUrl}
			<!-- svelte-ignore a11y_media_has_caption -->
			<video
				src={videoUrl}
				class="w-full h-full object-cover"
				controls
				playsinline
                loop={ true }
                muted={ false }
                autoplay={ true }
			></video>
		{/if}
	{/if}
</div>

<style>
	@media print {
		:global( canvas ),
		:global( video ) {
			display: none !important;
		}
	}
</style>
