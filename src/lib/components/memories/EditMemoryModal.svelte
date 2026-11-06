<script lang="ts">
	import { FolderHeart, Image, Save } from '@lucide/svelte';
	import type { MemoryEntity } from '$lib/types';
	import Dialog from '$lib/components/shared/Dialog.svelte';
	import SecurityOptionsSection from '$lib/components/shared/SecurityOptionsSection.svelte';
	import { memoriesStore } from '$lib/store.svelte';

	interface Props {
		isOpen    : boolean;
		memory    : MemoryEntity | null;
		color    ?: string;
		onClose   : () => void;
		onSuccess?: ( updatedMemory: MemoryEntity ) => void;
	}

	let {
		isOpen,
		memory,
		color = '#f43f5e',
		onClose,
		onSuccess
	}: Props = $props();

	let title       = $state<string>( '' );
	let description = $state<string>( '' );
	let coverUrl    = $state<string>( '' );
	let password    = $state<string>( '' );
	let timer       = $state<number | undefined>( undefined );
	let isBlocked   = $state<boolean>( false );

	$effect( () => {
		if ( isOpen && memory ) {
			title       = memory.title || '';
			description = memory.description || '';
			coverUrl    = memory.cover_url || '';
			password    = memory.password || '';
			timer       = memory.timer;
			isBlocked   = Boolean( memory.is_blocked );
		}
	} );

	function handleSubmit( e: SubmitEvent ): void {
		e.preventDefault();
		if ( !memory || !title.trim() ) {
			return;
		}

		const updatedData: Partial<MemoryEntity> = {
			title       : title.trim(),
			description : description.trim() || undefined,
			cover_url   : coverUrl.trim() || undefined,
			password    : password.trim() || undefined,
			timer       : timer ? Number( timer ) : undefined,
			is_blocked  : isBlocked || Boolean( password.trim() )
		};

		memoriesStore.updateMemory( memory.id, updatedData );

		const refreshed = memoriesStore.memories.find( ( m: MemoryEntity ) => m.id === memory?.id );
		if ( refreshed && onSuccess ) {
			onSuccess( refreshed );
		}

		onClose();
	}
</script>

<Dialog
	open={ isOpen }
	title="Editar Memoria"
	description="Actualiza la información, portada y seguridad de esta memoria"
	maxWidth="max-w-lg"
	{onClose}
>
	{#snippet headerExtra()}
		<div
			class="w-7 h-7 rounded-xl flex items-center justify-center transition-colors"
			style="background-color: { color }18; color: { color };"
		>
			<FolderHeart size={ 16 } />
		</div>
	{/snippet}

	<form onsubmit={ handleSubmit } class="space-y-4">
		<div class="space-y-3">
			<div>
				<label
					for="edit-mem-title"
					class="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5"
				>
					Título de la Memoria *
				</label>
				<input
					id="edit-mem-title"
					type="text"
					bind:value={ title }
					required
					placeholder="Ej. Vacaciones en el Sur, Nuestro Aniversario..."
					class="w-full px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-white/4 border border-stone-200/80 dark:border-white/10 text-sm font-medium focus:outline-hidden hover:border-brand-accent/50 focus:border-brand-accent transition-colors"
				/>
			</div>

			<div>
				<label
					for="edit-mem-desc"
					class="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5"
				>
					Descripción ( Opcional )
				</label>
				<textarea
					id="edit-mem-desc"
					bind:value={ description }
					rows={ 2 }
					placeholder="Añade un relato o dedicatoria general para esta memoria..."
					class="w-full px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-white/4 border border-stone-200/80 dark:border-white/10 text-sm font-medium focus:outline-hidden hover:border-brand-accent/50 focus:border-brand-accent transition-colors resize-none"
				></textarea>
			</div>

			<div>
				<label
					for="edit-mem-cover"
					class="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5"
				>
					URL de Portada ( Opcional )
				</label>
				<div class="relative flex items-center">
					<div class="absolute left-3.5 text-stone-400 pointer-events-none">
						<Image size={ 16 } />
					</div>
					<input
						id="edit-mem-cover"
						type="url"
						bind:value={ coverUrl }
						placeholder="https://ejemplo.com/portada.jpg"
						class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-white/4 border border-stone-200/80 dark:border-white/10 text-sm font-medium focus:outline-hidden hover:border-brand-accent/50 focus:border-brand-accent transition-colors"
					/>
				</div>
			</div>
		</div>

		<!-- Opciones de Seguridad con Bits UI Accordion -->
		<SecurityOptionsSection
			bind:password={ password }
			bind:timer={ timer }
			showEphemeral={ false }
		/>

		<!-- Botones de Acción -->
		<div class="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-white/5">
			<button
				type="button"
				onclick={ onClose }
				class="px-5 py-2.5 rounded-2xl text-xs font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
			>
				Cancelar
			</button>

			<button
				type="submit"
				disabled={ !title.trim() }
				class="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-white text-xs font-bold active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer { color ? '' : 'bg-linear-to-r from-brand-accent to-pink-500 shadow-lg shadow-brand-accent/25 hover:shadow-brand-accent/40' }"
				style={ color ? `background-color: ${ color }; box-shadow: 0 4px 14px -2px ${ color }66;` : '' }
			>
				<Save size={ 16 } />
				<span>Guardar Cambios</span>
			</button>
		</div>
	</form>
</Dialog>

