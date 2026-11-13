<script lang="ts">
	import {
		parseTime,
		Time
	} from '@internationalized/date';
	import { Clock } from '@lucide/svelte';
	import { TimeField } from 'bits-ui';

	interface Props {
		value?        : string;
		label?        : string;
		placeholder?  : string;
		disabled?     : boolean;
		id?           : string;
		class?        : string;
	}

	let {
		value = $bindable( '' ),
		label,
		placeholder = 'Seleccionar hora...',
		disabled = false,
		id,
		class: customClass = ''
	}: Props = $props();

	function getInitialTime(): Time {
		if ( value ) {
			try {
				const parts = value.split( ':' );
				if ( parts.length >= 2 ) {
					return parseTime( `${ parts[ 0 ].padStart( 2, '0' ) }:${ parts[ 1 ].padStart( 2, '0' ) }` );
				}
			} catch {
				return new Time( 12, 0 );
			}
		}

		return new Time( 12, 0 );
	}

	let timeValue = $state<Time | undefined>( getInitialTime() );

	$effect( () => {
		if ( timeValue ) {
			const formatted = `${ String( timeValue.hour ).padStart( 2, '0' ) }:${ String( timeValue.minute ).padStart( 2, '0' ) }`;
			if ( formatted !== value ) {
				value = formatted;
			}
		}
	} );

	$effect( () => {
		if ( value ) {
			try {
				const parts = value.split( ':' );
				if ( parts.length >= 2 ) {
					const parsed = parseTime( `${ parts[ 0 ].padStart( 2, '0' ) }:${ parts[ 1 ].padStart( 2, '0' ) }` );
					if ( !timeValue || timeValue.compare( parsed ) !== 0 ) {
						timeValue = parsed;
					}
				}
			} catch {
				// Formato parcial durante tipeo
			}
		}
	} );
</script>

<div class="w-full flex flex-col { customClass }">
	{#if label}
		<label for={ id } class="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
			{ label }
		</label>
	{/if}

	<TimeField.Root
		bind:value={ timeValue }
		{disabled}
		locale="es-ES"
		granularity="minute"
		hourCycle={ 24 }
	>
		<div class="w-full px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-white/4 border border-stone-200/80 dark:border-white/10 text-xs font-medium text-stone-800 dark:text-stone-100 flex items-center justify-between gap-2 shadow-xs transition-colors hover:border-brand-accent/50 focus-within:border-brand-accent">
			<div class="flex items-center gap-2.5">
				<div class="text-stone-400 pointer-events-none">
					<Clock size={ 14 } />
				</div>

				<TimeField.Input {id} class="flex items-center">
					{#snippet children({ segments })}
						{#each segments as { part, value: segValue }}
							<TimeField.Segment
								{part}
								class="px-0.5 py-0.5 rounded-sm focus:outline-hidden focus:bg-brand-accent/20 focus:text-brand-accent font-semibold data-[segment=literal]:text-stone-400 select-none"
							>
								{ segValue }
							</TimeField.Segment>
						{/each}
					{/snippet}
				</TimeField.Input>
			</div>

			<span class="text-[11px] text-stone-400 font-semibold select-none">
				24h
			</span>
		</div>
	</TimeField.Root>
</div>

