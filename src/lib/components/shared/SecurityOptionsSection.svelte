<script lang="ts">
	import { ShieldAlert, Flame } from '@lucide/svelte';

	import Accordion from './Accordion.svelte';
	import Checkbox  from './inputs/Checkbox.svelte';
	import Password  from './inputs/Password.svelte';
	import Number    from './inputs/Number.svelte';

	interface Props {
		password      ?: string;
		timer         ?: number;
		isTemporal    ?: boolean;
		showEphemeral ?: boolean;
		defaultOpen   ?: boolean;
		class         ?: string;
	}

	let {
		password = $bindable( '' ),
		timer = $bindable( undefined ),
		isTemporal = $bindable( false ),
		showEphemeral = false,
		defaultOpen,
		class: customClass = ''
	}: Props = $props();

	const isSecured = $derived<boolean>( defaultOpen !== undefined ? defaultOpen : Boolean( password || timer || isTemporal ) );

	$effect( () => {
		if ( isTemporal ) {
			if ( timer === undefined || timer < 5 ) {
				timer = 5;
			} else if ( timer > 180 ) {
				timer = 180;
			}
		}
	} );
</script>

<div class="pt-2 border-t border-stone-100 dark:border-white/5 { customClass }">
	<Accordion
		title="Opciones de Privacidad y Seguridad"
		icon={ShieldAlert}
		defaultOpen={isSecured}
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
			<Password
				bind:value={password}
				label="Contraseña de Desbloqueo"
				placeholder="Dejar vacío si no requiere contraseña"
				id="sec-pass"
			/>

			<!-- Temporizador -->
			<Number
				bind:value={timer}
				min={ isTemporal ? 5 : 1 }
				max={ isTemporal ? 180 : undefined }
				step={ isTemporal ? 5 : 1 }
				unit="seg"
				required={isTemporal}
				label={ isTemporal ? 'Temporizador Requerido ( Segundos )' : 'Temporizador de Visualización ( Segundos )' }
				placeholder={ isTemporal ? 'Mínimo 5s, máximo 180s' : 'Ej. 10 para ocultar tras 10 segundos' }
				helperText={ isTemporal ? 'Tiempo visible antes de consumirse ( entre 5s y 180s en saltos de 5s )' : undefined }
				id="sec-timer"
			/>
		</div>
	</Accordion>
</div>
