<script lang="ts">
	import { onDestroy } from 'svelte';


    import {
		Film,
		Play,
		Pause,
		ChevronLeft,
		ChevronRight,
		Maximize2,
		Minimize2,
		X,
		Lock,
		RotateCcw,
		Sparkles,
		EyeOff,
		FileText,
		Video as VideoIcon,
		Headphones,
		SlidersHorizontal
	}                   from '@lucide/svelte';
    import { Dialog }   from 'bits-ui';

	import type {
		MemoryEntity,
		MomentEntity,
		MemoryCinemaMode
	}                               from '$lib/types';
	import { memoriesStore }        from '$lib/store.svelte';
	import Tooltip                  from '$lib/components/shared/Tooltip.svelte';
	import AudioPlayer              from '$lib/components/moments/AudioPlayer.svelte';
	import YouTubeBackgroundPlayer  from '$lib/components/moments/YouTubeBackgroundPlayer.svelte';
	import SecureEphemeralMedia     from '$lib/components/moments/SecureEphemeralMedia.svelte';
	import MomentCountdownProgress  from '$lib/components/moments/MomentCountdownProgress.svelte';


    interface Props {
		isOpen       : boolean;
		memory       : MemoryEntity;
		moments      : MomentEntity[];
		relationColor?: string;
		onClose      : () => void;
		onOpenConfig?: () => void;
	}


    let {
		isOpen,
		memory,
		moments,
		relationColor = '#f43f5e',
		onClose,
		onOpenConfig
	}: Props = $props();

	let currentIndex                    = $state<number>( 0 );
	let isPaused                        = $state<boolean>( false );
	let isMediaPlaying                  = $state<boolean>( false );
	let isFinished                      = $state<boolean>( false );
	let isFullscreen                    = $state<boolean>( false );
	let isFilmstripOpen                 = $state<boolean>( false );
	let isObscured                      = $state<boolean>( false );
	let isControlsVisible               = $state<boolean>( true );
	let isMusicPlaying                  = $state<boolean>( true );

	// Seguridad y contraseñas de sesión
	let sessionUnlockedMoments          = $state<Set<string>>( new Set() );
	let sessionMasterPasswordUnlocked   = $state<boolean>( false );
	let passwordInput                   = $state<string>( '' );
	let passwordError                   = $state<string | null>( null );

	// Temporizador
	let timerProgressMs                 = $state<number>( 0 );
	let animFrameId                     : number | null = null;
	let lastTimestamp                   : number | null = null;
	let hideControlsTimeout             : ReturnType<typeof setTimeout> | null = null;
	let cinemaContainerEl               = $state<HTMLDivElement | null>( null );

	const cinemaConfig = $derived<MemoryCinemaMode>(
		memoriesStore.getCinemaConfig( memory.id )
	);

	function getMomentPrimaryType( moment: MomentEntity ): 'voice' | 'video' | 'image' | 'dedication' {
		const mediaUrl = ( moment.metadata?.url || '' ).trim();
		const isAudio  = Boolean( moment.metadata?.audioDuration || mediaUrl.startsWith( 'data:audio' ) || mediaUrl.endsWith( '.mp3' ) || mediaUrl.endsWith( '.wav' ) || mediaUrl.endsWith( '.ogg' ) || mediaUrl.endsWith( '.webm' ) || moment.tags?.includes( 'voice note' ) );

        if ( isAudio ) {
			return 'voice';
		}

        const isVideo  = Boolean( mediaUrl.includes( 'youtube.com' ) || mediaUrl.includes( 'youtu.be' ) || mediaUrl.endsWith( '.mp4' ) || mediaUrl.endsWith( '.mov' ) || moment.tags?.includes( 'video' ) );

        if ( isVideo ) {
			return 'video';
		}

        const isImage  = Boolean( mediaUrl || moment.tags?.includes( 'image' ) );

        if ( isImage ) {
			return 'image';
		}

        return 'dedication';
	}


    const playableMoments = $derived.by<MomentEntity[]>( () => {
		if ( !memory || !moments || moments.length === 0 ) {
			return [];
		}

		return moments.filter( ( m: MomentEntity ) => {
			// 1. Filtrar por contraseña
			if ( m.metadata?.password && !cinemaConfig.show_passwords ) {
				return false;
			}

			// 2. Filtrar por efímero no visto
			if ( m.metadata?.is_temporal ) {
				if ( !cinemaConfig.show_ephemeral_moments ) {
					return false;
				}

                const alreadyViewed = memoriesStore.isMomentViewed( m.id, memoriesStore.currentUser.id );

                if ( alreadyViewed ) {
					return false;
				}
			}

			// 3. Filtrar por formato principal
			const type = getMomentPrimaryType( m );

            if ( type === 'image' && !cinemaConfig.show_images ) {
				return false;
			}

            if ( type === 'video' && !cinemaConfig.show_videos ) {
				return false;
			}

            if ( type === 'voice' && !cinemaConfig.show_voice ) {
				return false;
			}

            if ( type === 'dedication' && !cinemaConfig.show_dedications ) {
				return false;
			}

			return true;
		});
	});

	const currentMoment     = $derived<MomentEntity | undefined>( playableMoments[ currentIndex ] );
	const momentColor       = $derived<string>( currentMoment?.metadata?.bgColor || relationColor || '#7C3AED' );
	const hexColor          = $derived<string>( momentColor.length === 7 ? momentColor : ( momentColor.startsWith( '#' ) ? momentColor.slice( 0, 7 ) : ( relationColor || '#7C3AED' ) ) );
	const isDark            = $derived<boolean>( memoriesStore.theme === 'dark' );
	const containerBackground = $derived<string>(
		isDark
			? `radial-gradient(circle at 50% 40%, color-mix(in srgb, ${ hexColor } 35%, #09060e) 0%, #09060e 75%, #030206 100%)`
			: `radial-gradient(circle at 50% 35%, color-mix(in srgb, ${ hexColor } 20%, #fcfbf9) 0%, #fcfbf9 60%, #f1ede6 100%)`
	);
	const isCurrentLocked   = $derived.by<boolean>( () => {
		if ( !currentMoment || !currentMoment.metadata?.password ) {
			return false;
		}

        if ( !cinemaConfig.give_passwords && sessionMasterPasswordUnlocked ) {
			return false;
		}

        if ( sessionUnlockedMoments.has( currentMoment.id ) ) {
			return false;
		}

        if ( memoriesStore.isMomentUnlocked( currentMoment.id ) ) {
			return false;
		}

        return true;
	});


    const totalTimerMs = $derived.by<number>( () => {
		if ( !currentMoment ) {
			return 0;
		}

        if ( currentMoment.metadata?.is_temporal ) {
			return ( currentMoment.metadata.timer || 10 ) * 1000;
		}

        if ( cinemaConfig.timer && cinemaConfig.timer > 0 ) {
			return cinemaConfig.timer * 1000;
		}

        return 0;
	});


    const timerSecondsLeft = $derived<number>(
		totalTimerMs > 0 ? Math.max( 0, Math.ceil( ( totalTimerMs - timerProgressMs ) / 1000 ) ) : 0
	);


    const timerPercent = $derived<number>(
		totalTimerMs > 0 ? Math.min( 100, Math.max( 0, ( ( totalTimerMs - timerProgressMs ) / totalTimerMs ) * 100 ) ) : 100
	);


    const timerProgressPercent = $derived<number>(
		totalTimerMs > 0 ? Math.min( 100, Math.max( 0, ( timerProgressMs / totalTimerMs ) * 100 ) ) : 0
	);

	// Iniciar o reiniciar ciclo del temporizador
	function resetTimer(): void {
		timerProgressMs = 0;
		lastTimestamp   = null;
		isMediaPlaying  = false;
	}


    $effect( () => {
		const _ = currentIndex;
		resetTimer();
	});


    function nextSlide(): void {
		if ( playableMoments.length === 0 ) {
			return;
		}

		// Si el momento actual es efímero y se avanza, registrar como visto
		if ( currentMoment?.metadata?.is_temporal ) {
			memoriesStore.recordMomentView( currentMoment.id, memoriesStore.currentUser.id );
		}

		if ( currentIndex < playableMoments.length - 1 ) {
			currentIndex += 1;
			resetTimer();
		} else {
			isFinished = true;
			stopTimerLoop();
		}
	}


    function prevSlide(): void {
		if ( playableMoments.length === 0 ) {
			return;
		}

		if ( isFinished ) {
			isFinished      = false;
			currentIndex    = playableMoments.length - 1;

            resetTimer();
			startTimerLoop();
		} else if ( currentIndex > 0 ) {
			currentIndex -= 1;
			resetTimer();
		}
	}


    function goToSlide( index: number ): void {
		if ( index >= 0 && index < playableMoments.length ) {
			// Si el momento actual era efímero, marcarlo como visto
			if ( currentMoment?.metadata?.is_temporal ) {
				memoriesStore.recordMomentView( currentMoment.id, memoriesStore.currentUser.id );
			}

            isFinished      = false;
			currentIndex    = index;

            resetTimer();
		}
	}


    function restartCinema(): void {
		isFinished      = false;
		currentIndex    = 0;

        resetTimer();
		startTimerLoop();
	}


    function handleUnlockSubmit( e: SubmitEvent ): void {
		e.preventDefault();

        if ( !currentMoment || !currentMoment.metadata?.password ) {
			return;
		}

		if ( passwordInput.trim() === currentMoment.metadata.password.trim() ) {
			sessionUnlockedMoments.add( currentMoment.id );

            if ( !cinemaConfig.give_passwords ) {
				sessionMasterPasswordUnlocked = true;
			}

            passwordInput = '';
			passwordError = null;

            resetTimer();
		} else {
			passwordError = 'Contraseña incorrecta. Inténtalo de nuevo.';
		}
	}


    function togglePause(): void {
		isPaused        = !isPaused;
		lastTimestamp   = null;
	}


    function toggleFullscreen(): void {
		if ( !document.fullscreenElement ) {
			cinemaContainerEl?.requestFullscreen().catch( () => {} );
		} else {
			document.exitFullscreen().catch( () => {} );
		}
	}

	function handleMouseMove(): void {
		isControlsVisible = true;

        if ( hideControlsTimeout ) {
			clearTimeout( hideControlsTimeout );
		}

        hideControlsTimeout = setTimeout( () => {
			if ( !isPaused && !isCurrentLocked && !isFinished ) {
				isControlsVisible = false;
			}
		}, 3500 );
	}


    function handleKeyDown( e: KeyboardEvent ): void {
		if ( !isOpen ) {
			return;
		}

		if ( e.key === 'ArrowRight' ) {
			e.preventDefault();
			nextSlide();
		} else if ( e.key === 'ArrowLeft' ) {
			e.preventDefault();
			prevSlide();
		} else if ( e.key === ' ' && !( e.target instanceof HTMLInputElement ) ) {
			e.preventDefault();
			togglePause();
		} else if ( ( e.key === 'f' || e.key === 'F' ) && !( e.target instanceof HTMLInputElement ) ) {
			e.preventDefault();
			toggleFullscreen();
		} else if ( e.key === 'Escape' ) {
			if ( document.fullscreenElement ) {
				document.exitFullscreen().catch( () => {} );
			} else {
				handleClose();
			}
		}
	}


    function handleWindowBlur(): void {
		if ( isOpen && currentMoment?.metadata?.is_temporal ) {
			isObscured = true;
		}
	}


    function handleResumeFromObscured(): void {
		isObscured = false;

        resetTimer();
	}


    function timerTick( timestamp: number ): void {
		if ( !isOpen || isFinished ) {
			return;
		}

		if ( !isPaused && !isMediaPlaying && !isCurrentLocked && !isObscured && totalTimerMs > 0 ) {
			if ( lastTimestamp === null ) {
				lastTimestamp = timestamp;
			}

            const delta = timestamp - lastTimestamp;

            timerProgressMs += delta;

			if ( timerProgressMs >= totalTimerMs ) {
				nextSlide();

                return;
			}
		}

		lastTimestamp   = timestamp;
		animFrameId     = requestAnimationFrame( timerTick );
	}


    function startTimerLoop(): void {
		if ( !animFrameId ) {
			lastTimestamp   = null;
			animFrameId     = requestAnimationFrame( timerTick );
		}
	}


    function stopTimerLoop(): void {
		if ( animFrameId ) {
			cancelAnimationFrame( animFrameId );
			animFrameId = null;
		}

        lastTimestamp = null;
	}


    function handleClose(): void {
		stopTimerLoop();

        if ( document.fullscreenElement ) {
			document.exitFullscreen().catch( () => {} );
		}

        onClose();
	}


    $effect( () => {
		if ( isOpen ) {
			isFinished      = false;
			currentIndex    = 0;

            resetTimer();
			startTimerLoop();

			const handleFullscreenChange = (): void => {
				isFullscreen = Boolean( document.fullscreenElement );
			};

			document.addEventListener( 'fullscreenchange', handleFullscreenChange );
			window.addEventListener( 'keydown', handleKeyDown );
			window.addEventListener( 'blur', handleWindowBlur );

			return () => {
				stopTimerLoop();
				document.removeEventListener( 'fullscreenchange', handleFullscreenChange );
				window.removeEventListener( 'keydown', handleKeyDown );
				window.removeEventListener( 'blur', handleWindowBlur );

                if ( hideControlsTimeout ) {
					clearTimeout( hideControlsTimeout );
				}
			};
		} else {
			stopTimerLoop();
		}
	});


    onDestroy( () => {
		stopTimerLoop();

        if ( hideControlsTimeout ) {
			clearTimeout( hideControlsTimeout );
		}
	});
