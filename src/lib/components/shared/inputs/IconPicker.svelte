<script lang="ts" module>
	import type { Component } from 'svelte';
	import {
		Heart,
		HeartHandshake,
		Home,
		Users,
		Users2,
		Baby,
		Palmtree,
		Grid,
		Smile,
		Camera,
		Sparkles,
		Music,
		Plane,
		Coffee,
		Gamepad2,
		Dog,
		Cat,
		Gift,
		Sun,
		Moon,
		Bookmark,
		Compass,
		Star,
		Flame,
		Trophy,
		Film,
		Utensils,
		BookOpen,
		Plus,
		Quote,
		Video,
		FileText,
		Settings2
	} from '@lucide/svelte';

	export interface IconOption {
		id    : string;
		label : string;
		icon  : Component;
	}

	export const ALL_ICON_OPTIONS: IconOption[] = [
		{ id: 'Heart',          label: 'Amor / Corazón',   icon: Heart },
		{ id: 'HeartHandshake', label: 'Complicidad',      icon: HeartHandshake },
		{ id: 'Home',           label: 'Hogar / Familia',  icon: Home },
		{ id: 'Users',          label: 'Grupo / Amigos',   icon: Users },
		{ id: 'Users2',         label: 'Dúo / Pareja',     icon: Users2 },
		{ id: 'Baby',           label: 'Hijos / Pequeños', icon: Baby },
		{ id: 'Smile',          label: 'Felicidad',        icon: Smile },
		{ id: 'Palmtree',       label: 'Viajes / Vacaciones', icon: Palmtree },
		{ id: 'Camera',         label: 'Fotografía',       icon: Camera },
		{ id: 'Sparkles',       label: 'Magia / Especial', icon: Sparkles },
		{ id: 'Coffee',         label: 'Citas / Cafecito', icon: Coffee },
		{ id: 'Plane',          label: 'Aventuras',        icon: Plane },
		{ id: 'Music',          label: 'Música',           icon: Music },
		{ id: 'Gamepad2',       label: 'Juegos',           icon: Gamepad2 },
		{ id: 'Dog',            label: 'Perro / Mascota',  icon: Dog },
		{ id: 'Cat',            label: 'Gato / Mascota',   icon: Cat },
		{ id: 'Gift',           label: 'Sorpresas',        icon: Gift },
		{ id: 'Sun',            label: 'Días soleados',    icon: Sun },
		{ id: 'Moon',           label: 'Noches',           icon: Moon },
		{ id: 'Star',           label: 'Estrella',         icon: Star },
		{ id: 'Flame',          label: 'Pasión',           icon: Flame },
		{ id: 'Trophy',         label: 'Logros',           icon: Trophy },
		{ id: 'Film',           label: 'Cine / Películas', icon: Film },
		{ id: 'Utensils',       label: 'Comidas / Cenas',  icon: Utensils },
		{ id: 'BookOpen',       label: 'Lecturas',         icon: BookOpen },
		{ id: 'Compass',        label: 'Rumbo',            icon: Compass },
		{ id: 'Bookmark',       label: 'Favoritos',        icon: Bookmark },
		{ id: 'Grid',           label: 'General',          icon: Grid }
	];

	export const RELATIONSHIP_ICON_MAP: Record<string, Component> = {
		Heart          : Heart,
		HeartHandshake : HeartHandshake,
		Home           : Home,
		Users          : Users,
		Users2         : Users2,
		Baby           : Baby,
		Palmtree       : Palmtree,
		Grid           : Grid,
		Smile          : Smile,
		Camera         : Camera,
		Sparkles       : Sparkles,
		Music          : Music,
		Plane          : Plane,
		Coffee         : Coffee,
		Gamepad2       : Gamepad2,
		Dog            : Dog,
		Cat            : Cat,
		Gift           : Gift,
		Sun            : Sun,
		Moon           : Moon,
		Bookmark       : Bookmark,
		Compass        : Compass,
		Star           : Star,
		Flame          : Flame,
		Trophy         : Trophy,
		Film           : Film,
		Utensils       : Utensils,
		BookOpen       : BookOpen,
		Plus           : Plus,
		Quote          : Quote,
		Video          : Video,
		FileText       : FileText,
		Settings2      : Settings2
	};
