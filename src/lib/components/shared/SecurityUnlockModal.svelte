<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { Lock, Key, X, Eye, EyeOff } from '@lucide/svelte';

	interface Props {
		isOpen           : boolean;
		title           ?: string;
		description     ?: string;
		correctPassword ?: string;
		onSuccess        : () => void;
		onClose          : () => void;
	}

	let {
		isOpen,
		title = 'Contenido Protegido',
		description = 'Ingresa la contraseña para desbloquear y ver este contenido.',
		correctPassword = '',
		onSuccess,
		onClose
	}: Props = $props();

	let enteredPassword = $state<string>( '' );
	let showPassword = $state<boolean>( false );
	let errorMessage = $state<string>( '' );

	function handleSubmit( e: SubmitEvent ): void {
		e.preventDefault();
		if ( enteredPassword === correctPassword ) {
			errorMessage = '';
			enteredPassword = '';
			onSuccess();
		} else {
			errorMessage = 'Contraseña incorrecta. Inténtalo nuevamente.';
		}
	}

	function handleClose(): void {
		errorMessage = '';
		enteredPassword = '';
		onClose();
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<!-- Backdrop -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			transition:fade={ { duration: 200 } }
			class="fixed inset-0 bg-stone-950/70 backdrop-blur-md"
			onclick={handleClose}
		></div>

		<!-- Dialog -->
		<div
			transition:scale={ { start: 0.95, duration: 250 } }
			class="relative w-full max-w-sm rounded-3xl bg-white dark:bg-dark-card border border-stone-200/70 dark:border-white/10 p-6 shadow-2xl z-10 space-y-5"
		>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
						<Lock size={ 20 } />
					</div>
					<div>
						<h3 class="text-base font-bold text-stone-900 dark:text-white">{ title }</h3>
						<p class="text-xs text-stone-400">Protegido con clave</p>
					</div>
				</div>

				<button
					type="button"
					onclick={handleClose}
					class="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors"
					aria-label="Cerrar diálogo"
				>
					<X size={ 18 } />
				</button>
			</div>

			<p class="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
				{ description }
			</p>

			<form onsubmit={handleSubmit} class="space-y-4">
				<div class="space-y-1.5">
					<div class="relative flex items-center">
						<div class="absolute left-3 text-stone-400 pointer-events-none">
							<Key size={ 16 } />
						</div>
						<input
							type={ showPassword ? 'text' : 'password' }
							bind:value={enteredPassword}
							placeholder="Escribe la clave..."
							class="w-full pl-9 pr-10 py-2.5 rounded-2xl bg-stone-100 dark:bg-white/5 border border-stone-200/70 dark:border-white/10 text-sm font-medium focus:outline-hidden focus:border-brand-accent transition-colors"
						/>
						<button
							type="button"
							onclick={() => ( showPassword = !showPassword )}
							class="absolute right-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
							aria-label="Alternar visibilidad de contraseña"
						>
							{#if showPassword}
								<EyeOff size={ 16 } />
							{:else}
								<Eye size={ 16 } />
							{/if}
						</button>
					</div>

					{#if errorMessage}
						<p class="text-[11px] font-semibold text-rose-500 pl-1">{ errorMessage }</p>
					{/if}
				</div>

				<div class="flex items-center justify-end gap-2 pt-2">
					<button
						type="button"
						onclick={handleClose}
						class="px-4 py-2 rounded-xl text-xs font-semibold text-stone-500 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors"
					>
						Cancelar
					</button>

					<button
						type="submit"
						class="px-5 py-2 rounded-xl bg-brand-accent text-white text-xs font-semibold shadow-md shadow-brand-accent/25 hover:brightness-110 active:scale-95 transition-all"
					>
						Desbloquear
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
