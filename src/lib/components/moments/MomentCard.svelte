<script lang="ts">
	import { onDestroy }        from 'svelte';
	import type { Component }   from 'svelte';

	import {
		Trash2,
		Heart,
		Quote as QuoteIcon,
		Image as ImageIcon,
		Video as VideoIcon,
		FileText,
		Lock,
		Clock,
		Flame,
		Calendar,
		User as UserIcon,
		Edit3,
		RotateCcw,
		EyeOff,
		Maximize2,
		Share2,
		Headphones,
		Hourglass,
		Sparkles
	} from '@lucide/svelte';

	import type {
		MomentEntity,
		MomentTag
	}                               from '$lib/types';
	import MomentEphemeralCover     from './MomentEphemeralCover.svelte';
	import SecureEphemeralMedia     from './SecureEphemeralMedia.svelte';
	import MomentCountdownProgress  from './MomentCountdownProgress.svelte';
	import MomentDetailModal        from './MomentDetailModal.svelte';
	import ShareMomentModal         from './ShareMomentModal.svelte';
	import AudioPlayer              from './AudioPlayer.svelte';
	import YouTubeBackgroundPlayer  from './YouTubeBackgroundPlayer.svelte';
	import Tooltip                  from '$lib/components/shared/Tooltip.svelte';
	import { formatCaptureDate }    from '$lib/utils/date';
	import { memoriesStore }        from '$lib/store.svelte';

	interface Props {
		moment         : MomentEntity;
		currentUserId  : string;
		relationColor ?: string;
		relationPath  ?: string;
		isViewed      ?: boolean;
		onDelete      ?: ( id: string ) => void;
		onEdit        ?: ( moment: MomentEntity ) => void;
		onUnlock      ?: ( moment: MomentEntity ) => void;
		onRecordView  ?: ( momentId: string ) => void;
	}

	let {
		moment,
		currentUserId,
		relationColor = '#f43f5e',
		relationPath = 'pareja',
		isViewed = false,
		onDelete,
		onEdit,
		onUnlock,
		onRecordView
	}: Props = $props();

	interface MomentCardState {
		isManuallyUnlocked    : boolean;
		isEphemeralRevealed   : boolean;
		isHolding             : boolean;
		isLocalReplayActive   : boolean;
		remainingMs           : number | null;
		isObscured            : boolean;
		isViewerOpen          : boolean;
		passwordSecondsLeft   : number | undefined;
		isVoicePlaying        : boolean;
		backgroundMusicSec    : number;
		musicVolume           : number;
		isMusicPlaying        : boolean;
		isMusicManuallyPaused : boolean;
		audioResetTrigger     : number;
		audioAutoplayTrigger  : number;
		nowTime               : number;
	}

	let cardState: MomentCardState = $state( {
		isManuallyUnlocked    : false,
		isEphemeralRevealed   : false,
		isHolding             : false,
		isLocalReplayActive   : false,
		remainingMs           : null,
		isObscured            : false,
		isViewerOpen          : false,
		passwordSecondsLeft   : undefined,
		isVoicePlaying        : false,
		backgroundMusicSec    : 0,
		musicVolume           : 60,
		isMusicPlaying        : false,
		isMusicManuallyPaused : false,
		audioResetTrigger     : 0,
		audioAutoplayTrigger  : 0,
		nowTime               : Date.now()
	} );

	let animFrameId: number | null = null;
	let lastTimestamp: number | null = null;
	let passwordTimerInterval: ReturnType<typeof setInterval> | null = null;
	let lastViewerOpen = $state<boolean>( false );
	let cardContainerEl = $state<HTMLDivElement | null>( null );
	let isShareOpen = $state<boolean>( false );

	const isFutureLocked = $derived<boolean>(
		Boolean( moment.metadata?.unlock_at && new Date() < new Date( moment.metadata.unlock_at ) )
	);

	const futureSecondsLeft = $derived<number>(
		moment.metadata?.unlock_at
			? Math.max( 0, Math.floor( ( new Date( moment.metadata.unlock_at ).getTime() - cardState.nowTime ) / 1000 ) )
			: 0
	);

	$effect( () => {
		if ( isFutureLocked ) {
			const interval = setInterval( () => {
				cardState.nowTime = Date.now();
			}, 1000 );
			return () => clearInterval( interval );
		}
	} );

	// Cuando se cierra el modal con tiempo restante, pausar efímero y música en la tarjeta hasta nuevo hover/foco
	$effect( () => {
		if ( lastViewerOpen && !cardState.isViewerOpen ) {
			lastViewerOpen = false;
			if ( moment.metadata?.is_temporal && secondsLeft > 0 ) {
				cardState.isEphemeralRevealed = false;
				cardState.isMusicPlaying = false;
				stopTimer();
			}
		} else if ( cardState.isViewerOpen ) {
			lastViewerOpen = true;
		}
	} );

	let hasCheckedUrlDeepLink = $state<boolean>( false );

	// Apertura automática inicial si la URL contiene el parámetro ?moment=ID
	$effect( () => {
		if ( typeof window === 'undefined' || hasCheckedUrlDeepLink ) {
			return;
		}

		hasCheckedUrlDeepLink = true;
		const currentUrl = new URL( window.location.href );
		const currentMomentParam = currentUrl.searchParams.get( 'moment' );

		// Si la URL contiene el ID de este momento y no está abierto, abrirlo
		if ( currentMomentParam === moment.id && !cardState.isViewerOpen ) {
			if ( moment.metadata?.password && !isUnlocked ) {
				handleUnlockRequest();
			} else if ( isPlaybackAllowed || !effectiveIsViewed ) {
				handleOpenViewer();
			}
		}
	} );

	// Sincronización del parámetro en la URL al abrir o cerrar el visor
	$effect( () => {
		if ( typeof window === 'undefined' ) {
			return;
		}

		const isOpen = cardState.isViewerOpen;
		const currentUrl = new URL( window.location.href );
		const currentMomentParam = currentUrl.searchParams.get( 'moment' );

		if ( isOpen ) {
			if ( currentMomentParam !== moment.id ) {
				currentUrl.searchParams.set( 'moment', moment.id );
				window.history.replaceState( window.history.state, '', currentUrl.toString() );
			}
		} else {
			if ( currentMomentParam === moment.id ) {
				currentUrl.searchParams.delete( 'moment' );
				window.history.replaceState( window.history.state, '', currentUrl.toString() );
			}
		}
	} );

	function formatUnlockDate( isoStr: string ): string {
		try {
			const d = new Date( isoStr );
			return d.toLocaleString( 'es-ES', {
				day    : 'numeric',
				month  : 'short',
				year   : 'numeric',
				hour   : '2-digit',
				minute : '2-digit'
			} );
		} catch {
			return isoStr;
		}
	}

	function formatFutureCountdown( totalSecs: number ): string {
		const days = Math.floor( totalSecs / 86400 );
		const hours = Math.floor( ( totalSecs % 86400 ) / 3600 );
		const mins = Math.floor( ( totalSecs % 3600 ) / 60 );
		const secs = totalSecs % 60;
		if ( days > 0 ) {
			return `${ days }d ${ hours }h ${ mins }m`;
		}
		if ( hours > 0 ) {
			return `${ hours }h ${ mins }m ${ secs }s`;
		}
		return `${ mins }m ${ secs }s`;
	}

	const isUnlocked = $derived<boolean>(
		!moment.metadata?.password || cardState.isManuallyUnlocked || memoriesStore.isMomentUnlocked( moment.id )
	);
	const isCreator = $derived<boolean>( Boolean( moment.created_by && moment.created_by === currentUserId ) );
	const isSuperAdmin = $derived<boolean>( memoriesStore.currentUser.role === 'super_admin' );
	const canEdit = $derived<boolean>( memoriesStore.canEditMoment( moment ) );
	const canDelete = $derived<boolean>( memoriesStore.canDeleteMoment( moment ) );
	const canReplay = $derived<boolean>( Boolean( moment.metadata?.is_temporal && isSuperAdmin ) );
	const hasCustomBg = $derived<boolean>( Boolean( moment.metadata?.bgColor ) );
	const customBgColor = $derived<string>( moment.metadata?.bgColor || '#7C3AED' );
	const mediaUrl = $derived<string>(
		( moment.metadata?.url || '' ).trim()
	);
	const isVoiceNote = $derived<boolean>(
		Boolean( moment.tags?.includes( 'voice note' ) || ( mediaUrl && ( mediaUrl.startsWith( 'data:audio' ) || mediaUrl.endsWith( '.mp3' ) || mediaUrl.endsWith( '.wav' ) || mediaUrl.endsWith( '.ogg' ) || mediaUrl.endsWith( '.webm' ) ) ) )
	);
	const isVideo = $derived<boolean>(
		Boolean( moment.tags?.includes( 'video' ) || ( !isVoiceNote && ( mediaUrl.includes( 'youtube.com' ) || mediaUrl.includes( 'youtu.be' ) || mediaUrl.endsWith( '.mp4' ) || mediaUrl.endsWith( '.mov' ) ) ) )
	);
	const isImage = $derived<boolean>(
		Boolean( !isVoiceNote && !isVideo && ( moment.tags?.includes( 'image' ) || mediaUrl ) )
	);
	const hasMedia = $derived<boolean>( Boolean( mediaUrl && ( isImage || isVideo ) ) );
	const defaultDuration = $derived<number>(
		isVoiceNote && moment.metadata?.audioDuration
			? Math.max( 5, Math.ceil( moment.metadata.audioDuration ) )
			: ( isVideo && moment.metadata?.videoDuration ? Math.max( 5, Math.ceil( moment.metadata.videoDuration ) ) : 5 )
	);
	const totalDuration = $derived<number>( moment.metadata?.timer || defaultDuration );
	const totalDurationMs = $derived<number>( totalDuration * 1000 );
	const currentRemainingMs = $derived<number>(
		cardState.remainingMs !== null ? cardState.remainingMs : totalDurationMs
	);
	const secondsLeft = $derived<number>( Math.max( 0, Math.ceil( currentRemainingMs / 1000 ) ) );
	const progressPercent = $derived<number>(
		Math.max( 0, Math.min( 100, ( currentRemainingMs / totalDurationMs ) * 100 ) )
	);
	const effectiveIsViewed = $derived<boolean>(
		cardState.isLocalReplayActive ? false : Boolean( isViewed || ( moment.id && memoriesStore.isMomentViewed( moment.id, currentUserId ) ) || ( cardState.remainingMs !== null && cardState.remainingMs <= 0 ) )
	);

	const shouldShowEphemeralCover = $derived<boolean>(
		Boolean(
			moment.metadata?.is_temporal &&
			( effectiveIsViewed || !cardState.isEphemeralRevealed )
		)
	);

	const isPlaybackAllowed = $derived<boolean>(
		isUnlocked &&
		!cardState.isObscured &&
		(
			cardState.isViewerOpen
				? ( !moment.metadata?.is_temporal || ( cardState.remainingMs === null || cardState.remainingMs > 0 ) )
				: ( !shouldShowEphemeralCover && !effectiveIsViewed )
		)
	);

	function stopAndResetAllAudio(): void {
		cardState.isMusicPlaying = false;
		cardState.backgroundMusicSec = 0;
		cardState.isVoicePlaying = false;
		cardState.isMusicManuallyPaused = false;
		cardState.audioResetTrigger += 1;
	}

	function stepTimer( now: number ): void {
		if ( !cardState.isEphemeralRevealed || cardState.isObscured ) {
			lastTimestamp = null;
			animFrameId = null;
			return;
		}

		if ( lastTimestamp !== null ) {
			const elapsed = now - lastTimestamp;
			const updated = Math.max( 0, ( cardState.remainingMs ?? totalDurationMs ) - elapsed );
			cardState.remainingMs = updated;

			if ( updated <= 0 ) {
				cardState.remainingMs = 0;
				cardState.isEphemeralRevealed = false;
				cardState.isLocalReplayActive = false;
				lastTimestamp = null;
				animFrameId = null;
				stopAndResetAllAudio();
				if ( onRecordView ) {
					onRecordView( moment.id );
				}
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

	function startPasswordTimer(): void {
		if ( !moment.metadata?.timer || passwordTimerInterval ) {
			return;
		}

		cardState.passwordSecondsLeft = moment.metadata.timer;
		passwordTimerInterval = setInterval( () => {
			if ( cardState.passwordSecondsLeft && cardState.passwordSecondsLeft > 1 ) {
				cardState.passwordSecondsLeft -= 1;
			} else {
				if ( passwordTimerInterval ) {
					clearInterval( passwordTimerInterval );
					passwordTimerInterval = null;
				}
				cardState.isManuallyUnlocked = false;
				memoriesStore.lockMoment( moment.id );
				cardState.passwordSecondsLeft = 0;
				stopAndResetAllAudio();
			}
		}, 1000 );
	}

	function handleStartEphemeralView(): void {
		if ( cardState.isObscured || currentRemainingMs <= 0 || effectiveIsViewed ) {
			return;
		}

		if ( cardState.remainingMs === null ) {
			cardState.remainingMs = totalDurationMs;
		}

		cardState.isEphemeralRevealed = true;

		if ( !cardState.isMusicManuallyPaused && moment.metadata?.youtubeVideoId ) {
			cardState.isMusicPlaying = true;
		}

		startTimer();
	}

	function handlePauseEphemeralView(): void {
		if ( !moment.metadata?.is_temporal || effectiveIsViewed || cardState.isViewerOpen ) {
			return;
		}

		if ( !cardState.isEphemeralRevealed ) {
			return;
		}

		cardState.isEphemeralRevealed = false;
		cardState.isMusicPlaying = false;
		stopTimer();
	}

	function handleResumeEphemeralView(): void {
		if ( !moment.metadata?.is_temporal || effectiveIsViewed || cardState.isViewerOpen || cardState.isObscured ) {
			return;
		}

		if ( cardState.remainingMs === null ) {
			cardState.remainingMs = totalDurationMs;
		}

		if ( cardState.remainingMs > 0 ) {
			cardState.isEphemeralRevealed = true;
			startTimer();

			if ( !cardState.isMusicManuallyPaused && moment.metadata?.youtubeVideoId ) {
				cardState.isMusicPlaying = true;
			}
		}
	}

	function handleSuperAdminReplay(): void {
		if ( !isSuperAdmin ) {
			return;
		}

		memoriesStore.resetMomentViewForUser( moment.id, currentUserId );
		cardState.isLocalReplayActive = true;
		cardState.remainingMs = totalDurationMs;
		cardState.isObscured = false;
		cardState.isEphemeralRevealed = true;

		stopAndResetAllAudio();

		cardState.isMusicManuallyPaused = false;
		if ( moment.metadata?.youtubeVideoId ) {
			cardState.isMusicPlaying = true;
		}

		if ( isVoiceNote ) {
			cardState.audioAutoplayTrigger += 1;
		}

		startTimer();
	}

	function handleResumeFromObscured(): void {
		cardState.isObscured = false;
		if ( cardState.remainingMs !== null && cardState.remainingMs > 0 ) {
			handleResumeEphemeralView();
		}
	}

	function handleCardWindowBlur(): void {
		if ( cardState.isViewerOpen ) {
			return;
		}
		if ( moment.metadata?.is_temporal && cardState.isEphemeralRevealed ) {
			handlePauseEphemeralView();
		} else {
			cardState.isMusicPlaying = false;
		}
	}

	function handleDocumentPointerDown( e: PointerEvent ): void {
		if ( cardState.isViewerOpen || !cardState.isEphemeralRevealed || !moment.metadata?.is_temporal || effectiveIsViewed ) {
			return;
		}
		const target = e.target as HTMLElement | null;
		if ( cardContainerEl && target && !cardContainerEl.contains( target ) ) {
			handlePauseEphemeralView();
		}
	}

	function handleCardVisibilityChange(): void {
		if ( document.hidden ) {
			if ( cardState.isViewerOpen ) {
				return;
			}
			if ( moment.metadata?.is_temporal && cardState.isEphemeralRevealed ) {
				handlePauseEphemeralView();
			} else {
				cardState.isMusicPlaying = false;
			}
		}
	}

	function handleCardKeyCapture( e: KeyboardEvent ): void {
		if ( !moment.metadata?.is_temporal || cardState.isViewerOpen ) {
			return;
		}

		if ( !cardState.isEphemeralRevealed && !cardState.isLocalReplayActive ) {
			return;
		}

		const target = e.target as HTMLElement | null;
		if ( target && ( target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable ) ) {
			return;
		}

		const isDevToolsKey =
			e.key === 'F12' ||
			( ( e.ctrlKey || e.metaKey ) && e.shiftKey && ( e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c' || e.key === 'J' || e.key === 'j' ) ) ||
			( ( e.ctrlKey || e.metaKey ) && ( e.key === 'u' || e.key === 'U' ) );

		const isCaptureOrModifierKey =
			isDevToolsKey ||
			e.key === 'PrintScreen' ||
			e.code === 'PrintScreen' ||
			e.keyCode === 44 ||
			( ( e.ctrlKey || e.metaKey ) && ( e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S' ) ) ||
			( e.shiftKey && ( e.metaKey || ( e.ctrlKey && ( e.key === 's' || e.key === 'S' ) ) ) );

		if ( isCaptureOrModifierKey ) {
			if ( isDevToolsKey ) {
				e.preventDefault();
				e.stopPropagation();
			}
			cardState.isObscured = true;
			stopTimer();
			cardState.isMusicPlaying = false;

			try {
				navigator.clipboard?.writeText( '' );
			} catch {}
		}
	}

	$effect( () => {
		if ( !moment.metadata?.is_temporal && isUnlocked && moment.metadata?.timer && !passwordTimerInterval && cardState.passwordSecondsLeft === undefined ) {
			startPasswordTimer();
		}
	} );

	$effect( () => {
		if ( typeof window === 'undefined' ) {
			return;
		}

		if ( moment.metadata?.is_temporal && !effectiveIsViewed ) {
			window.addEventListener( 'blur', handleCardWindowBlur );
			window.addEventListener( 'pointerdown', handleDocumentPointerDown );
			document.addEventListener( 'visibilitychange', handleCardVisibilityChange );
			window.addEventListener( 'keydown', handleCardKeyCapture );
			window.addEventListener( 'keyup', handleCardKeyCapture );

			return () => {
				window.removeEventListener( 'blur', handleCardWindowBlur );
				window.removeEventListener( 'pointerdown', handleDocumentPointerDown );
				document.removeEventListener( 'visibilitychange', handleCardVisibilityChange );
				window.removeEventListener( 'keydown', handleCardKeyCapture );
				window.removeEventListener( 'keyup', handleCardKeyCapture );
			};
		}
	} );

	onDestroy( () => {
		stopTimer();
		if ( passwordTimerInterval ) {
			clearInterval( passwordTimerInterval );
		}
		if ( typeof window !== 'undefined' ) {
			window.removeEventListener( 'blur', handleCardWindowBlur );
			window.removeEventListener( 'pointerdown', handleDocumentPointerDown );
			document.removeEventListener( 'visibilitychange', handleCardVisibilityChange );
			window.removeEventListener( 'keydown', handleCardKeyCapture );
			window.removeEventListener( 'keyup', handleCardKeyCapture );
		}
	} );

	function handleUnlockRequest(): void {
		if ( onUnlock ) {
			onUnlock( moment );
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

	function handleOpenViewer( e?: MouseEvent ): void {
		if ( e ) {
			e.stopPropagation();
		}
		if ( isFutureLocked ) {
			return;
		}
		if ( moment.metadata?.password && !isUnlocked ) {
			handleUnlockRequest();
			return;
		}
		cardState.isObscured = false;
		if ( moment.metadata?.is_temporal ) {
			stopTimer();
			if ( cardState.remainingMs === null ) {
				cardState.remainingMs = totalDurationMs;
			}
		}
		if ( moment.metadata?.youtubeVideoId && !cardState.isMusicManuallyPaused ) {
			cardState.isMusicPlaying = true;
		}
		cardState.isViewerOpen = true;
	}

	function handleCardContentClick( e: MouseEvent ): void {
		if ( cardState.isObscured || shouldShowEphemeralCover || isFutureLocked ) {
			return;
		}
		if ( moment.metadata?.password && !isUnlocked ) {
			handleUnlockRequest();
			return;
		}
		const target = e.target as HTMLElement;
		if ( target.closest( 'button' ) || target.closest( 'video' ) || target.closest( 'audio' ) || target.closest( 'input' ) ) {
			return;
		}
		cardState.isObscured = false;
		cardState.isViewerOpen = true;
	}

	function handleCardMouseEnter(): void {
		if ( cardState.isViewerOpen ) {
			return;
		}
		if ( moment.metadata?.is_temporal ) {
			if ( cardState.remainingMs !== null && cardState.remainingMs > 0 && !effectiveIsViewed ) {
				handleResumeEphemeralView();
			}
		} else if (
			!cardState.isMusicManuallyPaused &&
			!shouldShowEphemeralCover &&
			!effectiveIsViewed &&
			isUnlocked &&
			moment.metadata?.youtubeVideoId
		) {
			cardState.isMusicPlaying = true;
		}
	}

	function handleCardMouseLeave(): void {
		if ( cardState.isViewerOpen ) {
			return;
		}
		if ( moment.metadata?.is_temporal ) {
			if ( cardState.isEphemeralRevealed && !effectiveIsViewed ) {
				handlePauseEphemeralView();
			}
		} else {
			cardState.isMusicPlaying = false;
		}
	}

	function handleMusicToggle( playing: boolean, manual = true ): void {
		cardState.isMusicPlaying = playing;
		if ( manual ) {
			cardState.isMusicManuallyPaused = !playing;
		}
	}

	function handleOpenShare( e?: MouseEvent ): void {
		if ( e ) {
			e.stopPropagation();
		}
		isShareOpen = true;
	}

	function handleCloseViewer(): void {
		cardState.isViewerOpen = false;
		if ( typeof window !== 'undefined' ) {
			const currentUrl = new URL( window.location.href );
			if ( currentUrl.searchParams.get( 'moment' ) === moment.id ) {
				currentUrl.searchParams.delete( 'moment' );
				window.history.replaceState( window.history.state, '', currentUrl.toString() );
			}
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={ cardContainerEl }
	onmouseenter={ handleCardMouseEnter }
	onmouseleave={ handleCardMouseLeave }
	oncontextmenu={ ( e ) => { if ( moment.metadata?.is_temporal ) e.preventDefault(); } }
	class="group relative flex flex-col justify-between rounded-3xl overflow-hidden transition-all duration-500 backdrop-blur-md shadow-lg hover:shadow-2xl min-h-72.5 w-full select-none { hasCustomBg ? 'bg-white/75 dark:bg-dark-card/75' : 'bg-white/70 dark:bg-dark-card/70 border border-stone-200/60 dark:border-white/10' }"
	style={ hasCustomBg ? `border: 1px solid ${ customBgColor }40; box-shadow: 0 10px 30px -10px ${ customBgColor }33;` : '' }
>
	{#if hasCustomBg}
		<!-- Capa translúcida con tinte suave (12% opacidad) -->
		<div
			class="absolute inset-0 pointer-events-none transition-colors duration-500"
			style="background: linear-gradient(135deg, { customBgColor }24 0%, { customBgColor }0d 100%);"
		></div>

		<!-- Resplandor ambiental suave (Ambient Glow) -->
		<div
			class="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none opacity-30 dark:opacity-40 blur-3xl transition-transform duration-700 group-hover:scale-125"
			style="background-color: { customBgColor };"
		></div>
		<div
			class="absolute -bottom-16 -left-16 w-40 h-40 rounded-full pointer-events-none opacity-20 dark:opacity-30 blur-3xl transition-transform duration-700"
			style="background-color: { customBgColor };"
		></div>
	{/if}

	<!-- Botón interno de Volver a Ver (Solo Super Admin) -->
	{#if canReplay}
		<div class="absolute top-2.5 left-2.5 z-20 { cardState.isViewerOpen ? 'pointer-events-none opacity-0' : '' }">
			<Tooltip text="Volver a ver momento efímero (Super Admin)" side="bottom" sideOffset={ 6 }>
				<button
					type="button"
					onclick={ ( e ) => {
						e.stopPropagation();
						handleSuperAdminReplay();
					} }
					class="size-7 rounded-xl flex items-center justify-center bg-amber-500/85 hover:bg-amber-500 text-stone-950 backdrop-blur-md border border-amber-300/40 shadow-lg transition-all active:scale-90 cursor-pointer"
					aria-label="Volver a ver momento efímero (Super Admin)"
				>
					<RotateCcw size={ 13 } />
				</button>
			</Tooltip>
		</div>
	{/if}

	<!-- Cubierta Cápsula del Tiempo (Desbloqueo a Futuro) -->
	{#if isFutureLocked}
		<div class="absolute inset-0 z-25 flex flex-col items-center justify-center p-6 text-center backdrop-blur-2xl bg-stone-900/90 text-white select-none space-y-3 overflow-hidden">
			<!-- Resplandor ambiental de cápsula -->
			<div
				class="absolute -top-12 -left-12 w-44 h-44 rounded-full opacity-30 blur-3xl pointer-events-none animate-pulse"
				style="background: { relationColor };"
			></div>

			<div
				class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl breathing-lock"
				style="background: linear-gradient(135deg, { relationColor }, { relationColor }cc); box-shadow: 0 10px 25px -5px { relationColor }66;"
			>
				<Hourglass size={ 26 } class="text-white" />
			</div>

			<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/10 text-white border border-white/15 uppercase tracking-wider backdrop-blur-sm">
				<Sparkles size={ 12 } class="text-amber-300" />
				<span>Cápsula del Tiempo</span>
			</div>

			<h4 class="text-sm font-extrabold text-white">Momento Programado</h4>
			<p class="text-xs text-stone-300 max-w-xs leading-relaxed">
				Este momento fue sellado y se revelará el <span class="font-bold text-white">{ formatUnlockDate( moment.metadata?.unlock_at || '' ) }</span>.
			</p>

			<div class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/50 border border-white/15 font-mono text-xs font-bold text-amber-300 shadow-inner">
				<Clock size={ 14 } class="animate-pulse text-amber-300" />
				<span>Abre en: { formatFutureCountdown( futureSecondsLeft ) }</span>
			</div>
		</div>
	{/if}

	<!-- Música de fondo de YouTube (Motor de Audio centralizado para tarjeta y modal) -->
	{#if moment.metadata?.youtubeVideoId && !isFutureLocked}
		<div class="absolute top-2.5 right-2.5 z-20 { cardState.isViewerOpen ? 'pointer-events-none opacity-0' : '' }">
			<YouTubeBackgroundPlayer
				videoId={ moment.metadata.youtubeVideoId }
				isPlaying={ cardState.isMusicPlaying && isPlaybackAllowed }
				initialTime={ cardState.backgroundMusicSec }
				bind:userVolume={ cardState.musicVolume }
				volumeOrientation="vertical"
				resetTrigger={ cardState.audioResetTrigger }
				isVoicePlaying={ cardState.isVoicePlaying }
				{relationColor}
				onTimeUpdate={ ( sec: number ) => ( cardState.backgroundMusicSec = sec ) }
				onTogglePlay={ handleMusicToggle }
			/>
		</div>
	{/if}

	<!-- Cubierta efímera para momentos de 'ver una sola vez' -->
	{#if shouldShowEphemeralCover}
		<MomentEphemeralCover
			isViewed={ effectiveIsViewed }
			canReplay={ canReplay }
			bgColor={ customBgColor }
			secondsLeft={ secondsLeft }
			totalDuration={ totalDuration }
			onReveal={ handleResumeEphemeralView }
			onStartHolding={ handleResumeEphemeralView }
			onReplay={ handleSuperAdminReplay }
		/>
	{/if}

	<!-- Escudo reactivo Anti-capturas y Anti-recortes de pantalla -->
	{#if cardState.isObscured}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			onclick={ handleResumeFromObscured }
			class="absolute inset-x-0 top-0 bottom-11.25 z-50 flex flex-col items-center justify-center p-5 bg-white/95 dark:bg-stone-950/98 backdrop-blur-3xl text-center text-stone-900 dark:text-white cursor-pointer select-none space-y-2"
		>
			<div class="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center border border-amber-500/30 animate-pulse shadow-xl">
				<EyeOff size={ 22 } />
			</div>
			<div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-300 text-[10px] font-extrabold uppercase tracking-widest border border-rose-500/25">
				<span>Captura Bloqueada</span>
			</div>
			<h4 class="text-sm font-extrabold text-stone-900 dark:text-white">Protección de Privacidad Activa</h4>
			<p class="text-[11px] text-stone-500 dark:text-stone-400 max-w-xs leading-relaxed">
				Por seguridad, este contenido confidencial se oculta automáticamente al detectar intentos de captura o pérdida de foco.
			</p>
			<span class="text-[10px] text-amber-600 dark:text-amber-400/80 font-semibold underline underline-offset-2">
				Haz clic para continuar viendo
			</span>
		</div>
	{/if}

	<!-- Bloqueo por Contraseña -->
	{#if moment.metadata?.password && !isUnlocked}
		<div class="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center backdrop-blur-xl bg-white/85 dark:bg-stone-900/85 text-stone-900 dark:text-white border border-stone-200/60 dark:border-white/10">
			<div class="w-12 h-12 rounded-2xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center mb-3 border border-amber-500/25">
				<Lock size={ 22 } />
			</div>
			<h4 class="text-sm font-bold text-stone-900 dark:text-white">Momento Bloqueado</h4>
			<p class="text-[11px] text-stone-500 dark:text-stone-400 max-w-xs mt-1 mb-4">
				Ingresa la clave para visualizar el contenido protegido.
			</p>
			<button
				type="button"
				onclick={ handleUnlockRequest }
				class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer"
			>
				Desbloquear
			</button>
		</div>
	{/if}

	<!-- Contenido del Momento (Clickeable para ver en pantalla completa) -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		onclick={ handleCardContentClick }
		class="relative z-10 p-2 cursor-pointer"
	>
		<!-- Nota de Voz de Audio -->
		{#if isVoiceNote && mediaUrl}
			<div class="mb-3">
				<AudioPlayer
					src={ mediaUrl }
					title={ moment.title || 'Nota de Voz' }
					duration={ moment.metadata?.audioDuration || 0 }
					volumeOrientation="vertical"
					{relationColor}
					isExternalPaused={ shouldShowEphemeralCover || effectiveIsViewed || !isUnlocked || cardState.isObscured }
					resetTrigger={ cardState.audioResetTrigger }
					autoplayTrigger={ cardState.audioAutoplayTrigger }
					onPlayStateChange={ ( isPlaying: boolean ) => ( cardState.isVoicePlaying = isPlaying ) }
				/>
			</div>
		{/if}

		<!-- Imagen / Video Multimedia -->
		{#if isImage && mediaUrl}
			<div class="aspect-4/5 overflow-hidden rounded-2xl relative shadow-inner mb-3">
				{#if moment.metadata?.is_temporal}
					<SecureEphemeralMedia
						imageUrl={ mediaUrl }
						alt={ moment.title || 'Foto de recuerdo' }
						isEphemeral={ true }
						isObscured={ cardState.isObscured }
						watermarkText={`${ memoriesStore.currentUser.name } • Confidencial`}
					/>
				{:else}
					<img
						src={ mediaUrl }
						alt={ moment.title || 'Foto de recuerdo' }
						class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
					/>
				{/if}

				{#if !moment.metadata?.is_temporal && cardState.passwordSecondsLeft !== undefined && cardState.passwordSecondsLeft > 0}
					<div class="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold text-amber-300 bg-black/60 backdrop-blur-md border border-amber-400/30">
						<Clock size={ 12 } />
						<span>{ cardState.passwordSecondsLeft }s restantes</span>
					</div>
				{/if}
			</div>
		{:else if isVideo && mediaUrl}
			<div class="aspect-video overflow-hidden rounded-2xl relative shadow-inner bg-black mb-3">
				{#if moment.metadata?.is_temporal}
					<SecureEphemeralMedia
						videoUrl={ mediaUrl }
						alt={ moment.title || 'Video de recuerdo' }
						isEphemeral={ true }
						isObscured={ cardState.isObscured }
						watermarkText={`${ memoriesStore.currentUser.name } • Confidencial`}
					/>
				{:else}
					<!-- svelte-ignore a11y_media_has_caption -->
					<video
						src={ mediaUrl }
						controls
						class="w-full h-full object-cover"
						autoplay={ true }
						muted={ true }
						playsinline
						loop={ true }
					></video>
				{/if}
			</div>
		{/if}

		<!-- Texto / Contenido y Título -->
		<div class="p-3 space-y-2 { moment.metadata?.is_temporal ? 'select-none' : '' } { !hasMedia && cardState.isEphemeralRevealed ? 'pb-24' : '' }">
			<!-- Tags automáticos con colores semánticos vibrantes -->
			<div class="flex flex-wrap items-center gap-1.5">
				{#each moment.tags as tag}
					{@const badge = getTagBadge( tag )}
					{@const TagIcon = badge.icon}
					<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-2xs { badge.colorClass }">
						<TagIcon size={ 10 } />
						<span>{ badge.label }</span>
					</span>
				{/each}

				{#if moment.metadata?.is_temporal}
					<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-2xs">
						<Flame size={ 10 } />
						<span>Efímero</span>
					</span>
				{/if}
			</div>

			{#if moment.title}
				<h4
					class="text-sm font-extrabold line-clamp-1 transition-colors"
					style="color: { relationColor };"
				>
					{ moment.title }
				</h4>
			{/if}

			{#if moment.content}
				<p class="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-normal { moment.tags.includes( 'quote' ) ? 'italic font-serif text-sm border-l-2 border-brand-accent/40 pl-2.5' : '' }">
					{ moment.content }
				</p>
			{/if}
		</div>
	</div>

	<!-- Línea de cuenta regresiva con efecto de mecha/fuego quemándose -->
	{#if moment.metadata?.is_temporal && !effectiveIsViewed && secondsLeft > 0}
		<div class="relative z-40 w-full px-2 mt-auto mb-1 { cardState.isEphemeralRevealed ? 'opacity-100' : 'opacity-75' }">
			<MomentCountdownProgress
				{secondsLeft}
				{progressPercent}
			/>
		</div>
	{/if}

	<!-- Pie de Tarjeta ( Autor, Fecha y Acciones ) -->
	<div
		class="relative z-30 px-3.5 py-2.5 flex items-center justify-between text-[11px] { moment.metadata?.is_temporal && !effectiveIsViewed && secondsLeft > 0 ? '' : 'mt-auto' } border-t transition-colors { hasCustomBg ? 'bg-black/5 dark:bg-black/20 backdrop-blur-md' : 'bg-stone-50/70 dark:bg-white/3 backdrop-blur-md border-stone-200/50 dark:border-white/5' }"
		style={ hasCustomBg ? `border-color: ${ customBgColor }26;` : '' }
	>
		<div class="flex items-center gap-2.5 truncate pr-2">
			<span class="inline-flex items-center gap-1.5 font-bold text-stone-700 dark:text-stone-200 truncate">
				<UserIcon size={ 13 } class="text-stone-500 dark:text-stone-400 shrink-0" />
				<span class="truncate">{ moment.author }</span>
			</span>

			{#if moment.capture_date}
				<span class="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500 dark:text-stone-400 shrink-0">
					<Calendar size={ 12 } class="opacity-75" />
					<span>{ formatCaptureDate( moment.capture_date ) }</span>
				</span>
			{/if}
		</div>

		<!-- Botones de Acción (4 botones con colores diferenciados) -->
		<div class="flex items-center gap-1 shrink-0">
			<!-- 1. Compartir momento -->
			<Tooltip text="Compartir momento" side="top" sideOffset={ 6 }>
				<button
					type="button"
					onclick={ handleOpenShare }
					class="size-7 rounded-xl flex items-center justify-center bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/25 transition-all active:scale-90 cursor-pointer shadow-2xs"
					aria-label="Compartir momento"
				>
					<Share2 size={ 13 } />
				</button>
			</Tooltip>

			<!-- 2. Ver en pantalla completa -->
			{#if !effectiveIsViewed && !isFutureLocked}
				<Tooltip text={ !isUnlocked && moment.metadata?.password ? 'Desbloquear y ver en pantalla completa' : 'Ver en pantalla completa' } side="top" sideOffset={ 6 }>
					<button
						type="button"
						onclick={ handleOpenViewer }
						class="size-7 rounded-xl flex items-center justify-center bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/25 transition-all active:scale-90 cursor-pointer shadow-2xs"
						aria-label="Ver momento en pantalla completa"
					>
						<Maximize2 size={ 13 } />
					</button>
				</Tooltip>
			{/if}

			<!-- 3. Editar momento -->
			{#if canEdit && onEdit}
				<Tooltip text="Editar momento" side="top" sideOffset={ 6 }>
					<button
						type="button"
						onclick={ () => onEdit && onEdit( moment ) }
						class="size-7 rounded-xl flex items-center justify-center bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/25 transition-all active:scale-90 cursor-pointer shadow-2xs"
						aria-label="Editar momento"
					>
						<Edit3 size={ 13 } />
					</button>
				</Tooltip>
			{/if}

			<!-- 4. Eliminar momento -->
			{#if canDelete && onDelete}
				<Tooltip text="Eliminar momento" side="top" sideOffset={ 6 }>
					<button
						type="button"
						onclick={ () => onDelete && onDelete( moment.id ) }
						class="size-7 rounded-xl flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/25 transition-all active:scale-90 cursor-pointer shadow-2xs"
						aria-label="Eliminar momento"
					>
						<Trash2 size={ 13 } />
					</button>
				</Tooltip>
			{/if}
		</div>
	</div>
</div>

<!-- Modal para Compartir Momento -->
<ShareMomentModal
	bind:open={ isShareOpen }
	{moment}
	{relationColor}
	{relationPath}
	onClose={ () => ( isShareOpen = false ) }
/>

<!-- Modal para ver el Momento en Pantalla Completa -->
<MomentDetailModal
	bind:open={ cardState.isViewerOpen }
	bind:remainingMs={ cardState.remainingMs }
	bind:musicCurrentTime={ cardState.backgroundMusicSec }
	bind:musicVolume={ cardState.musicVolume }
	bind:isMusicPlaying={ cardState.isMusicPlaying }
	bind:isMusicManuallyPaused={ cardState.isMusicManuallyPaused }
	{moment}
	{relationColor}
	isViewed={ effectiveIsViewed }
	onMusicTimeUpdate={ ( sec: number ) => ( cardState.backgroundMusicSec = sec ) }
	onMusicToggle={ ( playing: boolean, manual?: boolean ) => handleMusicToggle( playing, manual ?? false ) }
	onRecordView={ ( id: string ) => {
		cardState.remainingMs = 0;
		cardState.isEphemeralRevealed = false;
		cardState.isLocalReplayActive = false;
		if ( onRecordView ) {
			onRecordView( id );
		}
	} }
	onClose={ handleCloseViewer }
	{onEdit}
	{onDelete}
/>

<style>
	@keyframes breathingLock {
		0%, 100% {
			transform: scale( 1 );
			filter: brightness( 1 );
		}
		50% {
			transform: scale( 1.07 );
			filter: brightness( 1.15 );
		}
	}

	.breathing-lock {
		animation: breathingLock 2.8s ease-in-out infinite;
	}
</style>
