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
		Maximize2
	} from '@lucide/svelte';

    import type {
		MomentEntity,
		MomentTag
	} from '$lib/types';
	import MomentEphemeralCover     from './MomentEphemeralCover.svelte';
	import SecureEphemeralMedia     from './SecureEphemeralMedia.svelte';
	import MomentCountdownProgress  from './MomentCountdownProgress.svelte';
	import MomentDetailModal        from './MomentDetailModal.svelte';
	import Tooltip                  from '$lib/components/shared/Tooltip.svelte';
	import { formatCaptureDate }    from '$lib/utils/date';
	import { memoriesStore }        from '$lib/store.svelte';

	interface Props {
		moment         : MomentEntity;
		currentUserId  : string;
		relationColor ?: string;
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
		isViewed = false,
		onDelete,
		onEdit,
		onUnlock,
		onRecordView
	}: Props = $props();

	let isManuallyUnlocked     = $state<boolean>( false );
	let isEphemeralRevealed    = $state<boolean>( false );
	let isHolding              = $state<boolean>( false );
	let isLocalReplayActive    = $state<boolean>( false );
	let remainingMs            = $state<number | null>( null );
	let isObscured             = $state<boolean>( false );
	let isViewerOpen           = $state<boolean>( false );
	let passwordSecondsLeft    = $state<number | undefined>( undefined );
	let passwordTimerInterval  = $state<ReturnType<typeof setInterval> | null>( null );

    let animFrameId: number | null   = null;
	let lastTimestamp: number | null = null;

	const isUnlocked        = $derived<boolean>( !moment.metadata?.password || isManuallyUnlocked || memoriesStore.isMomentUnlocked( moment.id ) );
	const isCreator         = $derived<boolean>( Boolean( moment.created_by && moment.created_by === currentUserId ) );
	const isSuperAdmin      = $derived<boolean>( memoriesStore.currentUser.role === 'super_admin' );
	const canEdit           = $derived<boolean>( memoriesStore.canEditMoment( moment ) );
	const canDelete         = $derived<boolean>( memoriesStore.canDeleteMoment( moment ) );
	const canReplay         = $derived<boolean>( Boolean( moment.metadata?.is_temporal && ( isSuperAdmin || isCreator ) ) );
	const hasCustomBg       = $derived<boolean>( Boolean( moment.metadata?.bgColor ) );
	const customBgColor     = $derived<string>( moment.metadata?.bgColor || '#7C3AED' );
	const hasMedia          = $derived<boolean>( Boolean( moment.metadata?.imageUrl || moment.metadata?.videoUrl ) );
	const totalDuration     = $derived<number>( moment.metadata?.timer || 5 );
	const totalDurationMs   = $derived<number>( totalDuration * 1000 );
	const currentRemainingMs = $derived<number>(
		remainingMs !== null ? remainingMs : totalDurationMs
	);
	const secondsLeft       = $derived<number>( Math.max( 0, Math.ceil( currentRemainingMs / 1000 ) ) );
	const progressPercent   = $derived<number>(
		Math.max( 0, Math.min( 100, ( currentRemainingMs / totalDurationMs ) * 100 ) )
	);
	const effectiveIsViewed = $derived<boolean>(
		isLocalReplayActive ? false : Boolean( isViewed || currentRemainingMs <= 0 )
	);

	const shouldShowEphemeralCover = $derived<boolean>(
		Boolean( moment.metadata?.is_temporal && ( !isEphemeralRevealed || !isHolding ) )
	);

	function stepTimer( now: number ): void {
		if ( !isHolding || isObscured ) {
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
				isHolding = false;
				isEphemeralRevealed = false;
				isLocalReplayActive = false;
				lastTimestamp = null;
				animFrameId = null;
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

		passwordSecondsLeft = moment.metadata.timer;
		passwordTimerInterval = setInterval( () => {
			if ( passwordSecondsLeft && passwordSecondsLeft > 1 ) {
				passwordSecondsLeft -= 1;
			} else {
				if ( passwordTimerInterval ) {
					clearInterval( passwordTimerInterval );
					passwordTimerInterval = null;
				}
				isManuallyUnlocked = false;
				memoriesStore.lockMoment( moment.id );
				passwordSecondsLeft = 0;
			}
		}, 1000 );
	}

	function handleStartHolding(): void {
		if ( isObscured || currentRemainingMs <= 0 ) {
			return;
		}

		if ( remainingMs === null ) {
			remainingMs = totalDurationMs;
		}

		isHolding = true;
		isEphemeralRevealed = true;

		startTimer();
	}

	function handleStopHolding(): void {
		if ( !isHolding ) {
			return;
		}

		isHolding = false;
		stopTimer();

		if ( currentRemainingMs > 0 ) {
			isEphemeralRevealed = false;
		}
	}

	function handleSuperAdminReplay(): void {
		memoriesStore.resetMomentViewForUser( moment.id, currentUserId );
		isLocalReplayActive = true;
		remainingMs = totalDurationMs;
		isObscured = false;
		isHolding = true;
		isEphemeralRevealed = true;

		startTimer();
	}

	function handleCardWindowBlur(): void {
		if ( isViewerOpen ) {
			return;
		}
		if ( moment.metadata?.is_temporal && ( isEphemeralRevealed || isHolding ) ) {
			isObscured = true;
			handleStopHolding();
		}
	}

	function handleCardWindowFocus(): void {
		if ( moment.metadata?.is_temporal ) {
			isObscured = false;
		}
	}

	function handleCardVisibilityChange(): void {
		if ( isViewerOpen ) {
			return;
		}
		if ( moment.metadata?.is_temporal && document.hidden ) {
			if ( isEphemeralRevealed || isHolding ) {
				isObscured = true;
				handleStopHolding();
			}
		} else if ( moment.metadata?.is_temporal && !document.hidden ) {
			isObscured = false;
		}
	}

	function handleCardKeyCapture( e: KeyboardEvent ): void {
		if ( !moment.metadata?.is_temporal || isViewerOpen ) {
			return;
		}

		// Solo interceptar si el usuario está activamente viendo el contenido en la tarjeta
		if ( !isHolding && !isEphemeralRevealed ) {
			return;
		}

		// Ignorar si el usuario está escribiendo en un input, textarea o modal de contraseña
		const target = e.target as HTMLElement | null;
		if ( target && ( target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable ) ) {
			return;
		}

		// Detección y bloqueo reactivo de captura de pantalla
		const isCaptureOrModifierKey =
			e.key === 'PrintScreen' ||
			e.code === 'PrintScreen' ||
			e.keyCode === 44 ||
			( ( e.ctrlKey || e.metaKey ) && ( e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S' ) ) ||
			( e.shiftKey && ( e.metaKey || ( e.ctrlKey && ( e.key === 's' || e.key === 'S' ) ) ) );

		if ( isCaptureOrModifierKey ) {
			isObscured = true;
			handleStopHolding();

			try {
				navigator.clipboard?.writeText( '' );
			} catch {}
		}
	}

	$effect( () => {
		if ( !moment.metadata?.is_temporal && isUnlocked && moment.metadata?.timer && !passwordTimerInterval && passwordSecondsLeft === undefined ) {
			startPasswordTimer();
		}
	} );

	$effect( () => {
		if ( typeof window === 'undefined' ) {
			return;
		}

		if ( moment.metadata?.is_temporal && !effectiveIsViewed ) {
			window.addEventListener( 'blur', handleCardWindowBlur );
			window.addEventListener( 'focus', handleCardWindowFocus );
			document.addEventListener( 'visibilitychange', handleCardVisibilityChange );
			window.addEventListener( 'keydown', handleCardKeyCapture );
			window.addEventListener( 'keyup', handleCardKeyCapture );
			window.addEventListener( 'pointerup', handleStopHolding );
			window.addEventListener( 'pointercancel', handleStopHolding );

			return () => {
				window.removeEventListener( 'blur', handleCardWindowBlur );
				window.removeEventListener( 'focus', handleCardWindowFocus );
				document.removeEventListener( 'visibilitychange', handleCardVisibilityChange );
				window.removeEventListener( 'keydown', handleCardKeyCapture );
				window.removeEventListener( 'keyup', handleCardKeyCapture );
				window.removeEventListener( 'pointerup', handleStopHolding );
				window.removeEventListener( 'pointercancel', handleStopHolding );
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
			window.removeEventListener( 'focus', handleCardWindowFocus );
			document.removeEventListener( 'visibilitychange', handleCardVisibilityChange );
			window.removeEventListener( 'keydown', handleCardKeyCapture );
			window.removeEventListener( 'keyup', handleCardKeyCapture );
			window.removeEventListener( 'pointerup', handleStopHolding );
			window.removeEventListener( 'pointercancel', handleStopHolding );
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
		if ( moment.metadata?.password && !isUnlocked ) {
			handleUnlockRequest();
			return;
		}
		isObscured = false;
		if ( isHolding ) {
			handleStopHolding();
		}
		isViewerOpen = true;
	}

	function handleCardContentClick( e: MouseEvent ): void {
		if ( isObscured || shouldShowEphemeralCover ) {
			return;
		}
		if ( moment.metadata?.password && !isUnlocked ) {
			handleUnlockRequest();
			return;
		}
		const target = e.target as HTMLElement;
		if ( target.closest( 'button' ) || target.closest( 'video' ) ) {
			return;
		}
		isObscured = false;
		if ( isHolding ) {
			handleStopHolding();
		}
		isViewerOpen = true;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	onpointerleave={handleStopHolding}
	onpointerup={handleStopHolding}
	onpointercancel={handleStopHolding}
	class="group relative flex flex-col justify-between rounded-3xl overflow-hidden transition-all duration-500 backdrop-blur-md shadow-lg hover:shadow-2xl min-h-72.5 w-full { hasCustomBg ? 'bg-white/75 dark:bg-dark-card/75' : 'bg-white/70 dark:bg-dark-card/70 border border-stone-200/60 dark:border-white/10' }"
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

	<!-- Cubierta efímera para momentos de 'ver una sola vez' -->
	{#if shouldShowEphemeralCover}
		<MomentEphemeralCover
			isViewed={effectiveIsViewed}
			canReplay={canReplay}
			bgColor={customBgColor}
			secondsLeft={secondsLeft}
			totalDuration={totalDuration}
			onStartHolding={handleStartHolding}
			onStopHolding={handleStopHolding}
			onReplay={handleSuperAdminReplay}
		/>
	{/if}

	<!-- Escudo reactivo Anti-capturas y Anti-recortes de pantalla -->
	{#if isObscured}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			onclick={() => { isObscured = false; }}
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

	<!-- Contador flotante visible para momentos efímeros en visualización -->
	{#if isEphemeralRevealed && isHolding && secondsLeft > 0}
		<div class="absolute { hasMedia ? 'top-3' : 'bottom-20' } left-3 right-3 z-30 flex items-center justify-between px-3.5 py-2 rounded-2xl bg-amber-500/90 text-stone-950 backdrop-blur-md shadow-xl border border-amber-300/40 animate-pulse">
			<div class="flex items-center gap-1.5 font-black text-xs tracking-tight">
				<Flame size={ 16 } class="animate-bounce" />
				<span>Momento Efímero</span>
			</div>
			<div class="flex items-center gap-1.5 font-black text-xs bg-black/20 px-2.5 py-0.5 rounded-full text-white">
				<Clock size={ 13 } />
				<span>{ secondsLeft }s restantes</span>
			</div>
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
				onclick={handleUnlockRequest}
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
		<!-- Imagen / Video Multimedia -->
		{#if moment.metadata?.imageUrl}
			<div class="aspect-4/5 overflow-hidden rounded-2xl relative shadow-inner mb-3">
				{#if moment.metadata.is_temporal}
					<SecureEphemeralMedia
						imageUrl={moment.metadata.imageUrl}
						alt={ moment.title || 'Foto de recuerdo' }
						isEphemeral={ true }
						isObscured={ isObscured }
						watermarkText={`${ memoriesStore.currentUser.name } • Confidencial`}
					/>
				{:else}
					<img
						src={ moment.metadata.imageUrl }
						alt={ moment.title || 'Foto de recuerdo' }
						class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
					/>
				{/if}

				{#if !moment.metadata.is_temporal && passwordSecondsLeft !== undefined && passwordSecondsLeft > 0}
					<div class="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold text-amber-300 bg-black/60 backdrop-blur-md border border-amber-400/30">
						<Clock size={ 12 } />
						<span>{ passwordSecondsLeft }s restantes</span>
					</div>
				{/if}
			</div>
		{:else if moment.metadata?.videoUrl}
			<div class="aspect-video overflow-hidden rounded-2xl relative shadow-inner bg-black mb-3">
				{#if moment.metadata.is_temporal}
					<SecureEphemeralMedia
						videoUrl={moment.metadata.videoUrl}
						alt={ moment.title || 'Video de recuerdo' }
						isEphemeral={ true }
						isObscured={ isObscured }
						watermarkText={`${ memoriesStore.currentUser.name } • Confidencial`}
					/>
				{:else}
					<!-- svelte-ignore a11y_media_has_caption -->
					<video
						src={ moment.metadata.videoUrl }
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
		<div class="p-3 space-y-2 { moment.metadata?.is_temporal ? 'select-none' : '' } { !hasMedia && isEphemeralRevealed ? 'pb-24' : '' }">
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
		<div class="relative z-40 w-full px-1 mt-auto mb-1 { isEphemeralRevealed && isHolding ? 'opacity-100' : 'opacity-75' }">
			<MomentCountdownProgress
				{secondsLeft}
				{progressPercent}
				showBadge={ false }
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

		<!-- Botones de Acción -->
		<div class="flex items-center gap-1 shrink-0">
			<!-- Botón para ver y abrir el momento en pantalla completa por Dialog -->
			{#if !effectiveIsViewed}
				<Tooltip text={ !isUnlocked && moment.metadata?.password ? 'Desbloquear y ver en pantalla completa' : 'Ver en pantalla completa' } side="top" sideOffset={ 6 }>
					<button
						type="button"
						onclick={ handleOpenViewer }
						class="size-7 rounded-xl flex items-center justify-center bg-stone-100/90 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/20 text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-white border border-stone-200/70 dark:border-white/10 transition-all active:scale-90 cursor-pointer shadow-2xs"
						aria-label="Ver momento en pantalla completa"
					>
						<Maximize2 size={ 13 } />
					</button>
				</Tooltip>
			{/if}

			{#if canReplay}
				<Tooltip text="Volver a ver momento efímero" side="top" sideOffset={ 6 }>
					<button
						type="button"
						onclick={handleSuperAdminReplay}
						class="size-7 rounded-xl flex items-center justify-center bg-amber-500/15 text-amber-500 dark:text-amber-400 hover:bg-amber-500/25 border border-amber-500/30 transition-all active:scale-90 cursor-pointer shadow-2xs"
						aria-label="Volver a ver momento efímero"
					>
						<RotateCcw size={ 13 } />
					</button>
				</Tooltip>
			{/if}

			{#if canEdit && onEdit}
				<Tooltip text="Editar momento" side="top" sideOffset={ 6 }>
					<button
						type="button"
						onclick={() => onEdit && onEdit( moment )}
						class="size-7 rounded-xl flex items-center justify-center bg-stone-100/90 dark:bg-white/10 hover:bg-amber-500/15 text-stone-700 dark:text-stone-200 hover:text-amber-500 dark:hover:text-amber-400 border border-stone-200/70 dark:border-white/10 transition-all active:scale-90 cursor-pointer shadow-2xs"
						aria-label="Editar momento"
					>
						<Edit3 size={ 13 } />
					</button>
				</Tooltip>
			{/if}

			{#if canDelete && onDelete}
				<Tooltip text="Eliminar momento" side="top" sideOffset={ 6 }>
					<button
						type="button"
						onclick={() => onDelete && onDelete( moment.id )}
						class="size-7 rounded-xl flex items-center justify-center bg-stone-100/90 dark:bg-white/10 hover:bg-rose-500/15 text-stone-700 dark:text-stone-200 hover:text-rose-500 dark:hover:text-rose-400 border border-stone-200/70 dark:border-white/10 transition-all active:scale-90 cursor-pointer shadow-2xs"
						aria-label="Eliminar momento"
					>
						<Trash2 size={ 13 } />
					</button>
				</Tooltip>
			{/if}
		</div>
	</div>
</div>

<!-- Modal para ver el Momento en Pantalla Completa -->
<MomentDetailModal
	bind:open={ isViewerOpen }
	{moment}
	{relationColor}
	{currentUserId}
	isViewed={ effectiveIsViewed }
	{onRecordView}
	{onEdit}
	{onDelete}
/>
