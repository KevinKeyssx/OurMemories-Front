<script lang="ts">
	import { onMount } from 'svelte';
	import { Download, Copy, Check, Share2 } from '@lucide/svelte';
	import QRCodeStyling from 'qr-code-styling';

	interface Props {
		value       : string;
		color      ?: string;
		size       ?: number;
		filename   ?: string;
		showActions?: boolean;
	}

	let {
		value,
		color = '#f43f5e',
		size = 200,
		filename = 'invitacion-ourmemories',
		showActions = true
	}: Props = $props();

	let containerRef   = $state<HTMLDivElement | null>( null );
	let qrCodeInstance = $state<QRCodeStyling | null>( null );
	let isCopied       = $state<boolean>( false );

	function initQRCode(): void {
		if ( typeof window === 'undefined' || !containerRef ) {
			return;
		}

		qrCodeInstance = new QRCodeStyling({
			width                : size,
			height               : size,
			type                 : 'canvas',
			data                 : value,
			margin               : 8,
			dotsOptions          : {
				color : color,
				type  : 'rounded'
			},
			backgroundOptions    : {
				color : '#ffffff'
			},
			cornersSquareOptions : {
				color : color,
				type  : 'extra-rounded'
			},
			cornersDotOptions    : {
				color : color,
				type  : 'dot'
			}
		});

		containerRef.innerHTML = '';
		qrCodeInstance.append( containerRef );
	}

	onMount( () => {
		initQRCode();
	} );

	$effect( () => {
		if ( qrCodeInstance && value ) {
			qrCodeInstance.update({
				data                 : value,
				dotsOptions          : {
					color : color,
					type  : 'rounded'
				},
				cornersSquareOptions : {
					color : color,
					type  : 'extra-rounded'
				},
				cornersDotOptions    : {
					color : color,
					type  : 'dot'
				}
			});
		}
	} );

	function handleCopy(): void {
		if ( typeof navigator !== 'undefined' && navigator.clipboard ) {
			navigator.clipboard.writeText( value );
			isCopied = true;
			setTimeout( () => {
				isCopied = false;
			}, 2500 );
		}
	}

	function handleDownload(): void {
		if ( qrCodeInstance ) {
			qrCodeInstance.download({
				name      : filename,
				extension : 'png'
			});
		}
	}

	function handleShareWhatsApp(): void {
		const message = `¡Hola! Te invito a unirte a nuestro espacio de recuerdos en OurMemories: ${ value }`;
		const waUrl = `https://wa.me/?text=${ encodeURIComponent( message ) }`;
		window.open( waUrl, '_blank' );
	}
</script>

<div class="flex flex-col items-center gap-4">
	<!-- Marco visual decorado para el código QR -->
	<div
		class="p-4 rounded-3xl bg-white shadow-xl border-4 transition-all duration-300 hover:scale-[1.02]"
		style="border-color: { color }33;"
	>
		<div bind:this={ containerRef } class="overflow-hidden rounded-2xl flex items-center justify-center"></div>
	</div>

	{#if showActions}
		<!-- Botones de Acción: WhatsApp, Copiar Enlace y Descargar -->
		<div class="flex flex-wrap items-center justify-center gap-2 w-full max-w-sm">
			<button
				type="button"
				onclick={ handleShareWhatsApp }
				class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#25D366] hover:bg-[#20ba59] shadow-md shadow-[#25D366]/20 transition-all active:scale-95 cursor-pointer"
				title="Compartir enlace directamente por WhatsApp"
			>
				<Share2 size={ 14 } />
				<span>WhatsApp</span>
			</button>

			<button
				type="button"
				onclick={ handleCopy }
				class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-stone-200 dark:border-white/10 text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-white bg-white dark:bg-white/5 hover:dark:bg-white/10 shadow-xs transition-all active:scale-95 cursor-pointer"
			>
				{#if isCopied}
					<Check size={ 14 } class="text-emerald-500" />
					<span class="text-emerald-500">¡Copiado!</span>
				{:else}
					<Copy size={ 14 } />
					<span>Copiar Enlace</span>
				{/if}
			</button>

			<button
				type="button"
				onclick={ handleDownload }
				class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-stone-200 dark:border-white/10 text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-white bg-white dark:bg-white/5 hover:dark:bg-white/10 shadow-xs transition-all active:scale-95 cursor-pointer"
				title="Descargar imagen PNG del QR"
			>
				<Download size={ 14 } />
				<span>Descargar QR</span>
			</button>
		</div>
	{/if}
</div>

