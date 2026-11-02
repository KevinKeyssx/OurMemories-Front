<script lang="ts">
	import type { Component } from 'svelte';
	import { Tooltip } from 'bits-ui';
	import {
		Plus,
		Grid,
		Camera,
		Quote,
		Video,
		FileText,
		Smile,
		Heart,
		Users,
		Users2,
		Baby,
		Palmtree,
		Home,
		Settings2
	} from '@lucide/svelte';
	import type { Relationship } from '$lib/types';

	interface Props {
		relationship : Relationship;
		isActive     : boolean;
	}

	let {
		relationship,
		isActive
	}: Props = $props();

	const ICON_MAP: Record<string, Component> = {
		Plus      : Plus,
		Grid      : Grid,
		Camera    : Camera,
		Quote     : Quote,
		Video     : Video,
		FileText  : FileText,
		Smile     : Smile,
		Heart     : Heart,
		Users     : Users,
		Users2    : Users2,
		Baby      : Baby,
		Palmtree  : Palmtree,
		Home      : Home,
		Settings2 : Settings2
	};

	function isImageAvatar( avatar: string | undefined ): boolean {
		if ( !avatar ) {
			return false;
		}

		return avatar.startsWith( 'http://' ) || avatar.startsWith( 'https://' ) || avatar.startsWith( 'data:image' );
	}

	const isImage = $derived<boolean>( isImageAvatar( relationship.avatar ) );
	const IconComp = $derived<Component>( ICON_MAP[ relationship.avatar ] || Heart );
</script>

<div class="group relative w-full flex items-center justify-center py-1">
	<!-- Píldora indicadora lateral izquierda con animación suave -->
	<div
		class="absolute left-0 w-1.5 rounded-r-full transition-all duration-300 ease-out { isActive ? 'h-8 opacity-100' : 'h-0 opacity-0 group-hover:h-3.5 group-hover:opacity-60' }"
		style="background-color: { relationship.color }; box-shadow: 0 0 12px { relationship.color };"
	></div>

	<!-- Tooltip Bits UI con Trigger en el avatar circular de la relación -->
	<Tooltip.Root delayDuration={ 150 }>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<a
					href={`/dashboard/${ relationship.path_name }`}
					{...props}
					class="relative size-11 ml-2 flex items-center justify-center rounded-full transition-all duration-300 shrink-0 select-none { isActive ? 'scale-110 shadow-lg' : 'hover:scale-105 bg-stone-100/70 dark:bg-white/5 hover:bg-stone-200/70 dark:hover:bg-white/10 text-stone-400 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200' }"
					style={ isActive ? `box-shadow: 0 0 0 2px ${ relationship.color }, 0 8px 24px -4px ${ relationship.color }77; background: ${ isImage ? 'transparent' : `${ relationship.color }18` }; color: ${ relationship.color };` : '' }
					aria-label={ relationship.name }
				>
					{#if isImage}
						<img
							src={ relationship.avatar }
							alt={ relationship.name }
							class="w-full h-full rounded-full object-cover transition-all duration-300 { isActive ? '' : 'opacity-85 group-hover:opacity-100' }"
						/>
					{:else}
						<IconComp
							size={ isActive ? 22 : 20 }
							class="transition-all duration-300"
							style={ isActive ? `filter: drop-shadow(0 0 8px ${ relationship.color }88);` : '' }
						/>
					{/if}
				</a>
			{/snippet}
		</Tooltip.Trigger>

		<Tooltip.Portal>
			<Tooltip.Content
				side="right"
				sideOffset={ 14 }
				class="z-50 rounded-xl px-3 py-1.5 text-xs font-semibold text-white bg-stone-900/95 dark:bg-stone-800/95 shadow-xl border border-white/10 backdrop-blur-md select-none"
			>
				<p>{ relationship.name }</p>
				<Tooltip.Arrow class="fill-stone-900/95 dark:fill-stone-800/95" />
			</Tooltip.Content>
		</Tooltip.Portal>
	</Tooltip.Root>
</div>

