<script lang="ts">
	import {
		X,
		Image as ImageIcon,
		Quote as QuoteIcon,
		Video,
		FileText,
		Smile,
		Send
	} from '@lucide/svelte';
	import type { Component } from 'svelte';
	import type { Memory, MemoryType } from '$lib/types';
	import { fade, scale } from 'svelte/transition';

	interface Props {
		isOpen  : boolean;
		onClose : () => void;
		onAdd   : ( memory: Partial<Memory> ) => void;
	}

	interface TypeOption {
		id    : MemoryType;
		icon  : Component;
		label : string;
	}

	let { isOpen, onClose, onAdd }: Props = $props();

	let type = $state<MemoryType>( 'image' );
	let title = $state<string>( '' );
	let content = $state<string>( '' );
	let author = $state<string>( '' );
	let imageUrl = $state<string>( '' );

	const types: TypeOption[] = [
		{ id: 'image', icon: ImageIcon as unknown as Component, label: 'Imagen' },
		{ id: 'quote', icon: QuoteIcon as unknown as Component, label: 'Frase' },
		{ id: 'text', icon: FileText as unknown as Component, label: 'Texto' },
		{ id: 'video', icon: Video as unknown as Component, label: 'Video' },
		{ id: 'meme', icon: Smile as unknown as Component, label: 'Meme' }
	];

	function handleSubmit( e: SubmitEvent ): void {
		e.preventDefault();
		onAdd( {
			type,
			title,
			content,
			author   : author || 'Anónimo',
			date     : new Date().toLocaleDateString( 'es-ES', { month: 'short', day: 'numeric', year: 'numeric' } ),
			metadata : {
				imageUrl : imageUrl || ( type === 'quote' ? undefined : 'https://images.unsplash.com/photo-1518173946687-a4c8a9833d8e?auto=format&fit=crop&q=80&w=800' )
			}
		} );
		title = '';
		content = '';
		author = '';
		imageUrl = '';
		onClose();
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 px-4 flex items-center justify-center overflow-y-auto py-10"
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			transition:fade={{ duration: 200 }}
			class="fixed inset-0 bg-stone-950/60 backdrop-blur-sm transition-opacity"
			onclick={onClose}
		></div>

		<div
			transition:scale={{ start: 0.95, duration: 200 }}
			class="relative w-full max-w-lg bg-white dark:bg-dark-card border border-stone-200/60 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10"
		>
			<div class="px-6 py-5 border-b border-stone-100 dark:border-white/5 flex items-center justify-between">
				<h2 class="text-xl font-bold tracking-tight">Crear Recuerdo</h2>
				<button
					onclick={onClose}
					class="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-white/5 transition-colors"
				>
					<X size={20} />
				</button>
			</div>

			<form onsubmit={handleSubmit} class="p-6 space-y-5">
				<div>
					<span class="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Tipo de Recuerdo</span>
					<div class="grid grid-cols-5 gap-2">
						{#each types as t}
							{@const Icon = t.icon}
							<button
								type="button"
								onclick={() => ( type = t.id )}
								class="flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 {type === t.id ? 'bg-brand-accent/10 border-brand-accent text-brand-accent dark:border-dark-accent dark:text-dark-accent scale-105' : 'border-stone-200/60 dark:border-white/5 hover:border-stone-300 dark:hover:border-white/10 text-stone-600 dark:text-stone-400'}"
							>
								<Icon size={20} class="mb-1" />
								<span class="text-[11px] font-medium">{t.label}</span>
							</button>
						{/each}
					</div>
				</div>

				<div>
					<label for="title" class="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Título (Opcional)</label>
					<input
						type="text"
						id="title"
						bind:value={title}
						placeholder="ej. Tarde de risas en el parque"
						class="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/60 dark:border-white/5 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 dark:focus:ring-dark-accent/30 transition-all text-sm font-medium"
					/>
				</div>

				{#if type === 'image' || type === 'video' || type === 'meme'}
					<div>
						<label for="image-url" class="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">URL del Recurso (Imagen/Video)</label>
						<input
							type="url"
							id="image-url"
							bind:value={imageUrl}
							placeholder="https://images.unsplash.com/..."
							class="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/60 dark:border-white/5 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 dark:focus:ring-dark-accent/30 transition-all text-sm font-medium"
						/>
					</div>
				{/if}

				<div>
					<label for="content" class="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
						{type === 'quote' ? 'La Frase' : 'Contenido o Historia'}
					</label>
					<textarea
						id="content"
						required={type === 'quote' || type === 'text'}
						bind:value={content}
						rows="3"
						placeholder={type === 'quote' ? 'Escribe aquí la cita especial...' : 'Cuenta brevemente qué pasó...'}
						class="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/60 dark:border-white/5 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 dark:focus:ring-dark-accent/30 transition-all text-sm font-medium"
					></textarea>
				</div>

				<div>
					<label for="author" class="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Autor</label>
					<input
						type="text"
						id="author"
						bind:value={author}
						placeholder="ej. Mamá, Carlos, Tú"
						class="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/60 dark:border-white/5 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 dark:focus:ring-dark-accent/30 transition-all text-sm font-medium"
					/>
				</div>

				<div class="pt-2">
					<button
						type="submit"
						class="w-full py-3.5 px-6 rounded-2xl bg-linear-to-r from-brand-accent to-purple-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/25 hover:shadow-brand-accent/40 active:scale-[0.98] transition-all duration-300"
					>
						<Send size={18} />
						Guardar Recuerdo
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
