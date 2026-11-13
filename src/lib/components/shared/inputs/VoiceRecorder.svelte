<script lang="ts">
	import { onDestroy } from 'svelte';
	import {
		Mic,
		Square,
		Play,
		Pause,
		RotateCcw,
		Trash2,
		UploadCloud,
		Volume2,
		Headphones
	} from '@lucide/svelte';

	interface Props {
		url?            : string;
		audioUrl?       : string;
		audioDuration?  : number;
		color?          : string;
		onAudioChange?  : ( data: { url: string; duration: number } ) => void;
	}

	let {
		url = $bindable( '' ),
		audioUrl = $bindable( '' ),
		audioDuration = $bindable( 0 ),
		color = '#f43f5e',
		onAudioChange
	}: Props = $props();

	type RecorderStatus = 'idle' | 'recording' | 'recorded';

	const activeAudioUrl  = $derived<string>( url || audioUrl || '' );
	let recorderStatus    = $state<RecorderStatus>( ( url || audioUrl ) ? 'recorded' : 'idle' );
	let recordingSeconds  = $state<number>( 0 );
	let recordingTimer    = $state<ReturnType<typeof setInterval> | null>( null );
	let isPlayingPreview  = $state<boolean>( false );
	let previewCurrentSec = $state<number>( 0 );
	let errorMessage      = $state<string>( '' );

	let mediaRecorder: MediaRecorder | null       = null;
	let audioChunks: Blob[]                       = [];
	let audioStream: MediaStream | null           = null;
	let previewAudio      = $state<HTMLAudioElement | null>( null );
	let fileInputRef      = $state<HTMLInputElement | null>( null );

	function formatTime( secs: number ): string {
		const m = Math.floor( secs / 60 );
		const s = Math.floor( secs % 60 );
		return `${ String( m ).padStart( 2, '0' ) }:${ String( s ).padStart( 2, '0' ) }`;
	}

	async function startRecording(): Promise<void> {
		errorMessage = '';
		if ( typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia ) {
			errorMessage = 'Tu navegador no soporta grabación de audio directa.';
			return;
		}

		try {
			audioStream = await navigator.mediaDevices.getUserMedia( {
				audio: {
					echoCancellation : true,
					noiseSuppression : true,
					autoGainControl  : true
				}
			} );
			audioChunks = [];

			let mimeType = '';
			if ( typeof MediaRecorder !== 'undefined' ) {
				if ( MediaRecorder.isTypeSupported( 'audio/webm' ) ) {
					mimeType = 'audio/webm';
				} else if ( MediaRecorder.isTypeSupported( 'audio/mp4' ) ) {
					mimeType = 'audio/mp4';
				} else if ( MediaRecorder.isTypeSupported( 'audio/ogg' ) ) {
					mimeType = 'audio/ogg';
				}
			}

			mediaRecorder = mimeType
				? new MediaRecorder( audioStream, { mimeType } )
				: new MediaRecorder( audioStream );

			mediaRecorder.ondataavailable = ( e: BlobEvent ) => {
				if ( e.data && e.data.size > 0 ) {
					audioChunks.push( e.data );
				}
			};

			mediaRecorder.onstop = () => {
				const blobType = mimeType || mediaRecorder?.mimeType?.split( ';' )[ 0 ] || 'audio/webm';
				const audioBlob = new Blob( audioChunks, { type: blobType } );
				const finalSeconds = Math.max( 1, recordingSeconds );
				const reader = new FileReader();

				reader.onloadend = () => {
					const base64Audio = reader.result as string;
					url = base64Audio;
					audioUrl = base64Audio;
					audioDuration = finalSeconds;
					recorderStatus = 'recorded';
					initPreview( base64Audio );
					onAudioChange?.( { url: base64Audio, duration: finalSeconds } );
				};

				reader.readAsDataURL( audioBlob );

				if ( audioStream ) {
					audioStream.getTracks().forEach( ( track: MediaStreamTrack ) => track.stop() );
					audioStream = null;
				}
			};

			mediaRecorder.start( 200 );
			recorderStatus = 'recording';
			recordingSeconds = 0;

			recordingTimer = setInterval( () => {
				recordingSeconds += 1;
			}, 1000 );
		} catch ( err ) {
			console.error( 'Error al acceder al micrófono:', err );
			errorMessage = 'No se pudo acceder al micrófono. Por favor verifica los permisos.';
			recorderStatus = 'idle';
		}
	}

	function stopRecording(): void {
		if ( recordingTimer ) {
			clearInterval( recordingTimer );
			recordingTimer = null;
		}

		if ( mediaRecorder && mediaRecorder.state !== 'inactive' ) {
			try {
				mediaRecorder.requestData();
			} catch {}
			mediaRecorder.stop();
		}
	}

	function initPreview( src: string ): void {
		if ( previewAudio ) {
			previewAudio.pause();
			previewAudio = null;
		}

		previewAudio = new Audio( src );

		previewAudio.ontimeupdate = () => {
			if ( previewAudio ) {
				previewCurrentSec = previewAudio.currentTime;
			}
		};

		previewAudio.onended = () => {
			isPlayingPreview = false;
			previewCurrentSec = 0;
			if ( previewAudio ) {
				previewAudio.currentTime = 0;
			}
		};

		previewAudio.onloadedmetadata = () => {
			if ( previewAudio && previewAudio.duration && isFinite( previewAudio.duration ) ) {
				if ( !audioDuration || audioDuration === 0 ) {
					audioDuration = Math.round( previewAudio.duration );
				}
			}
		};
	}

	function togglePlayPreview(): void {
		const src = url || audioUrl;
		if ( !previewAudio ) {
			if ( src ) {
				initPreview( src );
			} else {
				return;
			}
		}

		if ( isPlayingPreview ) {
			previewAudio?.pause();
			isPlayingPreview = false;
		} else {
			if ( previewAudio ) {
				if ( previewAudio.ended || previewAudio.currentTime >= previewAudio.duration ) {
					previewAudio.currentTime = 0;
				}
				previewAudio.play().then( () => {
					isPlayingPreview = true;
				} ).catch( ( err ) => {
					console.error( 'Error reproduciendo preview:', err );
					isPlayingPreview = false;
				} );
			}
		}
	}

	function seekPreview( e: Event ): void {
		const target = e.target as HTMLInputElement;
		const newTime = parseFloat( target.value );
		previewCurrentSec = newTime;
		if ( previewAudio ) {
			previewAudio.currentTime = newTime;
		}
	}

	function resetRecording(): void {
		if ( previewAudio ) {
			previewAudio.pause();
			previewAudio = null;
		}
		isPlayingPreview = false;
		previewCurrentSec = 0;
		recordingSeconds = 0;
		audioChunks = [];
		url = '';
		audioUrl = '';
		audioDuration = 0;
		recorderStatus = 'idle';
		onAudioChange?.( { url: '', duration: 0 } );
	}

	function handleFileUpload( e: Event ): void {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[ 0 ];
		if ( !file ) {
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			const base64Audio = reader.result as string;
			url = base64Audio;
			audioUrl = base64Audio;
			recorderStatus = 'recorded';
			initPreview( base64Audio );
			onAudioChange?.( { url: base64Audio, duration: 0 } );
		};
		reader.readAsDataURL( file );
	}

	$effect( () => {
		const src = url || audioUrl;
		if ( src ) {
			recorderStatus = 'recorded';
			if ( !previewAudio ) {
				initPreview( src );
			}
		} else {
			recorderStatus = 'idle';
			if ( previewAudio ) {
				previewAudio.pause();
				previewAudio = null;
			}
		}
	} );

	onDestroy( () => {
		if ( recordingTimer ) {
			clearInterval( recordingTimer );
		}
		if ( audioStream ) {
			audioStream.getTracks().forEach( ( track: MediaStreamTrack ) => track.stop() );
		}
		if ( previewAudio ) {
			previewAudio.pause();
			previewAudio = null;
		}
	} );
