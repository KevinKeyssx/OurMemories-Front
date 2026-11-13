<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { X } from '@lucide/svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		open           ?: boolean;
		title          ?: string;
		description    ?: string;
		maxWidth       ?: string;
		contentClass   ?: string;
		contentStyle   ?: string;
		showCloseButton?: boolean;
		onClose        ?: () => void;
		children        : Snippet;
		headerExtra    ?: Snippet;
		footer         ?: Snippet;
	}

	let {
		open = $bindable( false ),
		title,
		description,
		maxWidth = 'max-w-lg',
		contentClass,
		contentStyle,
		showCloseButton = true,
		onClose,
		children,
		headerExtra,
		footer
	}: Props = $props();

	function handleOpenChange( isOpen: boolean ): void {
		open = isOpen;
		if ( !isOpen && onClose ) {
			onClose();
		}
	}
</script>

<Dialog.Root bind:open={ open } onOpenChange={ handleOpenChange }>
	<Dialog.Portal>
		<Dialog.Overlay
			class="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-md animate-in fade-in-0 duration-200"
		/>
		<Dialog.Content
			class="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] { maxWidth } rounded-3xl { contentClass ? contentClass : 'p-6 sm:p-7 space-y-5' } shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar outline-hidden animate-in fade-in-0 zoom-in-95 duration-200 { contentStyle ? 'backdrop-blur-2xl' : 'bg-white dark:bg-dark-card border border-stone-200/70 dark:border-white/10' }"
			style={ contentStyle }
		>
			<!-- Cabecera del Diálogo -->
			{#if title || description || headerExtra}
				<div class="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-white/5">
					<div class="space-y-0.5">
						{#if title}
							<Dialog.Title class="text-lg font-extrabold tracking-tight text-stone-900 dark:text-white">
								{ title }
							</Dialog.Title>
						{/if}
						{#if description}
							<Dialog.Description class="text-xs text-stone-400">
								{ description }
							</Dialog.Description>
						{/if}
					</div>

					<div class="flex items-center gap-2">
						{#if headerExtra}
							{@render headerExtra()}
						{/if}
						{#if showCloseButton}
							<Dialog.Close
								class="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
								aria-label="Cerrar ventana"
							>
								<X size={ 20 } />
							</Dialog.Close>
						{/if}
					</div>
				</div>
			{:else if showCloseButton}
				<div class="flex justify-end -mt-2 -mr-2">
					<Dialog.Close
						class="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
						aria-label="Cerrar ventana"
					>
						<X size={ 20 } />
					</Dialog.Close>
				</div>
			{/if}

			<!-- Contenido Principal -->
			<div>
				{@render children()}
			</div>

			<!-- Footer Opcional -->
			{#if footer}
				<div class="pt-3 border-t border-stone-100 dark:border-white/5">
					{@render footer()}
				</div>
			{/if}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

