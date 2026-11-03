<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { AlertTriangle, Trash2, Info, X } from '@lucide/svelte';

	interface Props {
		isOpen       : boolean;
		title       ?: string;
		description ?: string;
		confirmText ?: string;
		cancelText  ?: string;
		variant     ?: 'danger' | 'warning' | 'info';
		isLoading   ?: boolean;
		onConfirm    : () => void;
		onClose      : () => void;
	}

	let {
		isOpen,
		title = '¿Confirmar acción?',
		description = 'Esta acción no se puede deshacer.',
		confirmText = 'Confirmar',
		cancelText = 'Cancelar',
		variant = 'danger',
		isLoading = false,
		onConfirm,
		onClose
	}: Props = $props();

	function handleConfirm(): void {
		if ( !isLoading ) {
			onConfirm();
		}
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<!-- Backdrop -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			transition:fade={ { duration: 200 } }
			class="fixed inset-0 bg-stone-950/75 backdrop-blur-md"
			onclick={onClose}
		></div>

		<!-- Diálogo de Confirmación -->
		<div
			transition:scale={ { start: 0.95, duration: 250 } }
			class="relative w-full max-w-sm rounded-3xl bg-white dark:bg-dark-card border border-stone-200/70 dark:border-white/10 p-6 shadow-2xl z-10 space-y-4"
		>
			<div class="flex items-start justify-between gap-3">
				<div class="flex items-center gap-3">
					<div
						class="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 { variant === 'danger' ? 'bg-rose-500/15 text-rose-500' : variant === 'warning' ? 'bg-amber-500/15 text-amber-500' : 'bg-brand-accent/15 text-brand-accent' }"
					>
						{#if variant === 'danger'}
							<Trash2 size={ 22 } />
						{:else if variant === 'warning'}
							<AlertTriangle size={ 22 } />
						{:else}
							<Info size={ 22 } />
						{/if}
					</div>

					<div>
						<h3 class="text-base font-extrabold text-stone-900 dark:text-white leading-tight">
							{ title }
						</h3>
						<p class="text-[11px] font-semibold text-stone-400 mt-0.5">
							{ variant === 'danger' ? 'Acción irreversible' : 'Confirmación requerida' }
						</p>
					</div>
				</div>

				<button
					type="button"
					onclick={onClose}
					class="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
					aria-label="Cerrar confirmación"
				>
					<X size={ 18 } />
				</button>
			</div>

			<p class="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
				{ description }
			</p>

			<!-- Botones de Acción -->
			<div class="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100 dark:border-white/5">
				<button
					type="button"
					onclick={onClose}
					class="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
				>
					{ cancelText }
				</button>

				<button
					type="button"
					onclick={handleConfirm}
					disabled={isLoading}
					class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95 cursor-pointer disabled:opacity-50 { variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/30' : variant === 'warning' ? 'bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/30' : 'bg-brand-accent hover:brightness-110 shadow-md shadow-brand-accent/30' }"
				>
					{#if variant === 'danger'}
						<Trash2 size={ 14 } />
					{/if}
					<span>{ confirmText }</span>
				</button>
			</div>
		</div>
	</div>
{/if}

