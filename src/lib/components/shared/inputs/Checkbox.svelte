<script lang="ts">
	import { Checkbox } from 'bits-ui';
	import { Check } from '@lucide/svelte';
	import type { Component } from 'svelte';

	interface Props {
		checked     ?: boolean;
		label       ?: string;
		description ?: string;
		icon        ?: Component;
		disabled    ?: boolean;
		id          ?: string;
		class       ?: string;
	}

	let {
		checked = $bindable( false ),
		label,
		description,
		icon: IconComponent,
		disabled = false,
		id,
		class: customClass = ''
	}: Props = $props();
</script>

<div class="flex items-start gap-3 select-none { customClass }">
	<Checkbox.Root
		{id}
		bind:checked={checked}
		{disabled}
		class="mt-0.5 size-5 shrink-0 rounded-lg border border-stone-300 dark:border-white/20 bg-stone-100 dark:bg-white/5 transition-all flex items-center justify-center text-white data-[state=checked]:bg-brand-accent data-[state=checked]:border-brand-accent data-disabled:opacity-50 data-disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40"
	>
		{#snippet children({ checked })}
			{#if checked}
				<Check size={ 14 } class="stroke-3" />
			{/if}
		{/snippet}
	</Checkbox.Root>

	{#if label || description}
		<label for={id} class="flex flex-col cursor-pointer { disabled ? 'opacity-50 cursor-not-allowed' : '' }">
			{#if label}
				<span class="text-sm font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
					{#if IconComponent}
						<IconComponent size={ 15 } />
					{/if}
					<span>{ label }</span>
				</span>
			{/if}

			{#if description}
				<p class="text-xs text-stone-400 leading-relaxed mt-0.5">
					{ description }
				</p>
			{/if}
		</label>
	{/if}
</div>

