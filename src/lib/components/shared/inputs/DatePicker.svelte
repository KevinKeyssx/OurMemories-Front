<script lang="ts">
	import {
        parseDate,
        today,
        getLocalTimeZone,
        type DateValue
    }                               from '@internationalized/date';
	import {
        Calendar as CalendarIcon,
        ChevronLeft,
        ChevronRight
    }                               from '@lucide/svelte';
	import { DatePicker }           from 'bits-ui';


    interface Props {
		value?          : string;
		label?          : string;
		placeholder?    : string;
		disabled?       : boolean;
		id?             : string;
		class?          : string;
	}


    let {
		value = $bindable( '' ),
		label,
		placeholder = 'Seleccionar fecha...',
		disabled = false,
		id,
		class: customClass = ''
	}: Props = $props();


    function getInitialDate(): DateValue {
		if ( value ) {
			try {
				return parseDate( value );
			} catch {
				return today( getLocalTimeZone() );
			}
		}

        return today( getLocalTimeZone() );
	}


    let dateValue = $state<DateValue | undefined>( getInitialDate() );


    $effect( () => {
		if ( dateValue ) {
			const dateStr = dateValue.toString();

            if ( dateStr !== value ) {
				value = dateStr;
			}
		}
	} );


    $effect( () => {
		if ( value ) {
			try {
				const parsed = parseDate( value );

                if ( !dateValue || dateValue.compare( parsed ) !== 0 ) {
					dateValue = parsed;
				}
			} catch {
				// Formato parcial o inválido mientras se escribe
			}
		}
	} );
</script>

<div class="w-full flex flex-col { customClass }">
	{#if label}
		<label for={id} class="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
			{ label }
		</label>
	{/if}

	<DatePicker.Root
		bind:value={dateValue}
		{disabled}
		locale="es-ES"
	>
		<div class="w-full px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-white/4 border border-stone-200/80 dark:border-white/10 text-xs font-medium text-stone-800 dark:text-stone-100 flex items-center justify-between gap-2 shadow-xs transition-colors hover:border-brand-accent/50 focus-within:border-brand-accent">
			<div class="flex items-center gap-2.5">
				<div class="text-stone-400 pointer-events-none">
					<CalendarIcon size={ 14 } />
				</div>

				<DatePicker.Input {id} class="flex items-center">
					{#snippet children({ segments })}
						{#each segments as { part, value: segValue }}
							<DatePicker.Segment
								{part}
								class="px-0.5 py-0.5 rounded-sm focus:outline-hidden focus:bg-brand-accent/20 focus:text-brand-accent font-semibold data-[segment=literal]:text-stone-400 select-none"
							>
								{ segValue }
							</DatePicker.Segment>
						{/each}
					{/snippet}
				</DatePicker.Input>
			</div>

			<DatePicker.Trigger
				class="size-6 rounded-md flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
				aria-label={placeholder}
			>
				<CalendarIcon size={ 14 } />
			</DatePicker.Trigger>
		</div>

		<DatePicker.Portal>
			<DatePicker.Content
				sideOffset={ 6 }
				class="z-50 min-w-72.5 p-4 rounded-2xl bg-white dark:bg-[#180D2E] border border-stone-200/80 dark:border-white/15 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95"
			>
				<DatePicker.Calendar>
					{#snippet children({ months, weekdays })}
						<DatePicker.Header class="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 dark:border-white/10">
							<DatePicker.PrevButton class="size-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-brand-accent hover:bg-brand-accent/10 transition-colors cursor-pointer">
								<ChevronLeft size={ 16 } />
							</DatePicker.PrevButton>

							<DatePicker.Heading class="text-xs font-extrabold text-stone-800 dark:text-stone-100 capitalize tracking-wide" />

							<DatePicker.NextButton class="size-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-brand-accent hover:bg-brand-accent/10 transition-colors cursor-pointer">
								<ChevronRight size={ 16 } />
							</DatePicker.NextButton>
						</DatePicker.Header>

						{#each months as month}
							<DatePicker.Grid class="w-full border-collapse">
								<DatePicker.GridHead>
									<DatePicker.GridRow class="flex justify-between mb-2">
										{#each weekdays as day}
											<DatePicker.HeadCell class="size-8 text-[10px] font-bold text-stone-400 flex items-center justify-center uppercase tracking-wider">
												{ day }
											</DatePicker.HeadCell>
										{/each}
									</DatePicker.GridRow>
								</DatePicker.GridHead>

								<DatePicker.GridBody>
									{#each month.weeks as weekDates}
										<DatePicker.GridRow class="flex justify-between w-full mb-1">
											{#each weekDates as date}
												<DatePicker.Cell {date} month={month.value} class="relative p-0 text-center">
													<DatePicker.Day class="size-8 rounded-xl text-xs font-semibold flex items-center justify-center transition-all hover:bg-stone-100 dark:hover:bg-white/10 text-stone-800 dark:text-stone-100 data-selected:bg-linear-to-r data-selected:from-brand-accent data-selected:to-purple-600 data-selected:text-white data-selected:shadow-md data-selected:shadow-brand-accent/30 data-disabled:opacity-25 data-outside-month:opacity-20 cursor-pointer" />
												</DatePicker.Cell>
											{/each}
										</DatePicker.GridRow>
									{/each}
								</DatePicker.GridBody>
							</DatePicker.Grid>
						{/each}
					{/snippet}
				</DatePicker.Calendar>
			</DatePicker.Content>
		</DatePicker.Portal>
	</DatePicker.Root>
</div>
