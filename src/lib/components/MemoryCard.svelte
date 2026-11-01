<script lang="ts">
	import {
		Trash2,
		Heart,
		Quote as QuoteIcon,
		Image as ImageIcon,
		Video,
		FileText,
		Smile
	} from '@lucide/svelte';
	import type { Component } from 'svelte';
	import type { Memory } from '$lib/types';
	import { fly } from 'svelte/transition';

	interface Props {
		memory   : Memory;
		onDelete : ( id: string ) => void;
	}

	let { memory, onDelete }: Props = $props();

	const getIcon = (): Component => {
		switch ( memory.type ) {
			case 'image':
				return ImageIcon as unknown as Component;
			case 'quote':
				return QuoteIcon as unknown as Component;
			case 'video':
				return Video as unknown as Component;
			case 'text':
				return FileText as unknown as Component;
			case 'meme':
				return Smile as unknown as Component;
			default:
				return FileText as unknown as Component;
		}
	};

	const Icon = getIcon();
</script>

<div
	transition:fly={{ y: 20, duration: 600 }}
	class="group relative bg-white/60 dark:bg-dark-card/60 border border-stone-200/50 dark:border-white/5 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-brand-accent/20 dark:hover:shadow-brand-accent/10 transition-all duration-500 backdrop-blur-md"
>
	<div class="p-1.5">
		{#if memory.type === 'image' && memory.metadata?.imageUrl}
			<div class="aspect-4/5 overflow-hidden rounded-2xl relative shadow-inner">
				<img
					src={memory.metadata.imageUrl}
					alt={memory.title}
					class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
					referrerpolicy="no-referrer"
				/>
				<div class="absolute inset-0 bg-linear-to-t from-brand-ink/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
			</div>
		{:else if memory.type === 'video' && memory.metadata?.imageUrl}
			<div class="aspect-video overflow-hidden rounded-2xl relative group/video shadow-inner">
				<img
					src={memory.metadata.imageUrl}
					alt={memory.title}
					class="w-full h-full object-cover"
					referrerpolicy="no-referrer"
				/>
				<div class="absolute inset-0 flex items-center justify-center bg-brand-ink/40 group-hover/video:bg-brand-ink/60 transition-colors">
					<div class="w-16 h-16 rounded-full bg-brand-secondary flex items-center justify-center text-white secondary-glow">
						<Video size={28} fill="currentColor" />
					</div>
				</div>
			</div>
		{/if}
	</div>

	<div class="p-6">
		<div class="flex items-center justify-between mb-4">
			<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-paper dark:bg-dark-paper border border-stone-200/60 dark:border-white/10 text-brand-ink dark:text-dark-ink">
				<Icon size={13} class="text-brand-accent dark:text-dark-accent" />
				<span class="capitalize">{memory.type}</span>
			</span>
			<span class="text-xs font-medium text-stone-400 dark:text-stone-500 tracking-wider uppercase">{memory.date}</span>
		</div>

		{#if memory.title}
			<h3 class="text-xl font-bold tracking-tight mb-2 group-hover:text-brand-accent dark:group-hover:text-dark-accent transition-colors duration-300">
				{memory.title}
			</h3>
		{/if}

		{#if memory.type === 'quote'}
			<div class="relative my-4 pl-4 border-l-2 border-brand-accent/40 dark:border-dark-accent/40">
				<p class="font-serif italic text-lg text-stone-700 dark:text-stone-300 leading-relaxed">
					"{memory.content}"
				</p>
			</div>
		{:else if memory.content}
			<p class="text-stone-600 dark:text-stone-300/90 text-sm leading-relaxed mb-6 font-normal">
				{memory.content}
			</p>
		{/if}

		<div class="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-white/5 mt-4">
			<div class="flex items-center gap-2">
				<div class="w-7 h-7 rounded-full bg-linear-to-tr from-brand-accent to-pink-500 flex items-center justify-center text-[10px] text-white font-bold shadow-sm">
					{memory.author.charAt( 0 )}
				</div>
				<span class="text-xs font-medium text-stone-500 dark:text-stone-400">{memory.author}</span>
			</div>

			<div class="flex items-center gap-1">
				<button
					class="p-2 text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all duration-300"
					aria-label="Me gusta"
				>
					<Heart size={16} />
				</button>
				<button
					onclick={() => onDelete( memory.id )}
					class="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
					aria-label="Eliminar"
				>
					<Trash2 size={16} />
				</button>
			</div>
		</div>
	</div>
</div>
