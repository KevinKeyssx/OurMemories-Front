<script lang="ts">
	import {
		Share2,
		Copy,
		Check,
		MessageCircle,
		Send,
		ShieldCheck,
		Sparkles,
		Flame
	} from '@lucide/svelte';
	import type { MomentEntity } from '$lib/types';
	import Dialog               from '$lib/components/shared/Dialog.svelte';

	interface Props {
		open          ?: boolean;
		moment         : MomentEntity;
		relationColor ?: string;
		relationPath  ?: string;
		onClose       ?: () => void;
	}

	let {
		open = $bindable( false ),
		moment,
		relationColor = '#f43f5e',
		relationPath = 'pareja',
		onClose
	}: Props = $props();

	let isCopied = $state<boolean>( false );
	let copyTimeout: ReturnType<typeof setTimeout> | null = null;

	const shareUrl = $derived<string>(
		typeof window !== 'undefined'
			? `${ window.location.origin }/dashboard/${ relationPath }?moment=${ moment.id }`
			: ''
	);

	const shareText = $derived<string>(
		`¡Mira este recuerdo en OurMemories! ${ moment.title ? `"${ moment.title }"` : '' }`
	);

	const canNativeShare = $derived<boolean>(
		typeof navigator !== 'undefined' && Boolean( navigator.share )
	);

	async function handleCopyLink(): Promise<void> {
		if ( !shareUrl ) {
			return;
		}

		try {
			await navigator.clipboard.writeText( shareUrl );
			isCopied = true;

			if ( copyTimeout ) {
				clearTimeout( copyTimeout );
			}

			copyTimeout = setTimeout( () => {
				isCopied = false;
			}, 2500 );
		} catch ( err ) {
			console.error( 'Error al copiar al portapapeles:', err );
		}
	}

	function handleShareWhatsApp(): void {
		const url = `https://api.whatsapp.com/send?text=${ encodeURIComponent( `${ shareText }\n${ shareUrl }` ) }`;
		window.open( url, '_blank', 'noopener,noreferrer' );
	}

	function handleShareTelegram(): void {
		const url = `https://t.me/share/url?url=${ encodeURIComponent( shareUrl ) }&text=${ encodeURIComponent( shareText ) }`;
		window.open( url, '_blank', 'noopener,noreferrer' );
	}

	async function handleNativeShare(): Promise<void> {
		if ( !canNativeShare ) {
			return;
		}

		try {
			await navigator.share( {
				title : moment.title || 'Momento especial en OurMemories',
				text  : shareText,
				url   : shareUrl
			} );
		} catch ( err ) {
			// El usuario canceló o no se pudo compartir
			console.log( 'Compartir cancelado o no disponible:', err );
		}
	}
</script>

<Dialog
	bind:open
	title="Compartir Momento"
	description="Envía este enlace por aplicaciones de chat o cópialo directamente."
	maxWidth="max-w-md"
	{onClose}
>
	<div class="space-y-4 pt-1">
		<!-- Tarjeta resumen del momento -->
		<div class="flex items-center gap-3 p-3 rounded-2xl bg-stone-100/70 dark:bg-white/5 border border-stone-200/60 dark:border-white/10">
			<div
				class="size-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs"
				style="background: linear-gradient(135deg, { relationColor }, { relationColor }cc);"
			>
				{#if moment.metadata?.is_temporal}
					<Flame size={ 18 } class="text-white" />
				{:else}
					<Sparkles size={ 18 } class="text-white" />
				{/if}
			</div>

			<div class="min-w-0 flex-1">
				<h4 class="text-xs font-bold text-stone-900 dark:text-white truncate">
					{ moment.title || 'Momento sin título' }
				</h4>
				<p class="text-[11px] text-stone-500 dark:text-stone-400 truncate">
					Por { moment.author } • { moment.metadata?.is_temporal ? 'Momento Efímero' : 'Recuerdo de la relación' }
				</p>
			</div>
		</div>

		<!-- Campo de Enlace con botón de Copiar -->
		<div class="space-y-1.5">
			<label for="share-moment-url" class="text-[11px] font-bold text-stone-600 dark:text-stone-300 block">
				Enlace directo al momento
			</label>

			<div class="flex items-center gap-2">
				<input
					id="share-moment-url"
					type="text"
					readonly
					value={ shareUrl }
					class="flex-1 px-3 py-2 rounded-xl text-xs bg-stone-100 dark:bg-white/5 border border-stone-200/70 dark:border-white/10 text-stone-700 dark:text-stone-300 select-all focus:outline-hidden font-mono truncate"
				/>

				<button
					type="button"
					onclick={ handleCopyLink }
					class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0 { isCopied ? 'bg-emerald-500 text-white' : 'bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:hover:bg-stone-100 dark:text-stone-900' }"
				>
					{#if isCopied}
						<Check size={ 14 } />
						<span>¡Copiado!</span>
					{:else}
						<Copy size={ 14 } />
						<span>Copiar</span>
					{/if}
				</button>
			</div>
		</div>

		<!-- Compartir en aplicaciones de chat -->
		<div class="space-y-2 pt-1">
			<span class="text-[11px] font-bold text-stone-600 dark:text-stone-300 block">
				Compartir directamente por chat
			</span>

			<div class="grid grid-cols-2 gap-2.5">
				<!-- WhatsApp -->
				<button
					type="button"
					onclick={ handleShareWhatsApp }
					class="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
				>
					<MessageCircle size={ 15 } />
					<span>WhatsApp</span>
				</button>

				<!-- Telegram -->
				<button
					type="button"
					onclick={ handleShareTelegram }
					class="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/25 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
				>
					<Send size={ 14 } />
					<span>Telegram</span>
				</button>
			</div>

			{#if canNativeShare}
				<button
					type="button"
					onclick={ handleNativeShare }
					class="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-white/5 hover:bg-stone-200/70 dark:hover:bg-white/10 text-stone-700 dark:text-stone-300 border border-stone-200/60 dark:border-white/10 text-xs font-bold transition-all active:scale-95 cursor-pointer mt-1"
				>
					<Share2 size={ 13 } />
					<span>Más aplicaciones de mensajería</span>
				</button>
			{/if}
		</div>

		<!-- Aviso de privacidad y seguridad -->
		<div class="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] leading-relaxed flex items-start gap-2.5">
			<ShieldCheck size={ 16 } class="shrink-0 mt-0.5 text-amber-500 dark:text-amber-400" />
			<span>
				<strong>Privacidad Protegida:</strong> Este contenido es confidencial. Solo los miembros que tengan sesión iniciada y pertenezcan a esta relación podrán abrirlo. Si la persona no está en la relación, deberá recibir una invitación previa.
			</span>
		</div>
	</div>
</Dialog>
