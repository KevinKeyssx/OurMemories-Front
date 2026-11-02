<script lang="ts">
	import { onDestroy } from 'svelte';
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
		Eye,
		Calendar,
		User as UserIcon,
		Edit3
	} from '@lucide/svelte';
	import type { Component } from 'svelte';
	import type { MomentEntity, MomentTag } from '$lib/types';
	import MomentEphemeralCover from './MomentEphemeralCover.svelte';

	interface Props {
		moment        : MomentEntity;
		currentUserId : string;
		isViewed     ?: boolean;
		onDelete     ?: ( id: string ) => void;
		onEdit       ?: ( moment: MomentEntity ) => void;
		onUnlock     ?: ( moment: MomentEntity ) => void;
		onRecordView ?: ( momentId: string ) => void;
	}

	let {
		moment,
		currentUserId,
		isViewed = false,
		onDelete,
		onEdit,
		onUnlock,
		onRecordView
	}: Props = $props();

	let isManuallyUnlocked = $state<boolean>( false );
	let isEphemeralRevealed = $state<boolean>( false );
	let secondsLeft = $state<number | undefined>( undefined );
	let timerInterval = $state<ReturnType<typeof setInterval> | null>( null );

	const isUnlocked = $derived<boolean>( !moment.metadata?.password || isManuallyUnlocked );
	const isCreator = $derived<boolean>( moment.created_by === currentUserId );

	function startTimer(): void {
		if ( !moment.metadata?.timer || timerInterval ) {
			return;
		}

		secondsLeft = moment.metadata.timer;
		timerInterval = setInterval( () => {
			if ( secondsLeft && secondsLeft > 1 ) {
				secondsLeft -= 1;
			} else {
				// El tiempo expiró -> se vuelve a bloquear
				if ( timerInterval ) {
					clearInterval( timerInterval );
					timerInterval = null;
				}
				isManuallyUnlocked = false;
				secondsLeft = 0;
			}
		}, 1000 );
	}

	onDestroy( () => {
		if ( timerInterval ) {
			clearInterval( timerInterval );
		}
	} );

	function handleRevealEphemeral(): void {
		isEphemeralRevealed = true;
		if ( onRecordView ) {
			onRecordView( moment.id );
		}
		if ( moment.metadata?.timer ) {
			startTimer();
		}
	}

	function handleUnlockRequest(): void {
		if ( onUnlock ) {
			onUnlock( moment );
		}
	}

	function getTagBadge( tag: MomentTag ): { label: string; icon: Component } {
		switch ( tag ) {
			case 'image':
				return { label: 'Foto', icon: ImageIcon as Component };
			case 'video':
				return { label: 'Video', icon: VideoIcon as Component };
			case 'text':
				return { label: 'Texto', icon: FileText as Component };
			case 'quote':
				return { label: 'Dedicatoria', icon: QuoteIcon as Component };
			default:
				return { label: 'Recuerdo', icon: Heart as Component };
		}
	}
</script>

<div
	class="group relative flex flex-col justify-between rounded-3xl overflow-hidden border border-stone-200/60 dark:border-white/10 bg-white/70 dark:bg-dark-card/70 shadow-lg hover:shadow-2xl transition-all duration-500 backdrop-blur-md"
	style={ moment.metadata?.bgColor ? `background-color: ${ moment.metadata.bgColor };` : '' }
>
	<!-- Cubierta efímera para momentos de 'ver una sola vez' -->
	{#if moment.metadata?.is_temporal && ( isViewed || !isEphemeralRevealed )}
		<MomentEphemeralCover
			{isViewed}
			onReveal={handleRevealEphemeral}
		/>
	{/if}

	<!-- Bloqueo por Contraseña -->
	{#if moment.metadata?.password && !isUnlocked}
		<div class="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center backdrop-blur-xl bg-stone-900/85 text-white">
			<div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
				<Lock size={ 22 } />
			</div>
			<h4 class="text-sm font-bold">Momento Bloqueado</h4>
			<p class="text-[11px] text-stone-400 max-w-xs mt-1 mb-4">
				Ingresa la clave para visualizar el contenido protegido.
			</p>
			<button
				type="button"
				onclick={handleUnlockRequest}
				class="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all"
			>
				Desbloquear
			</button>
		</div>
	{/if}

	<!-- Contenido del Momento -->
	<div class="p-2">
		<!-- Imagen / Video Multimedia -->
		{#if moment.metadata?.imageUrl}
			<div class="aspect-4/5 overflow-hidden rounded-2xl relative shadow-inner mb-3">
				<img
					src={ moment.metadata.imageUrl }
					alt={ moment.title || 'Foto de recuerdo' }
					class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
				/>

				{#if secondsLeft !== undefined && secondsLeft > 0}
					<div class="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold text-amber-300 bg-black/60 backdrop-blur-md border border-amber-400/30">
						<Clock size={ 12 } />
						<span>{ secondsLeft }s restantes</span>
					</div>
				{/if}
			</div>
		{:else if moment.metadata?.videoUrl}
			<div class="aspect-video overflow-hidden rounded-2xl relative shadow-inner bg-black mb-3">
				<!-- svelte-ignore a11y_media_has_caption -->
				<video
					src={ moment.metadata.videoUrl }
					controls
					class="w-full h-full object-cover"
				></video>
			</div>
		{/if}

		<!-- Texto / Contenido y Título -->
		<div class="p-3 space-y-2">
			<!-- Tags automáticos generados -->
			<div class="flex flex-wrap items-center gap-1.5">
				{#each moment.tags as tag}
					{@const badge = getTagBadge( tag )}
					{@const TagIcon = badge.icon}
					<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-stone-300 border border-stone-200/50 dark:border-white/5">
						<TagIcon size={ 10 } />
						<span>{ badge.label }</span>
					</span>
				{/each}

				{#if moment.metadata?.is_temporal}
					<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
						<Flame size={ 10 } />
						<span>Efímero</span>
					</span>
				{/if}
			</div>

			{#if moment.title}
				<h4 class="text-sm font-extrabold text-stone-800 dark:text-stone-100 line-clamp-1">
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

	<!-- Pie de Tarjeta ( Autor, Fecha y Acciones del Creador ) -->
	<div class="p-3 pt-0 flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-100/60 dark:border-white/5 mt-2">
		<div class="flex items-center gap-2">
			<span class="inline-flex items-center gap-1 font-semibold text-stone-500 dark:text-stone-400">
				<UserIcon size={ 12 } />
				<span>{ moment.author }</span>
			</span>

			{#if moment.capture_date}
				<span class="inline-flex items-center gap-1 text-[10px]">
					<Calendar size={ 11 } />
					<span>{ moment.capture_date }</span>
				</span>
			{/if}
		</div>

		<!-- Acciones exclusivas del autor creador -->
		{#if isCreator}
			<div class="flex items-center gap-1">
				{#if onEdit}
					<button
						type="button"
						onclick={() => onEdit && onEdit( moment )}
						class="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors"
						title="Editar momento"
						aria-label="Editar momento"
					>
						<Edit3 size={ 13 } />
					</button>
				{/if}

				{#if onDelete}
					<button
						type="button"
						onclick={() => onDelete && onDelete( moment.id )}
						class="p-1 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
						title="Eliminar momento"
						aria-label="Eliminar momento"
					>
						<Trash2 size={ 13 } />
					</button>
				{/if}
			</div>
		{/if}
	</div>
</div>
