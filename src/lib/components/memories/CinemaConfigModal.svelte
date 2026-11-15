<script lang="ts">
	import {
		Film,
		Save,
		Clock,
		Flame,
		Lock,
		Image as ImageIcon,
		Video as VideoIcon,
		Headphones,
		FileText,
		Sparkles
	} from '@lucide/svelte';

    import Dialog               from '$lib/components/shared/Dialog.svelte';
	import { memoriesStore }    from '$lib/store.svelte';


    interface Props {
		isOpen    : boolean;
		memoryId  : string;
		color?    : string;
		onClose   : () => void;
	}


    let {
		isOpen,
		memoryId,
		color = '#f43f5e',
		onClose
	}: Props = $props();


    let hasTimer             = $state<boolean>( true );
	let timer                = $state<number>( 8 );
	let showPasswords        = $state<boolean>( true );
	let givePasswords        = $state<boolean>( false );
	let showEphemeralMoments = $state<boolean>( false );
	let showImages           = $state<boolean>( true );
	let showVideos           = $state<boolean>( true );
	let showVoice            = $state<boolean>( true );
	let showDedications      = $state<boolean>( true );
	let kenBurnsEffect       = $state<boolean>( true );


    const timerPresets: number[] = [ 5, 8, 10, 15, 30 ];


    $effect( () => {
		if ( isOpen && memoryId ) {
			const config = memoriesStore.getCinemaConfig( memoryId );
			hasTimer             = config.timer !== null && config.timer > 0;
			timer                = config.timer && config.timer > 0 ? config.timer : 8;
			showPasswords        = config.show_passwords;
			givePasswords        = config.give_passwords;
			showEphemeralMoments = config.show_ephemeral_moments;
			showImages           = config.show_images;
			showVideos           = config.show_videos;
			showVoice            = config.show_voice;
			showDedications      = config.show_dedications;
			kenBurnsEffect       = config.ken_burns_effect ?? true;
		}
	});


    function handleSubmit( e: SubmitEvent ): void {
		e.preventDefault();

		memoriesStore.saveCinemaConfig( {
			memory_id              : memoryId,
			timer                  : hasTimer ? Number( timer ) : null,
			show_passwords         : showPasswords,
			give_passwords         : givePasswords,
			show_ephemeral_moments : showEphemeralMoments,
			show_images            : showImages,
			show_videos            : showVideos,
			show_voice             : showVoice,
			show_dedications       : showDedications,
			ken_burns_effect       : kenBurnsEffect
		} );

		onClose();
	}
</script>

<Dialog
	open        = { isOpen }
	title       = "Configurar Modo Cine"
	description = "Personaliza los tiempos de reproducción, formatos permitidos y filtros de seguridad para esta memoria"
	maxWidth    = "max-w-xl"
	{onClose}
