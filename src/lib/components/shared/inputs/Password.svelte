<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Lock, Eye, EyeOff, CircleAlert } from '@lucide/svelte';

	interface Props {
		value        ?: string;
		label        ?: string;
		placeholder  ?: string;
		disabled     ?: boolean;
		required     ?: boolean;
		id           ?: string;
		name         ?: string;
		isError      ?: boolean;
		errorMessage ?: string;
		helperText   ?: string;
		class        ?: string;
		icon         ?: Snippet;
		oninput      ?: ( e: Event ) => void;
		onkeydown    ?: ( e: KeyboardEvent ) => void;
		onchange     ?: ( e: Event ) => void;
	}

	let {
		value = $bindable( '' ),
		label,
		placeholder = 'Ingresa la contraseña...',
		disabled = false,
		required = false,
		id,
		name,
		isError = false,
		errorMessage = '',
		helperText = '',
		icon,
		class: customClass = '',
		oninput,
		onkeydown,
		onchange
	}: Props = $props();

	let showPassword = $state<boolean>( false );
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
				<Lock size={ 15 } />
			{/if}
		</div>

		<input
			{id}
			{name}
			type={ showPassword ? 'text' : 'password' }
			{placeholder}
			{disabled}
			{required}
			bind:value={value}
			{oninput}
			{onkeydown}
			{onchange}
			class="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-stone-100 dark:bg-white/4 border text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-100 placeholder:text-stone-400 transition-colors focus:outline-hidden { isError ? 'border-rose-500/80 focus:border-rose-500 ring-1 ring-rose-500/30' : 'border-stone-200/80 dark:border-white/10 hover:border-brand-accent/50 focus:border-brand-accent' } { disabled ? 'opacity-50 cursor-not-allowed' : '' }"
		/>

		<button
			type="button"
			onclick={() => ( showPassword = !showPassword )}
			{disabled}
			tabindex={ -1 }
			class="absolute right-3 p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-white/10 transition-colors cursor-pointer select-none disabled:opacity-40"
			title={ showPassword ? 'Ocultar contraseña' : 'Ver contraseña' }
			aria-label={ showPassword ? 'Ocultar contraseña' : 'Ver contraseña' }
		>
			{#if showPassword}
				<EyeOff size={ 16 } />
			{:else}
				<Eye size={ 16 } />
			{/if}
		</button>
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

