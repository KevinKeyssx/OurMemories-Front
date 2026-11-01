<script lang="ts">
	import { Select } from 'bits-ui';
	import { ChevronDown, Check } from '@lucide/svelte';

	export interface SelectItem {
		value        : string;
		label        : string;
		description ?: string;
		disabled    ?: boolean;
	}

	interface Props {
		items        : SelectItem[];
		value       ?: string;
		placeholder ?: string;
		label       ?: string;
		labelClass  ?: string;
		disabled    ?: boolean;
		name        ?: string;
		id          ?: string;
		class       ?: string;
	}

	let {
		items,
		value = $bindable( '' ),
		placeholder = 'Selecciona una opción...',
		label,
		labelClass = '',
		disabled = false,
		name,
		id,
		class: customClass = ''
	}: Props = $props();

	const selectedItem = $derived<SelectItem | undefined>(
		items.find( ( item: SelectItem ) => item.value === value )
	);
</script>

<div class="w-full flex flex-col">
	{#if label}
		<label for={id} class="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2 {labelClass}">
			{label}
		</label>
	{/if}

	<Select.Root
		type="single"
		bind:value={value}
		{disabled}
		{name}
		items={items.map( ( i: SelectItem ) => ({ value: i.value, label: i.label, disabled: i.disabled }) )}
	>
		<Select.Trigger
			{id}
			class="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/70 dark:border-white/10 text-sm font-semibold text-stone-800 dark:text-stone-100 flex items-center justify-between gap-3 shadow-sm transition-all hover:border-stone-300 dark:hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed group {customClass}"
			aria-label={label || placeholder}
		>
			<div class="flex items-center gap-2 truncate text-left">
				{#if selectedItem}
					<span class="font-bold text-stone-800 dark:text-stone-100 shrink-0">
						{selectedItem.label}
					</span>
					{#if selectedItem.description}
						<span class="text-xs text-stone-400 dark:text-stone-400 font-normal truncate">
							- {selectedItem.description}
						</span>
					{/if}
				{:else}
					<span class="text-stone-400 font-normal">
						{placeholder}
					</span>
				{/if}
			</div>

			<ChevronDown
				size={16}
				class="text-stone-400 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
			/>
		</Select.Trigger>

		<Select.Portal>
			<Select.Content
				class="z-50 min-w-[var(--bits-select-anchor-width)] max-h-72 overflow-y-auto rounded-2xl bg-white dark:bg-dark-card border border-stone-200/80 dark:border-white/10 shadow-2xl p-1.5 backdrop-blur-xl no-scrollbar animate-in fade-in-0 zoom-in-95"
				sideOffset={6}
			>
				<Select.Viewport class="p-1 space-y-1">
					{#each items as item (item.value)}
						<Select.Item
							value={item.value}
							label={item.label}
							disabled={item.disabled}
							class="w-full px-3.5 py-2.5 rounded-xl text-sm cursor-pointer select-none outline-none flex items-center justify-between transition-colors data-[highlighted]:bg-stone-100 dark:data-[highlighted]:bg-white/5 data-[disabled]:opacity-40 data-[disabled]:pointer-events-none text-stone-800 dark:text-stone-100"
						>
							{#snippet children({ selected })}
								<div class="flex flex-col text-left pr-3">
									<span class="font-bold text-sm text-stone-800 dark:text-stone-100">
										{item.label}
									</span>
									{#if item.description}
										<span class="text-xs text-stone-400 font-normal mt-0.5">
											{item.description}
										</span>
									{/if}
								</div>

								{#if selected}
									<Check size={16} class="text-brand-accent shrink-0 ml-2" />
								{/if}
							{/snippet}
						</Select.Item>
					{/each}
				</Select.Viewport>
			</Select.Content>
		</Select.Portal>
	</Select.Root>
</div>
