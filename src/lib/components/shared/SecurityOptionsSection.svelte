<script lang="ts">
	import {
		Sliders,
		Flame,
		Hourglass
	} from '@lucide/svelte';

	import Accordion  from './Accordion.svelte';
	import Checkbox   from './inputs/Checkbox.svelte';
	import Password   from './inputs/Password.svelte';
	import Number     from './inputs/Number.svelte';
	import DatePicker from './inputs/DatePicker.svelte';
	import TimePicker from './inputs/TimePicker.svelte';

	interface Props {
		password?         : string;
		timer?            : number;
		isTemporal?       : boolean;
		showEphemeral?    : boolean;
		isFutureUnlock?   : boolean;
		unlockDate?       : string;
		unlockTime?       : string;
		showFutureUnlock? : boolean;
		title?            : string;
		defaultOpen?      : boolean;
		class?            : string;
	}

	let {
		password            = $bindable( '' ),
		timer               = $bindable( undefined ),
		isTemporal          = $bindable( false ),
		showEphemeral       = false,
		isFutureUnlock      = $bindable( false ),
		unlockDate          = $bindable( '' ),
		unlockTime          = $bindable( '' ),
		showFutureUnlock    = false,
		title               = 'Opciones del momento',
		defaultOpen,
		class: customClass = ''
	}: Props = $props();

	const isSecured = $derived<boolean>(
		defaultOpen !== undefined
			? defaultOpen
			: Boolean( password || timer || isTemporal || isFutureUnlock )
	);

	$effect( () => {
		if ( isTemporal ) {
			if ( timer === undefined || timer < 5 ) {
				timer = 5;
			} else if ( timer > 180 ) {
				timer = 180;
			}
		}
	} );

	$effect( () => {
		if ( isFutureUnlock && !unlockDate ) {
			const tomorrow = new Date();
			tomorrow.setDate( tomorrow.getDate() + 1 );
			unlockDate = tomorrow.toISOString().split( 'T' )[ 0 ];
		}
		if ( isFutureUnlock && !unlockTime ) {
			unlockTime = '12:00';
		}
	} );
</script>

<div class="pt-2 border-t border-stone-100 dark:border-white/5 { customClass }">
	<Accordion
		{title}
		icon={ Sliders }
		defaultOpen={ isSecured }
		class="text-brand-accent"
	>
		<div class="p-4 rounded-2xl bg-stone-50/70 dark:bg-white/2 border border-stone-200/60 dark:border-white/10 space-y-4">
			{#if showFutureUnlock}
				<!-- Desbloquear a futuro (Cápsula del Tiempo) -->
				<div class="space-y-3 pb-3 border-b border-stone-200/60 dark:border-white/10">
					<Checkbox
						bind:checked={ isFutureUnlock }
						label="Desbloquear a futuro ( Cápsula del Tiempo )"
						description="Programa una fecha y hora exacta en la que este momento estará disponible y visible para todos."
						icon={ Hourglass }
						id="sec-future-unlock"
					/>

					{#if isFutureUnlock}
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 animate-in fade-in-0 duration-200">
							<DatePicker
								bind:value={ unlockDate }
								label="Fecha de Desbloqueo"
								id="sec-unlock-date"
							/>
							<TimePicker
								bind:value={ unlockTime }
								label="Hora de Desbloqueo"
								id="sec-unlock-time"
							/>
						</div>
					{/if}
				</div>
			{/if}

			{#if showEphemeral}
				<!-- Ver una sola vez (Momento Efímero) -->
				<Checkbox
					bind:checked={ isTemporal }
					label="Ver una sola vez ( Momento Efímero )"
					description="Cada usuario de la relación solo podrá abrirlo una vez. Luego se bloqueará automáticamente para ese usuario."
					icon={ Flame }
					id="sec-ephemeral"
				/>
			{/if}

			<!-- Contraseña de Desbloqueo -->
			<Password
				bind:value={ password }
				label="Contraseña de Desbloqueo"
				placeholder="Dejar vacío si no requiere contraseña"
				id="sec-pass"
			/>

			<!-- Temporizador -->
			<Number
				bind:value={ timer }
				min={ isTemporal ? 5 : 1 }
				max={ isTemporal ? 180 : undefined }
				step={ isTemporal ? 5 : 1 }
				unit="seg"
				required={ isTemporal }
				label={ isTemporal ? 'Temporizador Requerido ( Segundos )' : 'Temporizador de Visualización ( Segundos )' }
				placeholder={ isTemporal ? 'Mínimo 5s, máximo 180s' : 'Ej. 10 para ocultar tras 10 segundos' }
				helperText={ isTemporal ? 'Tiempo visible antes de consumirse ( entre 5s y 180s en saltos de 5s )' : undefined }
				id="sec-timer"
			/>
		</div>
	</Accordion>
</div>
