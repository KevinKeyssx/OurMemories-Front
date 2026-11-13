<script lang="ts">
	import { onDestroy } from 'svelte';
	import {
		Play,
		Pause,
		Headphones,
		Volume2,
		VolumeX,
		RotateCcw,
		RotateCw
	} from '@lucide/svelte';
	import Tooltip from '$lib/components/shared/Tooltip.svelte';

	interface Props {
		src                : string;
		title?             : string;
		duration?          : number;
		relationColor?     : string;
		volumeOrientation ?: 'horizontal' | 'vertical';
		isExternalPaused?  : boolean;
		resetTrigger?      : number;
		autoplayTrigger?   : number;
		onPlayStateChange? : ( isPlaying: boolean ) => void;
		class?             : string;
	}

	let {
		src,
		title = 'Nota de Voz',
		duration = 0,
		relationColor = '#f43f5e',
		volumeOrientation = 'horizontal',
		isExternalPaused = false,
		resetTrigger = 0,
		autoplayTrigger = 0,
		onPlayStateChange,
		class: customClass = ''
	}: Props = $props();

	let audioEl           = $state<HTMLAudioElement | null>( null );
	let isPlaying         = $state<boolean>( false );
	let currentTime       = $state<number>( 0 );
	let totalDuration     = $state<number>( 0 );
	let volume            = $state<number>( 1 );
	let isMuted           = $state<boolean>( false );
	let showVolSlider     = $state<boolean>( false );
	let volumeContainerEl = $state<HTMLElement | null>( null );

	$effect( () => {
		if ( duration ) {
			totalDuration = duration;
		}
	} );

	// Reaccionar a pausas externas (ej. cuando se oculta o expira una tarjeta efímera)
	$effect( () => {
		if ( isExternalPaused && isPlaying ) {
			if ( audioEl ) {
				audioEl.pause();
			}
			isPlaying = false;
			onPlayStateChange?.( false );
		}
	} );

	// Reiniciar audio a 00:00 y pausar al disparar resetTrigger (ej. fin de timer o replay Super Admin)
	$effect( () => {
		if ( resetTrigger > 0 ) {
			if ( audioEl ) {
				audioEl.pause();
				audioEl.currentTime = 0;
			}
			currentTime = 0;
			isPlaying = false;
			onPlayStateChange?.( false );
		}
	} );

	// Iniciar reproducción automática de audio al disparar autoplayTrigger (ej. replay Super Admin)
	$effect( () => {
		if ( autoplayTrigger > 0 && audioEl ) {
			audioEl.currentTime = 0;
			currentTime = 0;
			audioEl.play().then( () => {
				isPlaying = true;
				onPlayStateChange?.( true );
			} ).catch( ( err ) => {
				console.error( 'Error al autoreproducir audio:', err );
				isPlaying = false;
				onPlayStateChange?.( false );
			} );
		}
	} );

	// Recargar y sincronizar audio automáticamente al cambiar src
	$effect( () => {
		if ( audioEl && src ) {
			audioEl.src = src;
			audioEl.load();
			audioEl.volume = isMuted ? 0 : volume;
			audioEl.muted = isMuted;
			currentTime = 0;
			isPlaying = false;
		}
	} );

	function formatTime( secs: number ): string {
		if ( !secs || isNaN( secs ) || !isFinite( secs ) ) {
			return '00:00';
		}
		const m = Math.floor( secs / 60 );
		const s = Math.floor( secs % 60 );
		return `${ String( m ).padStart( 2, '0' ) }:${ String( s ).padStart( 2, '0' ) }`;
	}

	function togglePlay( e?: MouseEvent ): void {
		if ( e ) {
			e.stopPropagation();
		}

		if ( !audioEl ) {
			return;
		}

		if ( isPlaying ) {
			audioEl.pause();
			isPlaying = false;
			onPlayStateChange?.( false );
		} else {
			if ( audioEl.ended || ( totalDuration > 0 && audioEl.currentTime >= totalDuration ) ) {
				audioEl.currentTime = 0;
				currentTime = 0;
			}
			audioEl.play().then( () => {
				isPlaying = true;
				onPlayStateChange?.( true );
			} ).catch( ( err ) => {
				console.error( 'Error al reproducir audio:', err );
				isPlaying = false;
				onPlayStateChange?.( false );
			} );
		}
	}

	function handleSeek( e: Event ): void {
		const target = e.target as HTMLInputElement;
		const newTime = parseFloat( target.value );
		currentTime = newTime;
		if ( audioEl ) {
			audioEl.currentTime = newTime;
		}
	}

	function skipSeconds( delta: number, e?: MouseEvent ): void {
		if ( e ) {
			e.stopPropagation();
		}
		if ( audioEl ) {
			const targetTime = Math.max( 0, Math.min( totalDuration, audioEl.currentTime + delta ) );
			audioEl.currentTime = targetTime;
			currentTime = targetTime;
		}
	}

	function toggleMute( e?: MouseEvent ): void {
		if ( e ) {
			e.stopPropagation();
		}
		isMuted = !isMuted;
		if ( audioEl ) {
			audioEl.muted = isMuted;
		}
	}

	function handleVolumeChange( e: Event ): void {
		const target = e.target as HTMLInputElement;
		const newVol = parseFloat( target.value );
		volume = newVol;
		isMuted = newVol === 0;
		if ( audioEl ) {
			audioEl.volume = newVol;
			audioEl.muted = isMuted;
		}
	}

	function handleTimeUpdate(): void {
		if ( audioEl ) {
			currentTime = audioEl.currentTime;
		}
	}

	function handleLoadedMetadata(): void {
		if ( audioEl && audioEl.duration && isFinite( audioEl.duration ) ) {
			totalDuration = audioEl.duration;
		}
	}

	function handleEnded(): void {
		isPlaying = false;
		currentTime = 0;
		if ( audioEl ) {
			audioEl.currentTime = 0;
		}
		onPlayStateChange?.( false );
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
		if ( audioEl ) {
			audioEl.pause();
		}
	} );
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	onclick={ ( e: MouseEvent ) => e.stopPropagation() }
	class="relative w-full p-4 rounded-2xl bg-white/80 dark:bg-white/4 border border-stone-200/80 dark:border-white/10 shadow-lg backdrop-blur-xl flex flex-col gap-3 transition-all select-none { customClass }"