>
	{#snippet headerExtra()}
		<div
			class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors shadow-2xs"
			style="background-color: { color }18; color: { color };"
		>
			<Film size={ 18 } />
		</div>
	{/snippet}

	<form onsubmit={ handleSubmit } class="space-y-5">
		<!-- 1. Temporizador de Diapositiva -->
		<div class="p-4 rounded-2xl bg-stone-50 dark:bg-white/2 border border-stone-200/70 dark:border-white/5 space-y-3">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Clock size={ 16 } class="text-amber-500" />

                    <span class="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
						Avance Automático
					</span>
				</div>

                <label class="relative inline-flex items-center cursor-pointer">
					<input
						type="checkbox"
						bind:checked={ hasTimer }
						class="sr-only peer"
					/>

                    <div class="w-9 h-5 bg-stone-200 peer-focus:outline-hidden rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
				</label>
			</div>

			{#if hasTimer}
				<div class="space-y-3 pt-1">
					<div class="flex items-center justify-between">
						<span class="text-xs text-stone-500 dark:text-stone-400">Duración por momento:</span>

                        <span class="text-xs font-black text-amber-500">{ timer } segundos</span>
					</div>

					<!-- Presets Rápidos -->
					<div class="flex flex-wrap items-center gap-2">
						{#each timerPresets as preset}
							<button
								type="button"
								onclick={ () => ( timer = preset ) }
								class="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer { timer === preset ? 'bg-amber-500 text-white border-amber-500 shadow-xs' : 'bg-white dark:bg-white/5 text-stone-600 dark:text-stone-300 border-stone-200/80 dark:border-white/10 hover:border-amber-500/50' }"
							>
								{ preset }s
							</button>
						{/each}
						<div class="flex items-center gap-1.5 ml-auto">
							<input
								type    = "number"
								min     = "2"
								max     = "120"
								class   = "w-16 px-2 py-1 rounded-xl text-xs font-bold text-center bg-white dark:bg-white/5 border border-stone-200/80 dark:border-white/10 focus:outline-hidden focus:border-amber-500"
								bind:value={ timer }
							/>

                            <span class="text-[11px] text-stone-400 font-semibold">seg</span>
						</div>
					</div>

                    <p class="text-[11px] text-stone-400">
						* Nota: Si un momento contiene un video o nota de voz, la proyección esperará automáticamente a que termine.
					</p>
				</div>
			{:else}
				<p class="text-xs text-stone-400">
					El carrusel permanecerá en cada momento hasta que avances o retrocedas manualmente usando las flechas o el teclado.
				</p>
			{/if}
		</div>

		<!-- 2. Tipos de Contenido (Filtros Multimedia) -->
		<div class="p-4 rounded-2xl bg-stone-50 dark:bg-white/2 border border-stone-200/70 dark:border-white/5 space-y-3">
			<div class="flex items-center justify-between">
				<span class="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
					Formatos de Contenido a Proyectar
				</span>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
				<!-- Fotos -->
				<label class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-white/4 border border-stone-200/70 dark:border-white/5 cursor-pointer hover:border-brand-accent/40 transition-colors">
					<div class="flex items-center gap-2">
						<ImageIcon size={ 15 } class="text-blue-500" />
						<span class="text-xs font-bold text-stone-700 dark:text-stone-300">Fotografías</span>
					</div>

                    <input
						type="checkbox"
						bind:checked={ showImages }
						class="size-4 rounded text-brand-accent focus:ring-0 accent-brand-accent cursor-pointer"
					/>
				</label>

				<!-- Videos -->
				<label class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-white/4 border border-stone-200/70 dark:border-white/5 cursor-pointer hover:border-brand-accent/40 transition-colors">
					<div class="flex items-center gap-2">
						<VideoIcon size={ 15 } class="text-purple-500" />
						<span class="text-xs font-bold text-stone-700 dark:text-stone-300">Videos</span>
					</div>

                    <input
						type="checkbox"
						bind:checked={ showVideos }
						class="size-4 rounded text-brand-accent focus:ring-0 accent-brand-accent cursor-pointer"
					/>
				</label>

				<!-- Notas de Voz -->
				<label class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-white/4 border border-stone-200/70 dark:border-white/5 cursor-pointer hover:border-brand-accent/40 transition-colors">
					<div class="flex items-center gap-2">
						<Headphones size={ 15 } class="text-emerald-500" />
						<span class="text-xs font-bold text-stone-700 dark:text-stone-300">Notas de Voz</span>
					</div>

                    <input
						type="checkbox"
						bind:checked={ showVoice }
						class="size-4 rounded text-brand-accent focus:ring-0 accent-brand-accent cursor-pointer"
					/>
				</label>

				<!-- Dedicatorias / Textos -->
				<label class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-white/4 border border-stone-200/70 dark:border-white/5 cursor-pointer hover:border-brand-accent/40 transition-colors">
					<div class="flex items-center gap-2">
						<FileText size={ 15 } class="text-amber-500" />
						<span class="text-xs font-bold text-stone-700 dark:text-stone-300">Dedicatorias / Citas</span>
					</div>

                    <input
						type="checkbox"
						bind:checked={ showDedications }
						class="size-4 rounded text-brand-accent focus:ring-0 accent-brand-accent cursor-pointer"
					/>
				</label>
			</div>
		</div>

		<!-- 3. Momentos Protegidos con Contraseña -->
		<div class="p-4 rounded-2xl bg-stone-50 dark:bg-white/2 border border-stone-200/70 dark:border-white/5 space-y-3">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Lock size={ 16 } class="text-purple-500" />

                    <span class="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
						Momentos con Contraseña
					</span>
				</div>

                <label class="relative inline-flex items-center cursor-pointer">
					<input
						type="checkbox"
						bind:checked={ showPasswords }
						class="sr-only peer"
					/>

                    <div class="w-9 h-5 bg-stone-200 peer-focus:outline-hidden rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
				</label>
			</div>

			{#if showPasswords}
				<div class="pt-2 border-t border-stone-200/60 dark:border-white/5 space-y-2">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-xs font-bold text-stone-700 dark:text-stone-300">Pedir clave en cada momento</p>

                            <p class="text-[11px] text-stone-400">
								{ givePasswords ? 'Se solicitará la contraseña individual en cada momento protegido.' : 'Al ingresar la clave del primer momento protegido se desbloquean los demás para una proyección continua.' }
							</p>
						</div>

                        <label class="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
							<input
								type="checkbox"
								bind:checked={ givePasswords }
								class="sr-only peer"
							/>

                            <div class="w-8 h-4.5 bg-stone-200 peer-focus:outline-hidden rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-stone-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-purple-600"></div>
						</label>
					</div>
				</div>
			{:else}
				<p class="text-xs text-stone-400">
					Los momentos protegidos con contraseña se omitirán automáticamente de la proyección.
				</p>
			{/if}
		</div>

		<!-- 4. Momentos Efímeros No Vistos -->
		<div class="p-4 rounded-2xl bg-stone-50 dark:bg-white/2 border border-stone-200/70 dark:border-white/5 space-y-2">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Flame size={ 16 } class="text-rose-500" />

                    <span class="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
						Momentos Efímeros
					</span>
				</div>

                <label class="relative inline-flex items-center cursor-pointer">
					<input
						type="checkbox"
						bind:checked={ showEphemeralMoments }
						class="sr-only peer"
					/>

                    <div class="w-9 h-5 bg-stone-200 peer-focus:outline-hidden rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
				</label>
			</div>

			<p class="text-xs text-stone-400 leading-relaxed">
				{ showEphemeralMoments ? 'Se proyectarán únicamente los momentos efímeros que aún no hayas visto. Cada uno se mostrará con su temporizador efímero, protegidos contra capturas y descargas, y se consumirán tras finalizar.' : 'Los momentos efímeros no se proyectarán en el modo cine.' }
			</p>
		</div>

		<!-- 5. Efectos Visuales Cinematográficos -->
		<div class="p-4 rounded-2xl bg-stone-50 dark:bg-white/2 border border-stone-200/70 dark:border-white/5 space-y-2">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Sparkles size={ 16 } class="text-pink-500" />

                    <span class="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
						Efecto Ken Burns en Fotos
					</span>
				</div>

                <label class="relative inline-flex items-center cursor-pointer">
					<input
						type="checkbox"
						bind:checked={ kenBurnsEffect }
						class="sr-only peer"
					/>

                    <div class="w-9 h-5 bg-stone-200 peer-focus:outline-hidden rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-500"></div>
				</label>
			</div>

			<p class="text-xs text-stone-400 leading-relaxed">
				Aplica un zoom suave y continuo a las fotografías para brindar un toque cinematográfico tipo documental.
			</p>
		</div>

		<!-- Botones de Acción -->
		<div class="flex items-center justify-end gap-3 pt-3 border-t border-stone-200/60 dark:border-white/5">
			<button
				type    = "button"
				onclick = { onClose }
				class   = "px-4 py-2.5 rounded-2xl text-xs font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/5 transition-all cursor-pointer"
			>
				Cancelar
			</button>

			<button
				type    = "submit"
				class   = "inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-white text-xs font-extrabold shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer"
				style   = "background: linear-gradient(135deg, { color }, #7c3aed);"
			>
				<Save size={ 15 } />
				<span>Guardar Configuración</span>
			</button>
		</div>
	</form>
</Dialog>
