<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import {
		Music,
		Play,
		Pause,
		Volume2,
		VolumeX
	} from '@lucide/svelte';
	import Tooltip from '$lib/components/shared/Tooltip.svelte';

	interface Props {
		videoId            : string;
		isPlaying         ?: boolean;
		initialTime       ?: number;
		isVoicePlaying    ?: boolean;
		relationColor     ?: string;
		volumeOrientation ?: 'horizontal' | 'vertical';
		resetTrigger      ?: number;
		userVolume        ?: number;
		controllerOnly    ?: boolean;
		class             ?: string;
		onTimeUpdate      ?: ( sec: number ) => void;
		onTogglePlay      ?: ( isPlaying: boolean ) => void;
		onVolumeChange    ?: ( volume: number ) => void;
	}

	let {
		videoId,
		isPlaying = false,
		initialTime = 0,
		isVoicePlaying = false,
		relationColor = '#f43f5e',
		volumeOrientation = 'horizontal',
		resetTrigger = 0,
		userVolume = $bindable( 60 ),
		controllerOnly = false,
		class: customClass = '',
		onTimeUpdate,
		onTogglePlay,
		onVolumeChange
	}: Props = $props();

	const uniqueId = `yt-player-${ Math.random().toString( 36 ).substring( 2, 9 ) }`;

	let player                = $state<any>( null );
	let isPlayerReady         = $state<boolean>( false );
	let isMuted               = $state<boolean>( false );
	let showVolSlider         = $state<boolean>( false );
	let volumeContainerEl     = $state<HTMLElement | null>( null );
	let hasSyncedInitialTime  = $state<boolean>( false );
	let lastEmittedTime       = $state<number>( 0 );
	let lastResetTrigger      = 0;
	let timeInterval: ReturnType<typeof setInterval> | null = null;

	function loadYouTubeAPI(): Promise<void> {
		if ( typeof window === 'undefined' ) {
			return Promise.resolve();
		}

		if ( ( window as any ).YT && ( window as any ).YT.Player ) {
			return Promise.resolve();
		}

		return new Promise( ( resolve ) => {
			const existingTag = document.getElementById( 'yt-iframe-api' );
			if ( !existingTag ) {
				const tag = document.createElement( 'script' );
				tag.id = 'yt-iframe-api';
				tag.src = 'https://www.youtube.com/iframe_api';
				document.head.appendChild( tag );
			}

			const prevCallback = ( window as any ).onYouTubeIframeAPIReady;
			( window as any ).onYouTubeIframeAPIReady = () => {
				prevCallback?.();
				resolve();
			};
		} );
	}

	function createPlayer(): void {
		if ( typeof window === 'undefined' || !( window as any ).YT || !videoId ) {
			return;
		}

		const container = document.getElementById( uniqueId );
		if ( !container ) {
			return;
		}

		const startSeconds = initialTime > 0 ? Math.floor( initialTime ) : 0;
		hasSyncedInitialTime = initialTime <= 0;
		lastEmittedTime = initialTime;

		try {
			player = new ( window as any ).YT.Player( uniqueId, {
				height     : '1',
				width      : '1',
				videoId    : videoId,
				playerVars : {
					autoplay       : 0,
					controls       : 0,
					disablekb      : 1,
					fs             : 0,
					modestbranding : 1,
					rel            : 0,
					loop           : 1,
					playlist       : videoId,
					start          : startSeconds
				},
				events: {
					onReady: () => {
						isPlayerReady = true;
						if ( player && player.setVolume ) {
							player.setVolume( isVoicePlaying ? Math.min( 25, userVolume ) : userVolume );
						}
						if ( initialTime > 0 && player && player.seekTo ) {
							player.seekTo( initialTime, true );
						}
						if ( isPlaying ) {
							player.playVideo?.();
						} else {
							player.pauseVideo?.();
						}
					},
					onStateChange: ( event: any ) => {
						// 1 = PLAYING, 2 = PAUSED, 0 = ENDED
						if ( event.data === 1 ) {
							if ( !isPlaying ) {
								player.pauseVideo?.();
								return;
							}
							if ( !hasSyncedInitialTime && initialTime > 0 && player && player.seekTo ) {
								const currentT = player.getCurrentTime?.() || 0;
								if ( Math.abs( currentT - initialTime ) > 1.5 ) {
									player.seekTo( initialTime, true );
								}
								hasSyncedInitialTime = true;
							}
						} else if ( event.data === 0 ) {
							// Repetir en loop automático continuo al terminar
							player.seekTo?.( 0, true );
							if ( isPlaying ) {
								player.playVideo?.();
							}
						}
					}
				}
			} );
		} catch ( err ) {
			console.error( 'Error inicializando YouTube Player:', err );
		}
	}

	onMount( async () => {
		if ( controllerOnly ) {
			return;
		}
		await loadYouTubeAPI();
		createPlayer();
	} );

	// Intervalo para sincronizar el minuto y segundo actual de la canción
	$effect( () => {
		if ( !controllerOnly && isPlaying && isPlayerReady && player ) {
			timeInterval = setInterval( () => {
				if ( player && player.getCurrentTime ) {
					const t = player.getCurrentTime();
					if ( typeof t === 'number' && !isNaN( t ) ) {
						if ( !hasSyncedInitialTime && initialTime > 1.5 ) {
							if ( t >= initialTime - 1.5 ) {
								hasSyncedInitialTime = true;
								lastEmittedTime = t;
								onTimeUpdate?.( t );
							} else {
								player.seekTo?.( initialTime, true );
							}
						} else {
							hasSyncedInitialTime = true;
							lastEmittedTime = t;
							onTimeUpdate?.( t );
						}
					}
				}
			}, 500 );
			return () => {
				if ( timeInterval ) {
					clearInterval( timeInterval );
					timeInterval = null;
				}
			};
		}
	} );

	// Reaccionar a cambios de isPlaying del prop
	$effect( () => {
		if ( controllerOnly || !isPlayerReady || !player ) {
			return;
		}

		if ( isPlaying ) {
			player.playVideo?.();
			if ( !hasSyncedInitialTime && initialTime > 0 && player.seekTo ) {
				const currentT = player.getCurrentTime?.() || 0;
				if ( Math.abs( currentT - initialTime ) > 1.5 ) {
					player.seekTo( initialTime, true );
				}
			}
		} else {
			player.pauseVideo?.();
		}
	} );

	// Si initialTime cambió externamente (ej. al alternar entre dialog y card), sincronizar
	$effect( () => {
		if ( controllerOnly || !isPlayerReady || !player || initialTime <= 0 ) {
			return;
		}

		if ( Math.abs( initialTime - lastEmittedTime ) < 1.0 ) {
			return;
		}

		const currentT = player.getCurrentTime?.() || 0;
		if ( Math.abs( currentT - initialTime ) > 1.5 ) {
			hasSyncedInitialTime = false;
			player.seekTo?.( initialTime, true );
		}
	} );

	// Reiniciar YouTube al inicio (00:00) al activarse resetTrigger
	$effect( () => {
		if ( controllerOnly || !isPlayerReady || !player ) {
			return;
		}
		if ( resetTrigger !== lastResetTrigger && resetTrigger > 0 ) {
			lastResetTrigger = resetTrigger;
			hasSyncedInitialTime = true;
			lastEmittedTime = 0;
			player.seekTo?.( 0, true );
			onTimeUpdate?.( 0 );
			if ( !isPlaying ) {
				player.pauseVideo?.();
			}
		}
	} );

	// Reducción automática de volumen (audio ducking) cuando suena una nota de voz
	$effect( () => {
		if ( controllerOnly || !isPlayerReady || !player ) {
			return;
		}

		if ( isVoicePlaying ) {
			player.setVolume?.( Math.min( 20, Math.round( userVolume * 0.35 ) ) );
		} else {
			player.setVolume?.( userVolume );
		}
	} );

	function togglePlay( e?: MouseEvent | PointerEvent ): void {
		if ( e ) {
			e.stopPropagation();
		}
		const nextState = !isPlaying;
		if ( !controllerOnly && player ) {
			if ( nextState ) {
				player.playVideo?.();
			} else {
				player.pauseVideo?.();
			}
		}
		onTogglePlay?.( nextState );
	}

	function toggleMute( e?: MouseEvent ): void {
		if ( e ) {
			e.stopPropagation();
		}
		isMuted = !isMuted;
		if ( !controllerOnly && player ) {
			if ( isMuted ) {
				player?.mute?.();
			} else {
				player?.unMute?.();
				player?.setVolume?.( userVolume );
			}
		}
		onVolumeChange?.( isMuted ? 0 : userVolume );
	}

	function handleVolumeChange( e: Event ): void {
		const target = e.target as HTMLInputElement;
		const newVol = parseInt( target.value, 10 );
		userVolume = newVol;
		isMuted = newVol === 0;

		if ( !controllerOnly && isPlayerReady && player ) {
			if ( isVoicePlaying ) {
				player.setVolume?.( Math.min( 20, Math.round( newVol * 0.35 ) ) );
			} else {
				player.setVolume?.( newVol );
			}
		}
		onVolumeChange?.( newVol );
	}

	$effect( () => {
		if ( showVolSlider ) {
			const handleClickOutside = ( e: PointerEvent ): void => {
				const target = e.target as HTMLElement;
				if ( volumeContainerEl && !volumeContainerEl.contains( target ) ) {
					showVolSlider = false;
				}
			};

			window.addEventListener( 'pointerdown', handleClickOutside );
			return () => {
				window.removeEventListener( 'pointerdown', handleClickOutside );
			};
		}
	} );

	function handleVolumeBlur( e: FocusEvent ): void {
		const currentTarget = e.currentTarget as HTMLElement;
		const relatedTarget = e.relatedTarget as HTMLElement | null;
		if ( !currentTarget.contains( relatedTarget ) ) {
			showVolSlider = false;
		}
	}

	onDestroy( () => {
		if ( controllerOnly ) {
			return;
		}
		if ( player && player.getCurrentTime ) {
			try {
				const t = player.getCurrentTime();
				if ( typeof t === 'number' && !isNaN( t ) ) {
					if ( t > 0 || lastEmittedTime < 1 ) {
						onTimeUpdate?.( t );
					}
				}
			} catch {}
		}
		if ( timeInterval ) {
			clearInterval( timeInterval );
			timeInterval = null;
		}
		if ( player && player.destroy ) {
			try {
				player.destroy();
			} catch {}
		}
	} );
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	onpointerdown={ ( e: PointerEvent ) => e.stopPropagation() }
	onpointerup={ ( e: PointerEvent ) => e.stopPropagation() }
	onclick={ ( e: MouseEvent ) => e.stopPropagation() }
	class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 dark:bg-black/60 backdrop-blur-md border border-white/15 text-white text-xs font-semibold shadow-md select-none transition-all hover:scale-105 { customClass }"