>
	<audio
		bind:this={ audioEl }
		{src}
		preload="metadata"
		ontimeupdate={ handleTimeUpdate }
		onloadedmetadata={ handleLoadedMetadata }
		onended={ handleEnded }
	></audio>

	<!-- Fila Superior: Icono de Auriculares, Título y Control de Volumen -->
	<div class="flex items-center justify-between gap-3">
		<div class="flex items-center gap-2.5 truncate">
			<div
				class="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md shrink-0 transition-transform hover:scale-105 duration-300"
				style="background: linear-gradient(135deg, { relationColor }, { relationColor }cc); box-shadow: 0 4px 14px -2px { relationColor }55;"
			>
				<Headphones size={ 18 } />
			</div>
			<div class="truncate">
				<div class="flex items-center gap-1.5">
					<h4 class="text-xs font-black text-stone-900 dark:text-white truncate">
						{ title }
					</h4>
					{#if isPlaying}
						<!-- Mini ecualizador que baila en tiempo real -->
						<Tooltip text="Reproduciendo nota de voz" side="top" sideOffset={ 6 }>
							<div class="flex items-end gap-0.5 h-3.5 px-1 py-0.5">
								<span class="w-0.5 rounded-full animate-eq-bar-1" style="background: { relationColor };"></span>
								<span class="w-0.5 rounded-full animate-eq-bar-2" style="background: { relationColor };"></span>
								<span class="w-0.5 rounded-full animate-eq-bar-3" style="background: { relationColor };"></span>
							</div>
						</Tooltip>
					{/if}
				</div>
				<span class="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
					Audio compartido
				</span>
			</div>
		</div>

		<!-- Control de Volumen Desplegable -->
		<div
			bind:this={ volumeContainerEl }
			onfocusout={ handleVolumeBlur }
			class="relative flex items-center gap-1.5"
		>
			{#if showVolSlider}
				{#if volumeOrientation === 'vertical'}
					<!-- Slider Vertical (ideal para tarjetas, abre hacia abajo para evitar overflow-hidden) -->
					<div
						class="absolute top-full right-0 mt-2 p-2.5 rounded-2xl bg-stone-900/95 dark:bg-black/95 text-white border border-white/20 shadow-2xl flex flex-col items-center gap-2 z-50 animate-in fade-in-0 zoom-in-95 duration-200"
					>
						<span class="text-[10px] font-mono text-stone-300">
							{ Math.round( ( isMuted ? 0 : volume ) * 100 ) }%
						</span>
						<input
							type="range"
							min="0"
							max="1"
							step="0.05"
							value={ isMuted ? 0 : volume }
							oninput={ handleVolumeChange }
							style="writing-mode: vertical-lr; direction: rtl;"
							class="w-1.5 h-20 accent-brand-accent cursor-pointer"
						/>
					</div>
				{:else}
					<!-- Slider Horizontal (por defecto para vistas amplias) -->
					<div
						class="flex items-center gap-1.5 animate-in fade-in-0 duration-200 bg-stone-100 dark:bg-black/40 px-2 py-1 rounded-xl border border-stone-200 dark:border-white/10"
					>
						<input
							type="range"
							min="0"
							max="1"
							step="0.05"
							value={ isMuted ? 0 : volume }
							oninput={ handleVolumeChange }
							class="w-16 h-1 accent-brand-accent cursor-pointer"
						/>
					</div>
				{/if}
			{/if}

			<Tooltip
				text={ isMuted || volume === 0 ? 'Activar sonido' : 'Ajustar volumen' }
				side="top"
				sideOffset={ 6 }
			>
				<button
					type="button"
					onclick={ ( e: MouseEvent ) => {
						e.stopPropagation();
						showVolSlider = !showVolSlider;
					} }
					class="p-1.5 rounded-xl text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
					aria-label={ isMuted || volume === 0 ? 'Activar sonido' : 'Ajustar volumen' }
				>
					{#if isMuted || volume === 0}
						<VolumeX size={ 16 } class="text-rose-500" />
					{:else}
						<Volume2 size={ 16 } />
					{/if}
				</button>
			</Tooltip>
		</div>
	</div>

	<!-- Fila Central: Scrubber de Progreso y Tiempos -->
	<div class="flex flex-col gap-1 w-full">
		<input
			type="range"
			min="0"
			max={ totalDuration || 100 }
			step="0.1"
			value={ currentTime }
			oninput={ handleSeek }
			class="w-full accent-brand-accent h-2 bg-stone-200 dark:bg-white/10 rounded-lg cursor-pointer"
		/>

		<div class="flex items-center justify-between text-[11px] font-mono font-bold text-stone-500 dark:text-stone-400">
			<span>{ formatTime( currentTime ) }</span>
			<span>{ formatTime( totalDuration ) }</span>
		</div>
	</div>

	<!-- Fila Inferior: Botones de Acción (Retroceder 10s, Play/Pause, Avanzar 10s) -->
	<div class="flex items-center justify-center gap-3 pt-1">
		<Tooltip text="Retroceder 10 segundos" side="top" sideOffset={ 6 }>
			<button
				type="button"
				onclick={ ( e: MouseEvent ) => skipSeconds( -10, e ) }
				class="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/5 active:scale-90 transition-all cursor-pointer"
				aria-label="Retroceder 10 segundos"
			>
				<RotateCcw size={ 15 } />
			</button>
		</Tooltip>

		<Tooltip text={ isPlaying ? 'Pausar nota de voz' : 'Reproducir nota de voz' } side="top" sideOffset={ 6 }>
			<button
				type="button"
				onclick={ togglePlay }
				class="size-11 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-all cursor-pointer hover:brightness-110"
				style="background: { relationColor }; box-shadow: 0 6px 20px -4px { relationColor }66;"
				aria-label={ isPlaying ? 'Pausar audio' : 'Reproducir audio' }
			>
				{#if isPlaying}
					<Pause size={ 18 } class="fill-current" />
				{:else}
					<Play size={ 18 } class="fill-current ml-0.5" />
				{/if}
			</button>
		</Tooltip>

		<Tooltip text="Adelantar 10 segundos" side="top" sideOffset={ 6 }>
			<button
				type="button"
				onclick={ ( e: MouseEvent ) => skipSeconds( 10, e ) }
				class="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/5 active:scale-90 transition-all cursor-pointer"
				aria-label="Adelantar 10 segundos"
			>
				<RotateCw size={ 15 } />
			</button>
		</Tooltip>
	</div>
</div>

<style>
	@keyframes eqBar1 {
		0%, 100% { height: 3px; }
		50% { height: 13px; }
	}
	@keyframes eqBar2 {
		0%, 100% { height: 11px; }
		50% { height: 4px; }
	}
	@keyframes eqBar3 {
		0%, 100% { height: 5px; }
		50% { height: 12px; }
	}

	.animate-eq-bar-1 { animation: eqBar1 0.65s ease-in-out infinite alternate; }
	.animate-eq-bar-2 { animation: eqBar2 0.5s ease-in-out infinite alternate; }
	.animate-eq-bar-3 { animation: eqBar3 0.75s ease-in-out infinite alternate; }
</style>
