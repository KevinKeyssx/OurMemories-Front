<script lang="ts">
	import { onDestroy } from 'svelte';
	import { memoriesStore } from '$lib/store.svelte';

	interface Props {
		url?           : string;
		imageUrl?      : string;
		videoUrl?      : string;
		alt?           : string;
		isEphemeral?   : boolean;
		watermarkText? : string;
		isObscured?    : boolean;
		fit?           : 'cover' | 'contain';
		class?         : string;
	}

	let {
		url,
		imageUrl: propImageUrl,
		videoUrl: propVideoUrl,
		alt = 'Contenido del momento',
		isEphemeral = false,
		watermarkText,
		isObscured = false,
		fit = 'cover',
		class: customClass = ''
	}: Props = $props();

	const isVideoType = $derived<boolean>(
		Boolean( propVideoUrl || ( url && ( url.includes( '.mp4' ) || url.includes( '.mov' ) || url.includes( 'youtube' ) || url.includes( 'youtu.be' ) ) ) )
	);
	const imageUrl = $derived<string | undefined>(
		propImageUrl || ( url && !isVideoType ? url : undefined )
	);
	const videoUrl = $derived<string | undefined>(
		propVideoUrl || ( url && isVideoType ? url : undefined )
	);

	let canvasElement = $state<HTMLCanvasElement | null>( null );
	let isMediaLoaded = $state<boolean>( false );
	let blobVideoUrl  = $state<string | null>( null );

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

	onDestroy( () => {
		if ( blobVideoUrl && blobVideoUrl.startsWith( 'blob:' ) ) {
			URL.revokeObjectURL( blobVideoUrl );
		}
	} );
</script>

<div
	class="relative w-full h-full overflow-hidden select-none { customClass }"
	oncontextmenu={ ( e ) => e.preventDefault() }
	role="region"
	aria-label="Contenido confidencial protegido"
>
	{#if isEphemeral}
		<!-- Imagen protegida en Canvas: Sin etiqueta img ni atributo src en el DOM -->
		{#if imageUrl}
			<div class="relative w-full h-full overflow-hidden select-none">
				<canvas
					bind:this={ canvasElement }
					class="w-full h-full select-none pointer-events-none transition-all duration-300 { fit === 'contain' ? 'object-contain max-h-[65vh]' : 'object-cover' } { isObscured ? 'blur-2xl brightness-50' : '' }"
					aria-label={ alt }
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
				class="w-full h-full select-none transition-all duration-300 { fit === 'contain' ? 'object-contain max-h-[65vh]' : 'object-cover' } { isObscured ? 'blur-2xl brightness-50' : '' }"
				controls
				controlsList="nodownload nofullscreen noremoteplayback"
				disablePictureInPicture={ true }
				playsinline
				oncontextmenu={ ( e ) => e.preventDefault() }
				loop={ true }
				muted={ false }
				autoplay={ true }
			></video>
		{/if}

		<!-- Marca de agua sutil en pantalla -->
		<div class="absolute bottom-2 right-2 pointer-events-none z-10 px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-xs text-[9px] font-mono text-white/50 tracking-wider">
			{ effectiveWatermark }
		</div>
	{:else}
		<!-- Modo estándar (no efímero) -->
		{#if imageUrl}
			<img
				src={ imageUrl }
				alt={ alt }
				class="w-full h-full transition-transform duration-700 { fit === 'contain' ? 'object-contain max-h-[65vh]' : 'object-cover group-hover:scale-105' }"
			/>
		{:else if videoUrl}
			<!-- svelte-ignore a11y_media_has_caption -->
			<video
				src={ videoUrl }
				class="w-full h-full { fit === 'contain' ? 'object-contain max-h-[65vh]' : 'object-cover' }"
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