>
	<!-- Iframe oculto de YouTube para salida de audio -->
	{#if !controllerOnly}
		<div class="sr-only pointer-events-none">
			<div id={ uniqueId }></div>
		</div>
	{/if}

	<!-- Indicador de Música: Icono de Nota Musical o Ecualizador Dinámico -->
	<Tooltip
		text={ isPlaying ? 'Música de fondo activa' : 'Música de fondo en pausa' }
		side="top"
		sideOffset={ 6 }
	>
		<div
			class="size-5 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-transform { isPlaying ? 'scale-105' : 'opacity-80' }"
			style="background: { relationColor };"
		>
			{#if isPlaying}
				<div class="flex items-end gap-0.5 h-2.5 px-0.5">
					<span class="w-0.5 bg-white rounded-full animate-eq-bar-1"></span>
					<span class="w-0.5 bg-white rounded-full animate-eq-bar-2"></span>
					<span class="w-0.5 bg-white rounded-full animate-eq-bar-3"></span>
				</div>
			{:else}
				<Music size={ 11 } class="text-white" />
			{/if}
		</div>
	</Tooltip>

	<!-- Botón Manual Play / Pause -->
	<Tooltip
		text={ isPlaying ? 'Pausar música de fondo' : 'Reproducir música de fondo' }
		side="top"
		sideOffset={ 6 }
	>
		<button
			type="button"
			onpointerdown={ ( e: PointerEvent ) => e.stopPropagation() }
			onpointerup={ ( e: PointerEvent ) => e.stopPropagation() }
			onclick={ togglePlay }
			class="p-0.5 rounded-md hover:bg-white/20 transition-colors cursor-pointer"
			aria-label={ isPlaying ? 'Pausar música de fondo' : 'Reproducir música de fondo' }
		>
			{#if isPlaying}
				<Pause size={ 12 } class="fill-current" />
			{:else}
				<Play size={ 12 } class="fill-current ml-0.5" />
			{/if}
		</button>
	</Tooltip>

	<!-- Control de Volumen Desplegable -->
	<div
		bind:this={ volumeContainerEl }
		onfocusout={ handleVolumeBlur }
		class="relative flex items-center"
	>
		{#if showVolSlider}
			{#if volumeOrientation === 'vertical'}
				<!-- Slider Vertical (ideal para tarjetas, abre hacia abajo para evitar overflow-hidden) -->
				<div
					class="absolute top-full right-0 mt-2 p-2.5 rounded-2xl bg-stone-900/95 dark:bg-black/95 text-white border border-white/20 shadow-2xl flex flex-col items-center gap-2 z-50 animate-in fade-in-0 zoom-in-95 duration-200"
				>
					<span class="text-[10px] font-mono text-stone-300">
						{ isMuted ? 0 : userVolume }%
					</span>
					<input
						type="range"
						min="0"
						max="100"
						step="5"
						value={ isMuted ? 0 : userVolume }
						oninput={ handleVolumeChange }
						style="writing-mode: vertical-lr; direction: rtl;"
						class="w-1.5 h-20 accent-brand-accent cursor-pointer"
					/>
				</div>
			{:else}
				<!-- Slider Horizontal (por defecto para modales/diálogos amplios) -->
				<div
					class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 rounded-xl bg-stone-900/95 dark:bg-black/95 text-white border border-white/20 shadow-2xl flex items-center gap-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-200"
				>
					<input
						type="range"
						min="0"
						max="100"
						step="5"
						value={ isMuted ? 0 : userVolume }
						oninput={ handleVolumeChange }
						class="w-20 h-1.5 accent-brand-accent cursor-pointer"
					/>
					<span class="text-[10px] font-mono text-stone-300 w-6 text-right">
						{ isMuted ? 0 : userVolume }%
					</span>
				</div>
			{/if}
		{/if}

		<Tooltip
			text={ isMuted || userVolume === 0 ? 'Activar sonido' : 'Ajustar volumen' }
			side="top"
			sideOffset={ 6 }
		>
			<button
				type="button"
				onclick={ ( e: MouseEvent ) => {
					e.stopPropagation();
					showVolSlider = !showVolSlider;
				} }
				class="p-0.5 rounded-md hover:bg-white/20 transition-colors cursor-pointer"
				aria-label={ isMuted || userVolume === 0 ? 'Activar sonido' : 'Ajustar volumen' }
			>
				{#if isMuted || userVolume === 0}
					<VolumeX size={ 12 } class="text-rose-400" />
				{:else}
					<Volume2 size={ 12 } />
				{/if}
			</button>
		</Tooltip>
	</div>
</div>

<style>
	@keyframes eqBar1 {
		0%, 100% { height: 2px; }
		50% { height: 10px; }
	}
	@keyframes eqBar2 {
		0%, 100% { height: 9px; }
		50% { height: 3px; }
	}
	@keyframes eqBar3 {
		0%, 100% { height: 4px; }
		50% { height: 10px; }
	}

	.animate-eq-bar-1 { animation: eqBar1 0.65s ease-in-out infinite alternate; }
	.animate-eq-bar-2 { animation: eqBar2 0.5s ease-in-out infinite alternate; }
	.animate-eq-bar-3 { animation: eqBar3 0.75s ease-in-out infinite alternate; }
</style>