</script>

<Dialog.Root open={ isOpen } onOpenChange={ ( open: boolean ) => { if ( !open ) handleClose(); } }>
	<Dialog.Portal>
		<Dialog.Overlay
			class="fixed inset-0 z-50 bg-stone-900/60 dark:bg-stone-950/98 backdrop-blur-2xl animate-in fade-in-0 duration-300"
		/>

		<Dialog.Content
			onInteractOutside={ ( e: Event ) => e.preventDefault() }
			class="fixed inset-0 z-50 w-screen h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white overflow-hidden select-none outline-hidden"
		>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				bind:this={ cinemaContainerEl }
				onmousemove={ handleMouseMove }
				class="w-full h-full flex flex-col justify-between overflow-hidden transition-colors"
				style="background: { containerBackground }; transition: background 0.7s ease-in-out;"
			>
				<!-- 1. Barra Superior Cinemática -->
				<header
					class="relative z-30 w-full px-6 py-4 flex flex-col gap-2 transition-opacity duration-300 bg-linear-to-b from-white/95 via-white/60 to-transparent dark:from-black/85 dark:via-black/45 dark:to-transparent { isControlsVisible || isPaused || isCurrentLocked || isFinished ? 'opacity-100' : 'opacity-0 pointer-events-none' }"
				>
					<!-- Barras de Progreso Segmentadas Superiores (Estilo Historias) -->
					{#if playableMoments.length > 0}
						<div class="flex items-center gap-1.5 w-full max-w-4xl mx-auto">
							{#each playableMoments as item, idx ( item.id )}
								<div class="h-1 flex-1 bg-stone-900/10 dark:bg-white/20 rounded-full overflow-hidden">
									{#if idx < currentIndex || isFinished}
										<div class="h-full w-full bg-stone-900 dark:bg-white transition-opacity duration-200"></div>
									{:else if idx === currentIndex}
										<div
											class="h-full"
											style="width: { totalTimerMs > 0 ? timerProgressPercent : 0 }%; background-color: { hexColor };"
										></div>
									{:else}
										<div class="h-full w-0 bg-transparent"></div>
									{/if}
								</div>
							{/each}
						</div>
					{/if}

					<div class="flex items-center justify-between max-w-6xl w-full mx-auto pt-1">
						<!-- Título e Información de la Memoria -->
						<div class="flex items-center gap-3">
							<div
								class="size-8 rounded-xl flex items-center justify-center shadow-md transition-colors duration-500"
								style="background-color: { hexColor }30; color: { hexColor };"
							>
								<Film size={ 18 } />
							</div>

							<div>
								<div class="flex items-center gap-2">
									<h2 class="text-sm sm:text-base font-extrabold tracking-tight text-stone-900 dark:text-white drop-shadow-xs">
										{ memory.title }
									</h2>

									{#if playableMoments.length > 0}
										<span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-900/5 dark:bg-white/10 text-stone-700 dark:text-stone-300 border border-stone-900/10 dark:border-white/10">
											{ isFinished ? 'Finalizado' : `${ currentIndex + 1 } de ${ playableMoments.length }` }
										</span>
									{/if}
								</div>

								<p class="text-[11px] text-stone-500 dark:text-stone-400 font-medium hidden sm:block">
									Modo Cine • { cinemaConfig.timer ? `${ cinemaConfig.timer }s por momento` : 'Avance manual' }
								</p>
							</div>
						</div>

						<!-- Controles Rápidos Superiores -->
						<div class="flex items-center gap-2">
							{#if currentMoment?.metadata?.youtubeVideoId && !isFinished}
								{#key currentMoment.id + '_' + currentMoment.metadata.youtubeVideoId}
									<YouTubeBackgroundPlayer
										videoId={ currentMoment.metadata.youtubeVideoId }
										controllerOnly={ false }
										isPlaying={ isMusicPlaying && !isPaused && !isObscured && !isCurrentLocked }
										relationColor={ hexColor }
										onTogglePlay={ ( playing: boolean ) => ( isMusicPlaying = playing ) }
									/>
								{/key}
							{/if}

							{#if totalTimerMs > 0 && !isFinished}
								<Tooltip text={ isPaused ? 'Reanudar proyección (Espacio)' : 'Pausar proyección (Espacio)' }>
									<button
										type="button"
										onclick={ togglePause }
										class="size-9 rounded-xl bg-stone-900/5 hover:bg-stone-900/10 dark:bg-white/10 dark:hover:bg-white/20 text-stone-800 dark:text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer border border-stone-200/80 dark:border-white/10"
										aria-label={ isPaused ? 'Reanudar' : 'Pausar' }
									>
										{#if isPaused}
											<Play size={ 16 } class="fill-current" />
										{:else}
											<Pause size={ 16 } class="fill-current" />
										{/if}
									</button>
								</Tooltip>
							{/if}

							<Tooltip text={ isFullscreen ? 'Salir de pantalla completa (F)' : 'Pantalla completa (F)' }>
								<button
									type="button"
									onclick={ toggleFullscreen }
									class="size-9 rounded-xl bg-stone-900/5 hover:bg-stone-900/10 dark:bg-white/10 dark:hover:bg-white/20 text-stone-800 dark:text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer border border-stone-200/80 dark:border-white/10"
									aria-label="Alternar pantalla completa"
								>
									{#if isFullscreen}
										<Minimize2 size={ 16 } />
									{:else}
										<Maximize2 size={ 16 } />
									{/if}
								</button>
							</Tooltip>

							{#if onOpenConfig && memoriesStore.canManageCinema( memory )}
								<Tooltip text="Ajustes de Modo Cine">
									<button
										type="button"
										onclick={ () => { handleClose(); onOpenConfig(); } }
										class="size-9 rounded-xl bg-stone-900/5 hover:bg-stone-900/10 dark:bg-white/10 dark:hover:bg-white/20 text-stone-800 dark:text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer border border-stone-200/80 dark:border-white/10"
										aria-label="Abrir ajustes"
									>
										<SlidersHorizontal size={ 16 } />
									</button>
								</Tooltip>
							{/if}

							<Tooltip text="Cerrar Modo Cine (Esc)">
								<button
									type="button"
									onclick={ handleClose }
									class="size-9 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 dark:bg-rose-500/20 dark:hover:bg-rose-500/40 text-rose-600 dark:text-rose-300 flex items-center justify-center transition-all active:scale-90 cursor-pointer border border-rose-500/30 ml-1"
									aria-label="Cerrar Modo Cine"
								>
									<X size={ 18 } />
								</button>
							</Tooltip>
						</div>
					</div>
				</header>

                <!-- 2. Área Central de Proyección -->
                <main class="relative flex-1 w-full max-w-5xl mx-auto flex items-center justify-center p-4 sm:p-8 min-h-0">
                    {#if playableMoments.length === 0}
                        <!-- Estado Vacío: Sin momentos que coincidan -->
                        <div class="text-center space-y-4 max-w-md p-8 rounded-3xl bg-white/80 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 backdrop-blur-md shadow-xl">
                            <Film size={ 48 } class="mx-auto text-stone-400 dark:text-stone-500" />

                            <h3 class="text-lg font-bold text-stone-900 dark:text-white">No hay momentos disponibles</h3>

                            <p class="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                                Los filtros actuales de Modo Cine (formatos o contraseñas) excluyen todos los momentos de esta memoria.
                            </p>

                            {#if onOpenConfig && memoriesStore.canManageCinema( memory )}
                                <button
                                    type="button"
                                    onclick={ () => { handleClose(); onOpenConfig(); } }
                                    class="px-5 py-2.5 rounded-2xl bg-brand-accent text-white text-xs font-bold shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                >
                                    Modificar Filtros
                                </button>
                            {/if}
                        </div>
                    {:else if isFinished}
                        <!-- Pantalla Final de Cierre -->
                        <div class="text-center space-y-6 max-w-lg p-10 rounded-3xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/80 dark:border-white/15 backdrop-blur-xl shadow-2xl animate-in zoom-in-95 duration-300">
                            <div
                                class="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-xl"
                                style="background: linear-gradient(135deg, { relationColor }, #7c3aed);"
                            >
                                <Sparkles size={ 32 } class="text-white" />
                            </div>

                            <div class="space-y-2">
                                <h3 class="text-2xl font-black tracking-tight text-stone-900 dark:text-white">
                                    Fin de la Proyección
                                </h3>

                                <p class="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                                    Has revivido todos los momentos disponibles en <span class="font-bold text-stone-900 dark:text-white">"{ memory.title }"</span>.
                                </p>
                            </div>

                            <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onclick={ restartCinema }
                                    class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white text-xs font-black shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                    style="background: linear-gradient(135deg, { relationColor }, #9333ea);"
                                >
                                    <RotateCcw size={ 16 } />
                                    <span>Repetir Proyección</span>
                                </button>

                                <button
                                    type="button"
                                    onclick={ handleClose }
                                    class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-stone-900/5 hover:bg-stone-900/10 dark:bg-white/10 dark:hover:bg-white/20 text-stone-800 dark:text-white text-xs font-bold border border-stone-200/80 dark:border-white/15 active:scale-95 transition-all cursor-pointer"
                                >
                                    <X size={ 16 } />
                                    <span>Salir de Modo Cine</span>
                                </button>
                            </div>
                        </div>
                    {:else if currentMoment}
                        <!-- Diapositiva del Momento Actual -->
                        <div class="relative w-full h-full flex flex-col items-center justify-center animate-in fade-in-0 duration-300">
                            <!-- Overlay de Protección Antirrobo al Perder Foco (Blur/Obscured) -->
                            {#if isObscured && currentMoment.metadata?.is_temporal}
                                <div class="absolute inset-0 z-40 rounded-3xl bg-stone-950/95 backdrop-blur-3xl flex flex-col items-center justify-center text-center p-8 space-y-4">
                                    <EyeOff size={ 48 } class="text-rose-500 animate-pulse" />

                                    <div class="space-y-1">
                                        <h4 class="text-lg font-bold text-white">Contenido Efímero Oculto</h4>

                                        <p class="text-xs text-stone-400 max-w-sm">
                                             La proyección se protegió automáticamente al cambiar de ventana para evitar capturas no autorizadas.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onclick={ handleResumeFromObscured }
                                        class="px-6 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-lg transition-transform active:scale-95 cursor-pointer"
                                    >
                                        Continuar Proyección
                                    </button>
                                </div>
                            {/if}

                            <!-- Overlay de Bloqueo por Contraseña en Vivo -->
                            {#if isCurrentLocked}
                                <div class="w-full max-w-md p-8 rounded-3xl bg-white/95 dark:bg-stone-900/90 border border-purple-500/30 backdrop-blur-xl shadow-2xl text-center space-y-5">
                                    <div class="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center border border-purple-500/30">
                                        <Lock size={ 26 } />
                                    </div>

                                    <div class="space-y-1">
                                        <h4 class="text-base font-bold text-stone-900 dark:text-white">Momento Protegido con Contraseña</h4>

                                        <p class="text-xs text-stone-500 dark:text-stone-400">
                                            Este momento es confidencial. Ingresa la clave para continuar la proyección.
                                        </p>
                                    </div>

                                    <form onsubmit={ handleUnlockSubmit } class="space-y-3">
                                        <input
                                            type="password"
                                            bind:value={ passwordInput }
                                            placeholder="Ingresa la clave..."
                                            class="w-full px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-black/50 border border-stone-200 dark:border-white/15 text-sm font-semibold text-center text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-hidden focus:border-purple-500"
                                        />

                                        {#if passwordError}
                                            <p class="text-xs text-rose-500 font-medium">{ passwordError }</p>
                                        {/if}

                                        <div class="flex items-center gap-2 pt-1">
                                            <button
                                                type="submit"
                                                class="flex-1 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-lg"
                                            >
                                                Desbloquear y Continuar
                                            </button>

                                            <button
                                                type="button"
                                                onclick={ nextSlide }
                                                class="px-4 py-2.5 rounded-2xl bg-stone-900/5 hover:bg-stone-900/10 dark:bg-white/10 dark:hover:bg-white/20 text-stone-700 dark:text-stone-300 text-xs font-bold transition-all cursor-pointer"
                                            >
                                                Saltar
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            {:else}
                                <!-- Contenido Visible Desbloqueado con Animación de Entrada Fluida -->
                                {#key currentIndex}
                                    <div class="w-full h-full flex flex-col items-center justify-center max-h-[75vh] animate-in fade-in-0 duration-500 ease-out">
                                        <!-- Momento Efímero con Barra de Cuenta Regresiva de Fuego -->
                                        {#if currentMoment.metadata?.is_temporal}
                                            <div class="w-full max-w-xl mb-4 px-2 animate-in fade-in-0 duration-300">
                                                <MomentCountdownProgress
                                                    secondsLeft={ timerSecondsLeft }
                                                    progressPercent={ timerPercent }
                                                />
                                            </div>
                                        {/if}

                                        <!-- Renderizado según Formato -->
                                        {#if getMomentPrimaryType( currentMoment ) === 'image' && currentMoment.metadata?.url}
                                            <div
                                                class="relative max-h-[68vh] w-auto max-w-full rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center border border-stone-200/50 dark:border-white/10 animate-in fade-in-0 zoom-in-95 duration-500 ease-out"
                                                oncontextmenu={ ( e: MouseEvent ) => { if ( currentMoment.metadata?.is_temporal ) e.preventDefault(); } }
                                            >
                                                {#if currentMoment.metadata?.is_temporal}
                                                    <SecureEphemeralMedia
                                                        imageUrl={ currentMoment.metadata.url }
                                                        alt={ currentMoment.title || 'Foto de recuerdo' }
                                                        isEphemeral={ true }
                                                        {isObscured}
                                                        fit="contain"
                                                        watermarkText={`${ memoriesStore.currentUser.name } • Confidencial`}
                                                    />
                                                {:else}
                                                    <img
                                                        src={ currentMoment.metadata.url }
                                                        alt={ currentMoment.title || 'Recuerdo' }
                                                        class="max-h-[68vh] w-auto max-w-full object-contain rounded-3xl transition-transform duration-8000 ease-out { cinemaConfig.ken_burns_effect ? 'scale-105' : '' }"
                                                    />
                                                {/if}
                                            </div>
                                        {:else if getMomentPrimaryType( currentMoment ) === 'video' && currentMoment.metadata?.url}
                                            <div class="relative max-h-[68vh] w-auto max-w-full rounded-3xl overflow-hidden shadow-2xl bg-black border border-stone-200/50 dark:border-white/10 animate-in fade-in-0 zoom-in-95 duration-500 ease-out">
                                                <!-- svelte-ignore a11y_media_has_caption -->
                                                <video
                                                    src={ currentMoment.metadata.url }
                                                    controls
                                                    autoplay
                                                    class="max-h-[68vh] w-auto max-w-full object-contain rounded-3xl"
                                                    onplay={ () => ( isMediaPlaying = true ) }
                                                    onpause={ () => ( isMediaPlaying = false ) }
                                                    onended={ () => { isMediaPlaying = false; if ( cinemaConfig.timer ) nextSlide(); } }
                                                ></video>
                                            </div>
                                        {:else if getMomentPrimaryType( currentMoment ) === 'voice' && currentMoment.metadata?.url}
                                            <div class="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-white/15 backdrop-blur-xl shadow-2xl space-y-4 text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
                                                <div class="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                                                    <Headphones size={ 30 } />
                                                </div>

                                                <h4 class="text-lg font-bold text-stone-900 dark:text-white">{ currentMoment.title || 'Nota de Voz' }</h4>

                                                <AudioPlayer
                                                    src={ currentMoment.metadata.url }
                                                    duration={ currentMoment.metadata.audioDuration || 0 }
                                                    relationColor={ hexColor }
                                                    onPlayStateChange={ ( playing: boolean ) => ( isMediaPlaying = playing ) }
                                                />
                                            </div>
                                        {:else}
                                            <!-- Dedicatoria o Frase de Texto -->
                                            <div
                                                class="w-full max-w-2xl p-8 sm:p-12 rounded-3xl border backdrop-blur-2xl shadow-2xl text-center space-y-6 relative overflow-hidden transition-all duration-500 animate-in fade-in-0 slide-in-from-bottom-5 ease-out"
                                                style="background: { isDark ? `radial-gradient(circle at 50% 0%, ${ hexColor }35 0%, #150f1f 85%)` : `radial-gradient(circle at 50% 0%, ${ hexColor }20 0%, #ffffffea 80%)` }; border-color: { hexColor }40; box-shadow: 0 20px 50px -10px { hexColor }25;"
                                            >
                                                <span class="text-6xl font-serif text-stone-300 dark:text-white/20 select-none block leading-none animate-text-reveal" style="color: { hexColor }40;">“</span>

                                                <p class="text-lg sm:text-2xl font-serif font-medium text-stone-900 dark:text-white/95 leading-relaxed -mt-4 italic">
                                                    {#each ( currentMoment.content || currentMoment.title || '' ).split( ' ' ) as word, i}
                                                        <span class="animate-word" style="animation-delay: { Math.min( 1800, i * 85 ) }ms;">{ word }&nbsp;</span>
                                                    {/each}
                                                </p>

                                                {#if currentMoment.author}
                                                    <div class="pt-4 border-t border-stone-200/60 dark:border-white/10 flex items-center justify-center gap-2 animate-text-reveal" style="animation-delay: 450ms;">
                                                        <span class="size-2 rounded-full" style="background-color: { hexColor };"></span>

                                                        <span class="text-xs font-bold text-stone-600 dark:text-stone-300 uppercase tracking-widest">{ currentMoment.author }</span>
                                                    </div>
                                                {/if}
                                            </div>
                                        {/if}

                                        <!-- Título / Pie de diapositiva (si tiene foto o video y título descriptivo) -->
                                        {#if currentMoment.title && getMomentPrimaryType( currentMoment ) !== 'dedication' && getMomentPrimaryType( currentMoment ) !== 'voice'}
                                            <div class="mt-4 text-center max-w-xl animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-150">
                                                <h4 class="text-base font-bold text-stone-900 dark:text-white drop-shadow-xs animate-text-reveal" style="animation-delay: 150ms;">
                                                    { currentMoment.title }
                                                </h4>

                                                {#if currentMoment.content}
                                                    <p class="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 mt-0.5 animate-text-reveal" style="animation-delay: 350ms;">
                                                        { currentMoment.content }
                                                    </p>
                                                {/if}
                                            </div>
                                        {/if}
                                    </div>
                                {/key}
                            {/if}
                        </div>
                    {/if}

                    <!-- Botones Laterales de Navegación Flotantes (Anterior / Siguiente) -->
                    {#if playableMoments.length > 1 && !isFinished}
                        <button
                            type="button"
                            onclick={ prevSlide }
                            disabled={ currentIndex === 0 }
                            class="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 size-12 sm:size-14 rounded-2xl text-stone-900 dark:text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 hover:scale-110 cursor-pointer disabled:opacity-20 disabled:scale-95 disabled:pointer-events-none z-20 { isControlsVisible || isPaused ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none' }"
                            style="background: linear-gradient(135deg, { hexColor }35 0%, { hexColor }18 100%); border: 1.5px solid { hexColor }60; box-shadow: 0 0 25px -2px { hexColor }50;"
                            aria-label="Momento anterior"
                        >
                            <ChevronLeft size={ 28 } class="drop-shadow-sm" />
                        </button>

                        <button
                            type="button"
                            onclick={ nextSlide }
                            class="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 size-12 sm:size-14 rounded-2xl text-stone-900 dark:text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 hover:scale-110 cursor-pointer z-20 { isControlsVisible || isPaused ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none' }"
                            style="background: linear-gradient(135deg, { hexColor }35 0%, { hexColor }18 100%); border: 1.5px solid { hexColor }60; box-shadow: 0 0 25px -2px { hexColor }50;"
                            aria-label="Siguiente momento"
                        >
                            <ChevronRight size={ 28 } class="drop-shadow-sm" />
                        </button>
                    {/if}
                </main>

                <!-- 3. Tira de Película (Filmstrip) Inferior Retráctil -->
                <footer
                    class="relative z-30 w-full px-6 py-3 bg-linear-to-t from-white/95 via-white/60 to-transparent dark:from-black/90 dark:via-black/50 dark:to-transparent flex flex-col items-center transition-all duration-300 { isControlsVisible || isFilmstripOpen || isPaused ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none' }"
                >
                    <!-- Botón para alternar la Tira de Película -->
                    {#if playableMoments.length > 1 && !isFinished}
                        <div class="mb-2">
                            <button
                                type="button"
                                onclick={ () => ( isFilmstripOpen = !isFilmstripOpen ) }
                                class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer backdrop-blur-md shadow-xs"
                                style="background: { isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }; border: 1px solid { hexColor }50; color: { isDark ? '#e7e5e4' : '#292524' };"
                            >
                                <span>{ isFilmstripOpen ? 'Ocultar miniaturas' : 'Ver todas las miniaturas' }</span>
                                <span style="color: { hexColor }; font-size: 10px;">{ isFilmstripOpen ? '▲' : '▼' }</span>
                            </button>
                        </div>

                        <!-- Carril de Miniaturas -->
                        {#if isFilmstripOpen}
                            <div class="flex items-center gap-2 overflow-x-auto max-w-4xl py-2 px-4 no-scrollbar animate-in slide-in-from-bottom-2 duration-300">
                                {#each playableMoments as item, idx ( item.id )}
                                    <button
                                        type="button"
                                        onclick={ () => goToSlide( idx ) }
                                        class="relative shrink-0 size-14 sm:size-16 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer backdrop-blur-md { idx === currentIndex ? 'scale-105 shadow-lg' : 'border-stone-200/80 dark:border-white/20 opacity-60 hover:opacity-100 bg-white/60 dark:bg-stone-900/60' }"
                                        style={ idx === currentIndex ? `border-color: ${ hexColor }; box-shadow: 0 0 18px ${ hexColor }80; background: ${ isDark ? '#1c1917' : '#ffffff' };` : '' }
                                    >
                                        {#if item.metadata?.url && getMomentPrimaryType( item ) === 'image'}
                                            <img
                                                src={ item.metadata.url }
                                                alt={ item.title || 'Miniatura' }
                                                class="w-full h-full object-cover"
                                            />
                                        {:else}
                                            <div class="w-full h-full flex items-center justify-center { idx === currentIndex ? 'text-stone-800 dark:text-stone-200' : 'text-stone-400 dark:text-stone-400' }">
                                                {#if getMomentPrimaryType( item ) === 'video'}
                                                    <VideoIcon size={ 20 } class="text-purple-500" />
                                                {:else if getMomentPrimaryType( item ) === 'voice'}
                                                    <Headphones size={ 20 } class="text-emerald-500" />
                                                {:else}
                                                    <FileText size={ 20 } class="text-amber-500" />
                                                {/if}
                                            </div>
                                        {/if}

                                        {#if item.metadata?.is_temporal}
                                            <span class="absolute top-1.5 right-1.5 size-2 rounded-full bg-rose-500 shadow-xs"></span>
                                        {/if}
                                    </button>
                                {/each}
                            </div>
                        {/if}
                    {/if}
                </footer>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
