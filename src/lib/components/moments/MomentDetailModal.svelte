<script lang="ts">
	import { onDestroy, untrack }   from 'svelte';
	import type { Component }       from 'svelte';

    import {
		Image as ImageIcon,
		Video as VideoIcon,
		FileText,
		Quote as QuoteIcon,
		Heart,
		Flame,
		Calendar,
		Edit3,
		Trash2,
		Headphones,
		EyeOff,
		X
	} from '@lucide/svelte';

    import type {
        MomentEntity,
        MomentTag
    }                               from '$lib/types';
	import { formatCaptureDate }    from '$lib/utils/date';
	import { memoriesStore }        from '$lib/store.svelte';
	import Dialog                   from '$lib/components/shared/Dialog.svelte';
	import Tooltip                  from '$lib/components/shared/Tooltip.svelte';
	import MomentCountdownProgress  from './MomentCountdownProgress.svelte';
	import AudioPlayer              from './AudioPlayer.svelte';
	import YouTubeBackgroundPlayer  from './YouTubeBackgroundPlayer.svelte';
	import SecureEphemeralMedia     from './SecureEphemeralMedia.svelte';


    interface Props {
		open                  ?: boolean;
		moment                 : MomentEntity;
		relationColor         ?: string;
		isViewed              ?: boolean;
		remainingMs           ?: number | null;
		musicCurrentTime      ?: number;
		musicVolume           ?: number;
		isMusicPlaying        ?: boolean;
		isMusicManuallyPaused ?: boolean;
		onMusicTimeUpdate     ?: ( sec: number ) => void;
		onMusicToggle         ?: ( isPlaying: boolean, manual?: boolean ) => void;
		onRecordView          ?: ( momentId: string ) => void;
		onEdit                ?: ( moment: MomentEntity ) => void;
		onDelete              ?: ( id: string ) => void;
		onClose               ?: () => void;
	}

	let {
		open = $bindable( false ),
		moment,
		relationColor           = '#f43f5e',
		isViewed                = false,
		remainingMs             = $bindable<number | null>( null ),
		musicCurrentTime        = $bindable<number>( 0 ),
		musicVolume             = $bindable<number>( 60 ),
		isMusicPlaying          = $bindable<boolean>( false ),
		isMusicManuallyPaused   = $bindable<boolean>( false ),
		onMusicTimeUpdate,
		onMusicToggle,
		onRecordView,
		onEdit,
		onDelete,
		onClose
	}: Props = $props();

	let isObscured        = $state<boolean>( false );
	let isDisintegrating  = $state<boolean>( false );
	let isVoicePlaying    = $state<boolean>( false );
	let audioResetTrigger = $state<number>( 0 );

    let animFrameId     : number | null   = null;
	let lastTimestamp   : number | null = null;

	const canEdit         = $derived<boolean>( memoriesStore.canEditMoment( moment ) );
	const canDelete       = $derived<boolean>( memoriesStore.canDeleteMoment( moment ) );
	const hasCustomBg     = $derived<boolean>( Boolean( moment.metadata?.bgColor ) );
	const customBgColor   = $derived<string>( moment.metadata?.bgColor || '#7C3AED' );
	const hexColor        = $derived<string>( customBgColor.length === 7 ? customBgColor : ( customBgColor.startsWith( '#' ) ? customBgColor.slice( 0, 7 ) : '#7C3AED' ) );
	const isDark          = $derived<boolean>( memoriesStore.theme === 'dark' );
	const dialogStyle     = $derived<string>(
		hasCustomBg
			? isDark
				? `border: 1px solid ${ hexColor }55; background: radial-gradient(circle at 50% 0%, ${ hexColor }33 0%, #160B29 75%); box-shadow: 0 25px 60px -15px ${ hexColor }40, 0 0 45px -10px ${ hexColor }30;`
				: `border: 1px solid ${ hexColor }45; background: radial-gradient(circle at 50% 0%, ${ hexColor }20 0%, #ffffff 80%); box-shadow: 0 25px 60px -15px ${ hexColor }30, 0 0 35px -10px ${ hexColor }20;`
			: ''
	);
	const mediaUrl        = $derived<string>(
		( moment.metadata?.url || '' ).trim()
	);
	const isVoiceNote     = $derived<boolean>(
		Boolean( moment.tags?.includes( 'voice note' ) || ( mediaUrl && ( mediaUrl.startsWith( 'data:audio' ) || mediaUrl.endsWith( '.mp3' ) || mediaUrl.endsWith( '.wav' ) || mediaUrl.endsWith( '.ogg' ) || mediaUrl.endsWith( '.webm' ) ) ) )
	);
	const isVideo         = $derived<boolean>(
		Boolean( moment.tags?.includes( 'video' ) || ( !isVoiceNote && ( mediaUrl.includes( 'youtube.com' ) || mediaUrl.includes( 'youtu.be' ) || mediaUrl.endsWith( '.mp4' ) || mediaUrl.endsWith( '.mov' ) ) ) )
	);
	const isImage         = $derived<boolean>(
		Boolean( !isVoiceNote && !isVideo && ( moment.tags?.includes( 'image' ) || mediaUrl ) )
	);

	const defaultDuration = $derived<number>(
		isVoiceNote && moment.metadata?.audioDuration
			? Math.max( 5, Math.ceil( moment.metadata.audioDuration ) )
			: ( isVideo && moment.metadata?.videoDuration ? Math.max( 5, Math.ceil( moment.metadata.videoDuration ) ) : 5 )
	);
	const totalDuration   = $derived<number>( moment.metadata?.timer || defaultDuration );
	const totalDurationMs = $derived<number>( totalDuration * 1000 );

	const currentRemainingMs = $derived<number>(
		remainingMs !== null ? remainingMs : totalDurationMs
	);

	const secondsLeft = $derived<number>(
		Math.max( 0, Math.ceil( currentRemainingMs / 1000 ) )
	);

	const progressPercent = $derived<number>(
		Math.max( 0, Math.min( 100, ( currentRemainingMs / totalDurationMs ) * 100 ) )
	);

	function stepTimer( now: number ): void {
		if ( !open || isDisintegrating || isObscured ) {
			lastTimestamp = null;
			animFrameId = null;
			return;
		}

		if ( lastTimestamp !== null ) {
			const elapsed = now - lastTimestamp;
			const updated = Math.max( 0, ( remainingMs ?? totalDurationMs ) - elapsed );
			remainingMs = updated;

			if ( updated <= 0 ) {
				remainingMs = 0;
				lastTimestamp = null;
				animFrameId = null;
				musicCurrentTime = 0;
				isMusicPlaying = false;
				isMusicManuallyPaused = false;
				onMusicToggle?.( false, false );
				onMusicTimeUpdate?.( 0 );
				audioResetTrigger += 1;
				triggerThanosDissolve();
				return;
			}
		}

		lastTimestamp = now;
		animFrameId = requestAnimationFrame( stepTimer );
	}

	function startTimer(): void {
		if ( animFrameId ) {
			cancelAnimationFrame( animFrameId );
			animFrameId = null;
		}
		lastTimestamp = performance.now();
		animFrameId = requestAnimationFrame( stepTimer );
	}

	function stopTimer(): void {
		if ( animFrameId ) {
			cancelAnimationFrame( animFrameId );
			animFrameId = null;
		}
		lastTimestamp = null;
	}

	function handleMusicTimeUpdate( sec: number ): void {
		musicCurrentTime = sec;
		if ( onMusicTimeUpdate ) {
			onMusicTimeUpdate( sec );
		}
	}

	function handleMusicToggle( playing: boolean, manual = false ): void {
		isMusicPlaying = playing;
		if ( manual ) {
			isMusicManuallyPaused = !playing;
		}
		if ( onMusicToggle ) {
			onMusicToggle( playing, manual );
		}
	}

	function handleResumeFromObscured(): void {
		isObscured = false;
		if ( open && moment.metadata?.is_temporal && currentRemainingMs > 0 ) {
			startTimer();
			if ( moment.metadata?.youtubeVideoId ) {
				handleMusicToggle( true );
			}
		}
	}

	function handleModalWindowBlur(): void {
		if ( !open ) {
			return;
		}
		handleMusicToggle( false );
		if ( moment.metadata?.is_temporal ) {
			isObscured = true;
			stopTimer();
		}
	}

	function handleModalVisibilityChange(): void {
		if ( !open ) {
			return;
		}
		if ( document.hidden ) {
			handleMusicToggle( false );
			if ( moment.metadata?.is_temporal ) {
				isObscured = true;
				stopTimer();
			}
		}
	}

	function handleModalKeyCapture( e: KeyboardEvent ): void {
		if ( !open || !moment.metadata?.is_temporal ) {
			return;
		}

		const isDevToolsKey =
			e.key === 'F12' ||
			( ( e.ctrlKey || e.metaKey ) && e.shiftKey && ( e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c' || e.key === 'J' || e.key === 'j' ) ) ||
			( ( e.ctrlKey || e.metaKey ) && ( e.key === 'u' || e.key === 'U' ) );

		const isCaptureKey =
			e.key === 'PrintScreen' ||
			e.code === 'PrintScreen' ||
			e.keyCode === 44 ||
			( ( e.ctrlKey || e.metaKey ) && ( e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S' ) ) ||
			( e.shiftKey && ( e.metaKey || ( e.ctrlKey && ( e.key === 's' || e.key === 'S' ) ) ) );

		if ( isDevToolsKey || isCaptureKey ) {
			e.preventDefault();
			e.stopPropagation();
			isObscured = true;
			stopTimer();
			handleMusicToggle( false );

			try {
				navigator.clipboard?.writeText( '' );
			} catch {}
		}
	}

	function triggerThanosDissolve(): void {
		isDisintegrating = true;

		setTimeout( () => {
			if ( onRecordView ) {
				onRecordView( moment.id );
			}
			open = false;
			isDisintegrating = false;
			if ( onClose ) {
				onClose();
			}
		}, 850 );
	}

	$effect( () => {
		if ( open ) {
			untrack( () => {
				if ( moment.metadata?.youtubeVideoId && !isMusicManuallyPaused ) {
					handleMusicToggle( true, false );
				}
				if ( moment.metadata?.is_temporal && !isViewed ) {
					if ( remainingMs === null || remainingMs <= 0 ) {
						remainingMs = totalDurationMs;
					}
					isDisintegrating = false;
					isObscured = false;
					startTimer();
				}
			} );
		} else if ( !open ) {
			untrack( () => {
				stopTimer();
				isDisintegrating = false;
				isObscured = false;
				handleMusicToggle( false, false );
			} );
		}
	} );

	$effect( () => {
		if ( typeof window === 'undefined' ) {
			return;
		}

		if ( open && moment.metadata?.is_temporal ) {
			window.addEventListener( 'blur', handleModalWindowBlur );
			document.addEventListener( 'visibilitychange', handleModalVisibilityChange );
			window.addEventListener( 'keydown', handleModalKeyCapture, true );
			window.addEventListener( 'keyup', handleModalKeyCapture, true );

			return () => {
				window.removeEventListener( 'blur', handleModalWindowBlur );
				document.removeEventListener( 'visibilitychange', handleModalVisibilityChange );
				window.removeEventListener( 'keydown', handleModalKeyCapture, true );
				window.removeEventListener( 'keyup', handleModalKeyCapture, true );
			};
		}
	} );

	onDestroy( () => {
		stopTimer();
		if ( typeof window !== 'undefined' ) {
			window.removeEventListener( 'blur', handleModalWindowBlur );
			document.removeEventListener( 'visibilitychange', handleModalVisibilityChange );
			window.removeEventListener( 'keydown', handleModalKeyCapture, true );
			window.removeEventListener( 'keyup', handleModalKeyCapture, true );
		}
	} );

	function handleGlobalKeyDown( e: KeyboardEvent ): void {
		if ( !open ) {
			return;
		}
		if ( e.key === 'Escape' ) {
			e.preventDefault();
			e.stopPropagation();
			handleModalClose();
		}
	}

	$effect( () => {
		if ( typeof window === 'undefined' ) {
			return;
		}

		if ( open ) {
			window.addEventListener( 'keydown', handleGlobalKeyDown, true );
			return () => {
				window.removeEventListener( 'keydown', handleGlobalKeyDown, true );
			};
		}
	} );

	function handleModalClose(): void {
		open = false;
		stopTimer();
		if ( moment.metadata?.is_temporal && remainingMs !== null && remainingMs <= 0 && onRecordView ) {
			onRecordView( moment.id );
		}
		isDisintegrating = false;
		isObscured = false;
		handleMusicToggle( false, false );
		if ( onClose ) {
			onClose();
		}
	}

	function getTagBadge( tag: MomentTag ): { label: string; icon: Component; colorClass: string } {
		switch ( tag ) {
			case 'image':
				return {
					label      : 'Foto',
					icon       : ImageIcon as Component,
					colorClass : 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/25'
				};
			case 'video':
				return {
					label      : 'Video',
					icon       : VideoIcon as Component,
					colorClass : 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/25'
				};
			case 'text':
				return {
					label      : 'Texto',
					icon       : FileText as Component,
					colorClass : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
				};
			case 'quote':
				return {
					label      : 'Dedicatoria',
					icon       : QuoteIcon as Component,
					colorClass : 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25'
				};
			case 'voice note':
				return {
					label      : 'Nota de Voz',
					icon       : Headphones as Component,
					colorClass : 'text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/25'
				};
			default:
				return {
					label      : 'Recuerdo',
					icon       : Heart as Component,
					colorClass : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/25'
				};
		}
	}
</script>

<Dialog
	bind:open={ open }
	maxWidth="max-w-4xl"
	contentClass="p-5 sm:p-7"
	contentStyle={ dialogStyle }
	showCloseButton={ false }
	onClose={ handleModalClose }
>
	<!-- Contenedor Principal del Momento en Pantalla Completa -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="relative transition-all duration-700 select-none { isDisintegrating ? 'thanos-snap' : '' }"
		oncontextmenu={ ( e ) => { if ( moment.metadata?.is_temporal ) e.preventDefault(); } }
	>
		<!-- Escudo de Privacidad Activo Anti-Captura / Anti-Inspección -->
		{#if isObscured}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				onclick={ handleResumeFromObscured }
				class="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-white/95 dark:bg-stone-950/98 backdrop-blur-3xl text-center text-stone-900 dark:text-white cursor-pointer select-none space-y-2 rounded-2xl"
			>
				<div class="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center border border-amber-500/30 animate-pulse shadow-xl">
					<EyeOff size={ 26 } />
				</div>
				<div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-300 text-[10px] font-extrabold uppercase tracking-widest border border-rose-500/25">
					<span>Captura Bloqueada</span>
				</div>
				<h4 class="text-base font-extrabold text-stone-900 dark:text-white">Protección de Privacidad Activa</h4>
				<p class="text-xs text-stone-500 dark:text-stone-400 max-w-sm leading-relaxed">
					Por seguridad, este contenido confidencial se oculta automáticamente al detectar intentos de captura o pérdida de foco.
				</p>
				<span class="text-xs text-amber-600 dark:text-amber-400/80 font-semibold underline underline-offset-2">
					Haz clic para continuar viendo
				</span>
			</div>
		{/if}

		<!-- Barra de Cuenta Regresiva de Mecha en la parte superior si es efímero -->
		{#if moment.metadata?.is_temporal && secondsLeft > 0}
			<div class="mb-4">
				<MomentCountdownProgress
					{secondsLeft}
					{progressPercent}
				/>
			</div>
		{/if}

		<!-- Cabecera de Autor, Fecha, Tags y Botón Cerrar (X) -->
		<div
			class="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b transition-colors { hasCustomBg ? '' : 'border-stone-100 dark:border-white/5' }"
			style={ hasCustomBg ? `border-color: ${ hexColor }33;` : '' }
		>
			<div class="flex items-center gap-3">
				<div
					class="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md text-sm shrink-0"
					style="background: linear-gradient(135deg, { relationColor }, { relationColor }cc);"
				>
					{ moment.author.charAt( 0 ).toUpperCase() }
				</div>
				<div>
					<div class="flex items-center gap-2">
						<span class="font-extrabold text-sm text-stone-900 dark:text-white">
							{ moment.author }
						</span>
						{#if moment.capture_date}
							<span class="inline-flex items-center gap-1 text-xs text-stone-400">
								<Calendar size={ 12 } />
								<span>{ formatCaptureDate( moment.capture_date ) }</span>
							</span>
						{/if}
					</div>
				</div>
			</div>

			<!-- Tags con Colores Semánticos, Música de Fondo y Botón Cerrar (X) -->
			<div class="flex items-center gap-2 shrink-0">
				<div class="flex flex-wrap items-center gap-1.5">
					{#if open && moment.metadata?.youtubeVideoId}
						<YouTubeBackgroundPlayer
							videoId={ moment.metadata.youtubeVideoId }
							controllerOnly={ true }
							isPlaying={ isMusicPlaying && !isDisintegrating && !isObscured && ( !moment.metadata?.is_temporal || secondsLeft > 0 ) }
							initialTime={ musicCurrentTime }
							bind:userVolume={ musicVolume }
							{isVoicePlaying}
							{relationColor}
							onTimeUpdate={ handleMusicTimeUpdate }
							onTogglePlay={ ( playing: boolean ) => handleMusicToggle( playing, true ) }
						/>
					{/if}

					{#each moment.tags as tag}
						{@const badge = getTagBadge( tag )}
						{@const TagIcon = badge.icon}
						<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs { badge.colorClass }">
							<TagIcon size={ 12 } />
							<span>{ badge.label }</span>
						</span>
					{/each}

					{#if moment.metadata?.is_temporal}
						<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/25 shadow-2xs">
							<Flame size={ 12 } />
							<span>Efímero</span>
						</span>
					{/if}
				</div>

				<!-- Botón de Cerrar (X) al lado derecho de los tags -->
				<Tooltip text="Cerrar (Esc)" side="bottom" sideOffset={ 6 }>
					<button
						type="button"
						onclick={ handleModalClose }
						class="size-8 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/5 border border-stone-200/50 dark:border-white/10 transition-all active:scale-90 cursor-pointer shrink-0 shadow-2xs ml-1"
						aria-label="Cerrar modal (Esc)"
					>
						<X size={ 16 } />
					</button>
				</Tooltip>
			</div>
		</div>

		<!-- Nota de Voz de Audio -->
		{#if isVoiceNote && mediaUrl}
			<div class="mb-5">
				<AudioPlayer
					src={ mediaUrl }
					title={ moment.title || 'Nota de Voz' }
					duration={ moment.metadata?.audioDuration || 0 }
					{relationColor}
					isExternalPaused={ isDisintegrating || isObscured || ( moment.metadata?.is_temporal && secondsLeft <= 0 ) }
					resetTrigger={ audioResetTrigger }
					onPlayStateChange={ ( isPlaying: boolean ) => ( isVoicePlaying = isPlaying ) }
				/>
			</div>
		{/if}

		<!-- Área Visual Multimedia / Texto -->
		{#if isImage && mediaUrl}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="w-full max-h-[65vh] flex items-center justify-center rounded-2xl overflow-hidden bg-stone-950/80 dark:bg-black/80 relative shadow-2xl mb-5 select-none"
				style={ hasCustomBg ? `border: 1px solid ${ hexColor }30;` : '' }
				oncontextmenu={ ( e ) => { if ( moment.metadata?.is_temporal ) e.preventDefault(); } }
			>
				{#if moment.metadata?.is_temporal}
					<SecureEphemeralMedia
						imageUrl={ mediaUrl }
						alt={ moment.title || 'Foto de recuerdo' }
						isEphemeral={ true }
						isObscured={ isObscured }
						fit="contain"
						watermarkText={`${ memoriesStore.currentUser.name } • Confidencial`}
					/>
				{:else}
					<img
						src={ mediaUrl }
						alt={ moment.title || 'Foto de recuerdo' }
						class="max-h-[65vh] w-auto max-w-full object-contain rounded-2xl"
					/>
				{/if}
			</div>
		{:else if isVideo && mediaUrl}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="w-full max-h-[65vh] flex items-center justify-center rounded-2xl overflow-hidden bg-black relative shadow-2xl mb-5 select-none"
				style={ hasCustomBg ? `border: 1px solid ${ hexColor }30;` : '' }
				oncontextmenu={ ( e ) => { if ( moment.metadata?.is_temporal ) e.preventDefault(); } }
			>
				{#if moment.metadata?.is_temporal}
					<SecureEphemeralMedia
						videoUrl={ mediaUrl }
						alt={ moment.title || 'Video de recuerdo' }
						isEphemeral={ true }
						isObscured={ isObscured }
						fit="contain"
						watermarkText={`${ memoriesStore.currentUser.name } • Confidencial`}
					/>
				{:else}
					<!-- svelte-ignore a11y_media_has_caption -->
					<video
						src={ mediaUrl }
						controls
						autoplay
						class="max-h-[65vh] w-auto max-w-full object-contain rounded-2xl"
						playsinline
						loop={ true }
					></video>
				{/if}
			</div>
		{/if}

		<!-- Información Textual: Título y Contenido -->
		<div class="space-y-3 px-1 { moment.metadata?.is_temporal ? 'select-none' : '' }">
			{#if moment.title}
				<h3
					class="text-xl sm:text-2xl font-black tracking-tight"
					style="color: { relationColor };"
				>
					{ moment.title }
				</h3>
			{/if}

			{#if moment.content}
				<div class="rounded-2xl { moment.tags.includes( 'quote' ) ? 'p-5 bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/20' : '' }">
					<p class="text-stone-700 dark:text-stone-200 leading-relaxed { moment.tags.includes( 'quote' ) ? 'italic font-serif text-base sm:text-lg border-l-4 border-amber-500 pl-3.5' : 'text-sm sm:text-base font-normal' }">
						{ moment.content }
					</p>
				</div>
			{/if}
		</div>

		<!-- Pie del Diálogo con Acciones -->
		<div
			class="flex items-center justify-between pt-5 mt-6 border-t transition-colors { hasCustomBg ? '' : 'border-stone-100 dark:border-white/5' }"
			style={ hasCustomBg ? `border-color: ${ hexColor }33;` : '' }
		>
			<span class="text-xs text-stone-400 font-medium">
				Identificador: { moment.id }
			</span>

			<div class="flex items-center gap-2">
				{#if canEdit && onEdit}
					<Tooltip text="Editar momento">
						<button
							type="button"
							onclick={ () => {
								open = false;
								onEdit && onEdit( moment );
							} }
							class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-white/5 hover:bg-amber-500/15 text-stone-700 dark:text-stone-200 hover:text-amber-500 border border-stone-200/70 dark:border-white/10 transition-all cursor-pointer shadow-xs active:scale-95"
						>
							<Edit3 size={ 14 } />
							<span>Editar</span>
						</button>
					</Tooltip>
				{/if}

				{#if canDelete && onDelete}
					<Tooltip text="Eliminar momento">
						<button
							type="button"
							onclick={ () => {
								open = false;
								onDelete && onDelete( moment.id );
							} }
							class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-white/5 hover:bg-rose-500/15 text-stone-700 dark:text-stone-200 hover:text-rose-500 border border-stone-200/70 dark:border-white/10 transition-all cursor-pointer shadow-xs active:scale-95"
						>
							<Trash2 size={ 14 } />
							<span>Eliminar</span>
						</button>
					</Tooltip>
				{/if}
			</div>
		</div>
	</div>
</Dialog>

<style>
	/* Animación tipo 'Chasquido de Thanos': Desvanecimiento con desenfoque, escala y dispersión de partículas */
	.thanos-snap {
		animation: thanosSnapAnimation 0.85s cubic-bezier(0.25, 1, 0.5, 1) forwards;
		pointer-events: none;
	}

	@keyframes thanosSnapAnimation {
		0% {
			opacity: 1;
			filter: blur(0px) brightness(1);
			transform: scale(1) translateY(0);
		}
		35% {
			opacity: 0.85;
			filter: blur(3px) brightness(1.25);
			transform: scale(0.98) translateY(-4px) skewX(0.5deg);
		}
		70% {
			opacity: 0.35;
			filter: blur(9px) brightness(1.5) contrast(0.7);
			transform: scale(0.94) translateY(-14px) skewX(1.5deg);
		}
		100% {
			opacity: 0;
			filter: blur(18px) brightness(1.8) contrast(0.4);
			transform: scale(0.9) translateY(-25px) skewX(3deg);
		}
	}
</style>