</script>

<div class="w-full flex flex-col gap-3">
	{#if errorMessage}
		<div class="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
			{ errorMessage }
		</div>
	{/if}

	{#if recorderStatus === 'idle'}
		<!-- Modo Inicial: Grabar o Subir Audio -->
		<div class="p-6 rounded-2xl bg-stone-100/80 dark:bg-white/4 border border-stone-200/80 dark:border-white/10 flex flex-col items-center justify-center text-center gap-4 transition-all">
			<div
				class="w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 duration-300"
				style="background: linear-gradient(135deg, { color }, { color }cc); box-shadow: 0 10px 25px -5px { color }40;"
			>
				<Mic size={ 28 } class="text-white" />
			</div>

			<div class="space-y-1">
				<h4 class="text-sm font-bold text-stone-900 dark:text-white">Graba tu nota de voz</h4>
				<p class="text-xs text-stone-500 dark:text-stone-400 max-w-xs">
					Haz clic en grabar para capturar tus palabras o sube un archivo de audio existente.
				</p>
			</div>

			<div class="flex flex-wrap items-center justify-center gap-2.5">
				<button
					type="button"
					onclick={ startRecording }
					class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
					style="background: { color };"
				>
					<Mic size={ 15 } />
					<span>Iniciar Grabación</span>
				</button>

				<button
					type="button"
					onclick={ () => fileInputRef?.click() }
					class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-stone-200/70 dark:bg-white/5 hover:bg-stone-300/70 dark:hover:bg-white/10 text-stone-700 dark:text-stone-300 border border-stone-300/60 dark:border-white/10 active:scale-95 transition-all cursor-pointer"
				>
					<UploadCloud size={ 15 } />
					<span>Subir Audio</span>
				</button>

				<input
					bind:this={ fileInputRef }
					type="file"
					accept="audio/*"
					onchange={ handleFileUpload }
					class="hidden"
				/>
			</div>
		</div>
	{:else if recorderStatus === 'recording'}
		<!-- Modo Grabando Activo -->
		<div class="p-6 rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/30 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in-0 duration-200">
			<!-- Indicador de Pulso y Grabación -->
			<div class="relative flex items-center justify-center">
				<div class="absolute w-20 h-20 rounded-full bg-rose-500/20 animate-ping"></div>
				<div class="w-14 h-14 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 z-10">
					<Mic size={ 26 } class="animate-pulse" />
				</div>
			</div>

			<!-- Contador en Vivo -->
			<div class="space-y-1">
				<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black text-rose-500 bg-rose-500/15 border border-rose-500/25 uppercase tracking-wider">
					<span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
					Grabando audio
				</span>
				<p class="text-2xl font-black tracking-tight text-stone-900 dark:text-white font-mono">
					{ formatTime( recordingSeconds ) }
				</p>
			</div>

			<!-- Ondas Sonoras Dinámicas / Ecualizador en Vivo -->
			<div class="flex items-center justify-center gap-1.5 h-9 px-4 py-1.5 my-1 bg-stone-900/5 dark:bg-white/5 rounded-full">
				{#each [ 0.2, 0.5, 0.9, 0.4, 0.8, 1.1, 0.6, 1.0, 0.3, 0.7, 1.2, 0.5, 0.9, 0.4, 0.7, 0.3 ] as delay, i}
					<div
						class="w-1 rounded-full wave-bar"
						style="background: { color }; animation-delay: { ( i * 0.07 ).toFixed( 2 ) }s; height: { 10 + ( ( i * 3 ) % 16 ) }px;"
					></div>
				{/each}
			</div>

			<!-- Botón para Detener -->
			<button
				type="button"
				onclick={ stopRecording }
				class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-950 text-xs font-bold shadow-lg active:scale-95 transition-all cursor-pointer hover:bg-stone-800 dark:hover:bg-stone-200"
			>
				<Square size={ 14 } class="fill-current" />
				<span>Detener y Guardar</span>
			</button>
		</div>
	{:else if recorderStatus === 'recorded'}
		<!-- Modo Grabado / Preescucha -->
		<div class="p-4 rounded-2xl bg-stone-100/90 dark:bg-white/4 border border-stone-200/80 dark:border-white/10 flex flex-col gap-3">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<div
						class="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
						style="background: { color };"
					>
						<Headphones size={ 18 } />
					</div>
					<div>
						<h4 class="text-xs font-extrabold text-stone-900 dark:text-white">Nota de voz lista</h4>
						<p class="text-[11px] text-stone-500 dark:text-stone-400">
							Duración: { formatTime( audioDuration || previewAudio?.duration || 0 ) }
						</p>
					</div>
				</div>

				<button
					type="button"
					onclick={ resetRecording }
					class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 active:scale-95 transition-colors cursor-pointer"
					title="Descartar y volver a grabar"
				>
					<Trash2 size={ 13 } />
					<span>Descartar</span>
				</button>
			</div>

			<!-- Reproductor de Preview con Scrubber -->
			<div class="flex items-center gap-3 pt-2 border-t border-stone-200/60 dark:border-white/5">
				<button
					type="button"
					onclick={ togglePlayPreview }
					class="size-10 rounded-xl flex items-center justify-center text-white shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
					style="background: { color };"
					aria-label={ isPlayingPreview ? 'Pausar audio' : 'Reproducir audio' }
				>
					{#if isPlayingPreview}
						<Pause size={ 17 } class="fill-current" />
					{:else}
						<Play size={ 17 } class="fill-current ml-0.5" />
					{/if}
				</button>

				<div class="flex-1 flex flex-col gap-1">
					<input
						type="range"
						min="0"
						max={ audioDuration || previewAudio?.duration || 100 }
						step="0.1"
						value={ previewCurrentSec }
						oninput={ seekPreview }
						class="w-full accent-brand-accent h-1.5 bg-stone-200 dark:bg-white/10 rounded-lg cursor-pointer"
					/>
					<div class="flex justify-between text-[10px] font-mono font-medium text-stone-500 dark:text-stone-400">
						<span>{ formatTime( previewCurrentSec ) }</span>
						<span>{ formatTime( audioDuration || previewAudio?.duration || 0 ) }</span>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	@keyframes waveBounce {
		0%, 100% {
			transform: scaleY( 0.25 );
			opacity: 0.45;
		}
		50% {
			transform: scaleY( 1.35 );
			opacity: 1;
		}
	}

	.wave-bar {
		animation: waveBounce 0.85s ease-in-out infinite alternate;
		transform-origin: center;
	}
</style>
