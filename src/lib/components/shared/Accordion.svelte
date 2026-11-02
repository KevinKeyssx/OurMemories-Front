<script lang="ts">
	import { Accordion } from 'bits-ui';
	import { ChevronDown } from '@lucide/svelte';
	import type { Component, Snippet } from 'svelte';

	interface Props {
		title        : string;
		value       ?: string;
		icon        ?: Component;
		defaultOpen ?: boolean;
		class       ?: string;
		children     : Snippet;
	}

	let {
		title,
		value = 'item-1',
		icon: IconComponent,
		defaultOpen = false,
		class: customClass = '',
		children
	}: Props = $props();

	let accordionValue = $state<string>( '' );

	$effect( () => {
		accordionValue = defaultOpen ? value : '';
	} );
</script>

<Accordion.Root
	type="single"
	bind:value={accordionValue}
	class="w-full { customClass }"
>
	<Accordion.Item
		{value}
		class="w-full border-b border-stone-200/50 dark:border-white/5 last:border-b-0"
	>
		<Accordion.Header>
			<Accordion.Trigger
				class="w-full py-2 flex items-center justify-between text-xs font-bold text-stone-600 dark:text-stone-300 hover:text-brand-accent transition-colors group select-none cursor-pointer"
			>
				<div class="flex items-center gap-2">
					{#if IconComponent}
						<IconComponent size={ 15 } />
					{/if}
					<span>{ title }</span>
				</div>

				<ChevronDown
					size={ 15 }
					class="text-stone-400 group-hover:text-brand-accent transition-transform duration-300 ease-out group-data-[state=open]:rotate-180"
				/>
			</Accordion.Trigger>
		</Accordion.Header>

		<Accordion.Content
			class="accordion-animated-content overflow-hidden text-sm"
		>
			<div class="pt-2 pb-1">
				{@render children()}
			</div>
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>

<style>
	:global([data-state='open'].accordion-animated-content) {
		animation: bits-accordion-down 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	:global([data-state='closed'].accordion-animated-content) {
		animation: bits-accordion-up 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	@keyframes bits-accordion-down {
		from {
			height: 0;
			opacity: 0;
		}
		to {
			height: var(--bits-accordion-content-height);
			opacity: 1;
		}
	}

	@keyframes bits-accordion-up {
		from {
			height: var(--bits-accordion-content-height);
			opacity: 1;
		}
		to {
			height: 0;
			opacity: 0;
		}
	}
</style>