</script>

<script lang="ts">
	import { slide } from 'svelte/transition';
	import { ChevronDown, ChevronUp } from '@lucide/svelte';
	import { Tooltip as BitsTooltip } from 'bits-ui';
	import Tooltip from '$lib/components/shared/Tooltip.svelte';

	interface Props {
		value       ?: string;
		color       ?: string;
		label       ?: string;
		initialShow ?: number;
		class       ?: string;
	}

	let {
		value = $bindable( 'Heart' ),
		color = '#f43f5e',
		label,
		initialShow = 8,
		class: customClass = ''
	}: Props = $props();

	let isExpanded = $state<boolean>( false );

	const initialIcons = $derived<IconOption[]>(
		ALL_ICON_OPTIONS.slice( 0, initialShow )
	);

	const extraIcons = $derived<IconOption[]>(
		ALL_ICON_OPTIONS.slice( initialShow )
	);
</script>

<div class="w-full flex flex-col space-y-2 { customClass }">
	{#if label}
		<span class="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
			{ label }
		</span>
	{/if}

	<BitsTooltip.Provider>
		<div class="p-2 rounded-2xl bg-stone-100/60 dark:bg-white/3 border border-stone-200/60 dark:border-white/5 transition-all">
			<!-- Fila inicial fija -->
			<div class="flex flex-wrap items-center gap-2">
				{#each initialIcons as opt (opt.id)}
					{@const IconComponent = opt.icon}
					{@const isSelected = value === opt.id}

					<Tooltip text={opt.label} side="top" sideOffset={ 6 }>
						<button
							type="button"
							onclick={() => ( value = opt.id )}
							class="size-9 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group { isSelected ? 'shadow-md scale-105 text-white' : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-white/10' }"
							style={ isSelected ? `background-color: ${ color }; box-shadow: 0 4px 14px -2px ${ color }77;` : '' }
							aria-label={`Seleccionar ícono ${ opt.label }`}
						>
							<IconComponent size={ 17 } />
						</button>
					</Tooltip>
				{/each}

				<button
					type="button"
					onclick={() => ( isExpanded = !isExpanded )}
					class="h-9 px-3 rounded-xl flex items-center gap-1.5 text-xs font-bold text-brand-accent hover:bg-brand-accent/10 transition-colors cursor-pointer select-none shrink-0 active:scale-95"
				>
					{#if isExpanded}
						<ChevronUp size={ 14 } />
						<span>Mostrar menos</span>
					{:else}
						<ChevronDown size={ 14 } />
						<span>+{ extraIcons.length } más</span>
					{/if}
				</button>
			</div>

			<!-- Sección de íconos adicionales con animación de altura suave al abrir y cerrar -->
			{#if isExpanded}
				<div
					transition:slide={ { duration: 250 } }
					class="overflow-hidden"
				>
					<div class="flex flex-wrap items-center gap-2 pt-2.5 mt-2 border-t border-stone-200/50 dark:border-white/5">
						{#each extraIcons as opt (opt.id)}
							{@const IconComponent = opt.icon}
							{@const isSelected = value === opt.id}

							<Tooltip text={opt.label} side="top" sideOffset={ 6 }>
								<button
									type="button"
									onclick={() => ( value = opt.id )}
									class="size-9 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group { isSelected ? 'shadow-md scale-105 text-white' : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-white/10' }"
									style={ isSelected ? `background-color: ${ color }; box-shadow: 0 4px 14px -2px ${ color }77;` : '' }
									aria-label={`Seleccionar ícono ${ opt.label }`}
								>
									<IconComponent size={ 17 } />
								</button>
							</Tooltip>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</BitsTooltip.Provider>
</div>

