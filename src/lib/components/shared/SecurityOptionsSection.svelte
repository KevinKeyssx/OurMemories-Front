<script lang="ts">
	import { ShieldAlert, Flame, Lock, Clock } from '@lucide/svelte';

    import Accordion    from './Accordion.svelte';
	import Checkbox     from './inputs/Checkbox.svelte';


	interface Props {
		password?       : string;
		timer?          : number;
		isTemporal?     : boolean;
		showEphemeral?  : boolean;
		class?          : string;
	}

	let {
		password        = $bindable( '' ),
		timer           = $bindable( undefined ),
		isTemporal      = $bindable( false ),
		showEphemeral   = false,
		class: customClass = ''
	}: Props = $props();
</script>

<div class="pt-2 border-t border-stone-100 dark:border-white/5 { customClass }">
	<Accordion
		title="Opciones de Privacidad y Seguridad"
		icon={ShieldAlert}
        class="text-blue-500"
	>
		<div class="p-4 rounded-2xl bg-stone-50/70 dark:bg-white/2 border border-stone-200/60 dark:border-white/10 space-y-4">
			{#if showEphemeral}
				<!-- Ver una sola vez (Momento Efímero) -->
				<Checkbox
					bind:checked={isTemporal}
					label="Ver una sola vez ( Momento Efímero )"
					description="Cada usuario de la relación solo podrá abrirlo una vez. Luego se bloqueará automáticamente para ese usuario."
					icon={Flame}
					id="sec-ephemeral"
				/>
			{/if}

			<!-- Contraseña de Desbloqueo -->
			<div>
				<label for="sec-pass" class="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
					Contraseña de Desbloqueo
				</label>

                <div class="relative flex items-center">
					<div class="absolute left-3 text-stone-400 pointer-events-none">
						<Lock size={ 14 } />
					</div>

                    <input
						id="sec-pass"
						type="password"
						bind:value={password}
						placeholder="Dejar vacío si no requiere contraseña"
						class="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-stone-100 dark:bg-white/4 border border-stone-200/80 dark:border-white/10 text-xs font-medium focus:outline-hidden focus:border-brand-accent transition-colors"
					/>
				</div>
			</div>

			<!-- Temporizador -->
			<div>
				<label for="sec-timer" class="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
					Temporizador de Visualización ( Segundos )
				</label>

                <div class="relative flex items-center">
					<div class="absolute left-3 text-stone-400 pointer-events-none">
						<Clock size={ 14 } />
					</div>

                    <input
						id="sec-timer"
						type="number"
						min="1"
						bind:value={timer}
						placeholder="Ej. 10 para ocultar tras 10 segundos"
						class="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-stone-100 dark:bg-white/4 border border-stone-200/80 dark:border-white/10 text-xs font-medium focus:outline-hidden focus:border-brand-accent transition-colors"
					/>
				</div>
			</div>
		</div>
	</Accordion>
</div>
