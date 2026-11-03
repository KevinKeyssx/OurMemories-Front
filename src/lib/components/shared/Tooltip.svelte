<script lang="ts">
	import { Tooltip } from 'bits-ui';
	import type { Snippet } from 'svelte';

	interface Props {
		text          ?: string;
		side          ?: 'top' | 'right' | 'bottom' | 'left';
		sideOffset    ?: number;
		align         ?: 'start' | 'center' | 'end';
		delayDuration ?: number;
		disabled      ?: boolean;
		class         ?: string;
		contentClass  ?: string;
		children       : Snippet;
		content       ?: Snippet;
	}

	let {
		text,
		side = 'top',
		sideOffset = 6,
		align = 'center',
		delayDuration = 100,
		disabled = false,
		class: customClass = '',
		contentClass = '',
		children,
		content
	}: Props = $props();
</script>

{#if disabled || ( !text && !content )}
	{@render children()}
{:else}
	<Tooltip.Provider>
		<Tooltip.Root {delayDuration}>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<span {...props} class="inline-flex { customClass }">
						{@render children()}
					</span>
				{/snippet}
			</Tooltip.Trigger>

			<Tooltip.Portal>
				<Tooltip.Content
					{side}
					{sideOffset}
					{align}
					class="z-50 rounded-xl px-2.5 py-1 text-[11px] font-bold text-white bg-stone-900/95 dark:bg-[#180D2E] shadow-xl border border-stone-200/20 dark:border-white/15 backdrop-blur-md select-none animate-in fade-in-0 zoom-in-95 { contentClass }"
				>
					{#if content}
						{@render content()}
					{:else if text}
						<span>{ text }</span>
					{/if}
					<Tooltip.Arrow class="fill-stone-900/95 dark:fill-[#180D2E]" />
				</Tooltip.Content>
			</Tooltip.Portal>
		</Tooltip.Root>
	</Tooltip.Provider>
{/if}

