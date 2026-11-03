<script lang="ts">
	import type { Snippet } from 'svelte';

    import { Loader2, CircleAlert } from '@lucide/svelte';


    export type InputType = 'text' | 'email' | 'search' | 'password' | 'url' | 'tel';


    interface Props {
		value        ?: string;
		type         ?: InputType;
		label        ?: string;
		placeholder  ?: string;
		disabled     ?: boolean;
		required     ?: boolean;
		id           ?: string;
		name         ?: string;
		isLoading    ?: boolean;
		isError      ?: boolean;
		errorMessage ?: string;
		helperText   ?: string;
		icon         ?: Snippet;
		class        ?: string;
		oninput      ?: ( e: Event ) => void;
		onkeydown    ?: ( e: KeyboardEvent ) => void;
		onchange     ?: ( e: Event ) => void;
	}


    let {
		value = $bindable( '' ),
		type = 'text',
		label,
		placeholder = '',
		disabled = false,
		required = false,
		id,
		name,
		isLoading = false,
		isError = false,
		errorMessage = '',
		helperText = '',
		icon,
		class: customClass = '',
		oninput,
		onkeydown,
		onchange
	}: Props = $props();
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
		{#if icon}
			<div class="absolute left-3.5 flex items-center pointer-events-none text-stone-400">
				{@render icon()}
			</div>
		{/if}

		<input
			{id}
			{name}
			{type}
			{placeholder}
			{disabled}
			{required}
			bind:value={value}
			{oninput}
			{onkeydown}
			{onchange}
			class="w-full py-2.5 rounded-2xl bg-stone-100 dark:bg-white/4 border text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-100 placeholder:text-stone-400 transition-colors focus:outline-hidden { icon ? 'pl-10' : 'pl-4' } { isLoading ? 'pr-10' : 'pr-4' } { isError ? 'border-rose-500/80 focus:border-rose-500 ring-1 ring-rose-500/30' : 'border-stone-200/80 dark:border-white/10 hover:border-brand-accent/50 focus:border-brand-accent' } { disabled ? 'opacity-50 cursor-not-allowed' : '' }"
		/>

		{#if isLoading}
			<div class="absolute right-3.5 flex items-center pointer-events-none text-brand-accent">
				<Loader2 size={ 16 } class="animate-spin" />
			</div>
		{/if}
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
