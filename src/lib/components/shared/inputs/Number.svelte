<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Clock, Plus, Minus, CircleAlert } from '@lucide/svelte';

	interface Props {
		value        ?: number;
		label        ?: string;
		placeholder  ?: string;
		disabled     ?: boolean;
		required     ?: boolean;
		min          ?: number;
		max          ?: number;
		step         ?: number;
		unit         ?: string;
		id           ?: string;
		name         ?: string;
		isError      ?: boolean;
		errorMessage ?: string;
		helperText   ?: string;
		class        ?: string;
		icon         ?: Snippet;
		oninput      ?: ( val: number | undefined ) => void;
		onchange     ?: ( val: number | undefined ) => void;
	}

	let {
		value = $bindable( undefined ),
		label,
		placeholder = '0',
		disabled = false,
		required = false,
		min,
		max,
		step = 1,
		unit,
		id,
		name,
		isError = false,
		errorMessage = '',
		helperText = '',
		icon,
		class: customClass = '',
		oninput,
		onchange
	}: Props = $props();

	function handleIncrement(): void {
		if ( disabled ) {
			return;
		}

		if ( value === undefined ) {
			value = min !== undefined ? min : step;
		} else {
			const next = value + step;
			if ( max !== undefined && next > max ) {
				value = max;
			} else {
				value = next;
			}
		}

		oninput?.( value );
		onchange?.( value );
	}

	function handleDecrement(): void {
		if ( disabled ) {
			return;
		}

		if ( value === undefined ) {
			value = min !== undefined ? min : 0;
		} else {
			const next = value - step;
			if ( min !== undefined && next < min ) {
				value = min;
			} else {
				value = next;
			}
		}

		oninput?.( value );
		onchange?.( value );
	}

	function handleInputChange( e: Event ): void {
		const target = e.target as HTMLInputElement;
		const valStr = target.value.trim();

		if ( valStr === '' ) {
			value = undefined;
		} else {
			const parsed = Number( valStr );
			if ( !isNaN( parsed ) ) {
				if ( min !== undefined && parsed < min ) {
					value = min;
				} else if ( max !== undefined && parsed > max ) {
					value = max;
				} else {
					value = parsed;
				}
			}
		}

		oninput?.( value );
		onchange?.( value );
	}
</script>

<div class="w-full flex flex-col { customClass }">
	{#if label}
		<label
			for={id}
			class="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5"
		>
			{ label }
			{#if required}
				<span class="text-brand-accent">*</span>
			{/if}
		</label>
	{/if}

	<div class="relative flex items-center w-full">
		<div class="absolute left-3.5 flex items-center pointer-events-none text-stone-400">
			{#if icon}
				{@render icon()}
			{:else}
				<Clock size={ 15 } />
			{/if}
		</div>

		<input
			{id}
			{name}
			type="number"
			{min}
			{max}
			{step}
			{placeholder}
			{disabled}
			{required}
			value={ value !== undefined ? value : '' }
			oninput={handleInputChange}
			class="w-full pl-10 pr-24 py-2.5 rounded-2xl bg-stone-100 dark:bg-white/4 border text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-100 placeholder:text-stone-400 transition-colors focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none { isError ? 'border-rose-500/80 focus:border-rose-500 ring-1 ring-rose-500/30' : 'border-stone-200/80 dark:border-white/10 hover:border-brand-accent/50 focus:border-brand-accent' } { disabled ? 'opacity-50 cursor-not-allowed' : '' }"
		/>

		<!-- Botones de aumento y disminución de segundos / valor numérico -->
		<div class="absolute right-2 flex items-center gap-1">
			{#if unit && value !== undefined}
				<span class="text-[11px] font-bold text-stone-400 pr-0.5 select-none">
					{ unit }
				</span>
			{/if}

			<button
				type="button"
				onclick={handleDecrement}
				disabled={ disabled || ( min !== undefined && value !== undefined && value <= min ) }
				tabindex={ -1 }
				class="size-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-white/10 transition-colors disabled:opacity-25 disabled:pointer-events-none cursor-pointer select-none active:scale-95"
				title="Disminuir valor"
				aria-label="Disminuir valor"
			>
				<Minus size={ 13 } />
			</button>

			<button
				type="button"
				onclick={handleIncrement}
				disabled={ disabled || ( max !== undefined && value !== undefined && value >= max ) }
				tabindex={ -1 }
				class="size-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-white/10 transition-colors disabled:opacity-25 disabled:pointer-events-none cursor-pointer select-none active:scale-95"
				title="Aumentar valor"
				aria-label="Aumentar valor"
			>
				<Plus size={ 13 } />
			</button>
		</div>
	</div>

	{#if isError && errorMessage}
		<div class="flex items-center gap-1.5 text-xs text-rose-500 font-medium mt-1.5">
			<CircleAlert size={ 13 } class="shrink-0" />
			<span>{ errorMessage }</span>
		</div>
	{:else if helperText}
		<p class="text-[11px] text-stone-400 mt-1 pl-1">
			{ helperText }
		</p>
	{/if}
</div>

