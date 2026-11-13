<script lang="ts">
	import {
		Heart,
		Calendar as CalendarIcon
	} from '@lucide/svelte';

	interface Props {
		date          ?: string;
		color         ?: string;
		onOpenSettings?: () => void;
	}

	let {
		date,
		color = '#f43f5e',
		onOpenSettings
	}: Props = $props();

	interface TimeUnits {
		years   : number;
		months  : number;
		days    : number;
		hours   : number;
		minutes : number;
		seconds : number;
	}

	function calculateElapsedTime( startIsoStr: string, current: Date ): TimeUnits {
		try {
			const start = new Date( startIsoStr );
			if ( isNaN( start.getTime() ) || current < start ) {
				return {
					years   : 0,
					months  : 0,
					days    : 0,
					hours   : 0,
					minutes : 0,
					seconds : 0
				};
			}

			let years   = current.getFullYear() - start.getFullYear();
			let months  = current.getMonth() - start.getMonth();
			let days    = current.getDate() - start.getDate();
			let hours   = current.getHours() - start.getHours();
			let minutes = current.getMinutes() - start.getMinutes();
			let seconds = current.getSeconds() - start.getSeconds();

			if ( seconds < 0 ) {
				seconds += 60;
				minutes -= 1;
			}
			if ( minutes < 0 ) {
				minutes += 60;
				hours -= 1;
			}
			if ( hours < 0 ) {
				hours += 24;
				days -= 1;
			}
			if ( days < 0 ) {
				const prevMonthLastDay = new Date( current.getFullYear(), current.getMonth(), 0 ).getDate();
				days += prevMonthLastDay;
				months -= 1;
			}
			if ( months < 0 ) {
				months += 12;
				years -= 1;
			}
			if ( years < 0 ) {
				years = 0;
			}

			return {
				years,
				months,
				days,
				hours,
				minutes,
				seconds
			};
		} catch {
			return {
				years   : 0,
				months  : 0,
				days    : 0,
				hours   : 0,
				minutes : 0,
				seconds : 0
			};
		}
	}

	function padZero( n: number ): string {
		return n < 10 ? `0${ n }` : `${ n }`;
	}

	let now = $state<Date>( new Date() );

	$effect( () => {
		if ( !date ) {
			return;
		}

		now = new Date();
		const intervalId = setInterval( () => {
			now = new Date();
		}, 1000 );

		return () => {
			clearInterval( intervalId );
		};
	} );

	const time = $derived<TimeUnits>(
		date ? calculateElapsedTime( date, now ) : {
			years   : 0,
			months  : 0,
			days    : 0,
			hours   : 0,
			minutes : 0,
			seconds : 0
		}
	);
</script>

{#if date}
	<div class="flex flex-col items-start md:items-end gap-1.5 select-none">
		<div class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
			<Heart size={ 12 } class="animate-pulse" style="color: { color }; fill: { color }33;" />
			<span>Tiempo juntos</span>
		</div>

		<div class="flex items-center gap-1 sm:gap-1.5">
			<!-- Años -->
			<div
				class="flex flex-col items-center justify-center min-w-9.5 sm:min-w-11 px-2 py-1 rounded-xl bg-stone-100/80 dark:bg-white/4 border border-stone-200/60 dark:border-white/5 backdrop-blur-md shadow-2xs transition-transform hover:scale-105"
				style="box-shadow: 0 0 12px -3px { color }20;"
			>
				<span class="text-xs sm:text-sm font-black font-mono tabular-nums leading-tight" style="color: { color };">
					{ time.years }
				</span>
				<span class="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-400">
					{ time.years === 1 ? 'Año' : 'Años' }
				</span>
			</div>

			<!-- Meses -->
			<div
				class="flex flex-col items-center justify-center min-w-9.5 sm:min-w-11 px-2 py-1 rounded-xl bg-stone-100/80 dark:bg-white/4 border border-stone-200/60 dark:border-white/5 backdrop-blur-md shadow-2xs transition-transform hover:scale-105"
				style="box-shadow: 0 0 12px -3px { color }20;"
			>
				<span class="text-xs sm:text-sm font-black font-mono tabular-nums leading-tight" style="color: { color };">
					{ time.months }
				</span>
				<span class="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-400">
					{ time.months === 1 ? 'Mes' : 'Meses' }
				</span>
			</div>

			<!-- Días -->
			<div
				class="flex flex-col items-center justify-center min-w-9.5 sm:min-w-11 px-2 py-1 rounded-xl bg-stone-100/80 dark:bg-white/4 border border-stone-200/60 dark:border-white/5 backdrop-blur-md shadow-2xs transition-transform hover:scale-105"
				style="box-shadow: 0 0 12px -3px { color }20;"
			>
				<span class="text-xs sm:text-sm font-black font-mono tabular-nums leading-tight" style="color: { color };">
					{ time.days }
				</span>
				<span class="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-400">
					{ time.days === 1 ? 'Día' : 'Días' }
				</span>
			</div>

			<!-- Horas -->
			<div
				class="flex flex-col items-center justify-center min-w-9.5 sm:min-w-11 px-2 py-1 rounded-xl bg-stone-100/80 dark:bg-white/4 border border-stone-200/60 dark:border-white/5 backdrop-blur-md shadow-2xs transition-transform hover:scale-105"
				style="box-shadow: 0 0 12px -3px { color }20;"
			>
				<span class="text-xs sm:text-sm font-black font-mono tabular-nums leading-tight text-stone-700 dark:text-stone-200">
					{ padZero( time.hours ) }
				</span>
				<span class="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-400">
					Hrs
				</span>
			</div>

			<!-- Minutos -->
			<div
				class="flex flex-col items-center justify-center min-w-9.5 sm:min-w-11 px-2 py-1 rounded-xl bg-stone-100/80 dark:bg-white/4 border border-stone-200/60 dark:border-white/5 backdrop-blur-md shadow-2xs transition-transform hover:scale-105"
				style="box-shadow: 0 0 12px -3px { color }20;"
			>
				<span class="text-xs sm:text-sm font-black font-mono tabular-nums leading-tight text-stone-700 dark:text-stone-200">
					{ padZero( time.minutes ) }
				</span>
				<span class="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-400">
					Min
				</span>
			</div>

			<!-- Segundos -->
			<div
				class="flex flex-col items-center justify-center min-w-9.5 sm:min-w-11 px-2 py-1 rounded-xl bg-stone-100/80 dark:bg-white/4 border border-stone-200/60 dark:border-white/5 backdrop-blur-md shadow-2xs transition-transform hover:scale-105"
				style="box-shadow: 0 0 12px -3px { color }20;"
			>
				<span class="text-xs sm:text-sm font-black font-mono tabular-nums leading-tight text-brand-secondary dark:text-amber-400">
					{ padZero( time.seconds ) }
				</span>
				<span class="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-400">
					Seg
				</span>
			</div>
		</div>
	</div>
{:else}
	<div class="flex items-center justify-start md:justify-end">
		<button
			type="button"
			onclick={ onOpenSettings }
			class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer bg-stone-100/70 dark:bg-white/4 hover:bg-stone-200/70 dark:hover:bg-white/10 border border-dashed border-stone-300 dark:border-white/15 text-stone-600 dark:text-stone-300 shadow-2xs group"
		>
			<CalendarIcon size={ 13 } class="transition-transform group-hover:scale-110" style="color: { color };" />
			<span>+ Establecer fecha de inicio</span>
		</button>
	</div>
{/if}

