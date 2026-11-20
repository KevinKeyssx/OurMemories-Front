<script lang="ts">
	import type { Component } from 'svelte';
	import { ChevronDown, HeartHandshake, Heart } from '@lucide/svelte';
	import type { Relationship } from '$lib/types';
	import { RELATIONSHIP_ICON_MAP } from '$lib/components/shared/inputs/IconPicker.svelte';

	interface Props {
		relationships : Relationship[];
		selectedId    : string;
		onSelect      : ( id: string ) => void;
		class        ?: string;
	}

	let {
		relationships,
		selectedId,
		onSelect,
		class: customClass = ''
	}: Props = $props();

	let isOpen = $state<boolean>( false );

	const currentRelation = $derived<Relationship | undefined>(
		relationships.find( ( r: Relationship ) => r.id === selectedId ) || relationships[ 0 ]
	);

	function isImageAvatar( avatar: string | undefined ): boolean {
		if ( !avatar ) {
			return false;
		}

		return avatar.startsWith( 'http://' ) || avatar.startsWith( 'https://' ) || avatar.startsWith( 'data:image' );
	}

	function getRelationIcon( avatar: string | undefined ): Component {
		if ( !avatar ) {
			return HeartHandshake as Component;
		}

		return RELATIONSHIP_ICON_MAP[ avatar ] || ( Heart as Component );
	}

	function handleSelect( id: string ): void {
		onSelect( id );
		isOpen = false;
	}
</script>

<svelte:window onclick={ () => { if ( isOpen ) { isOpen = false; } } } />

<div class="relative inline-block z-40 { customClass }">
	<!-- Botón Pill Principal con Estética Púrpura Vibrante -->
	<button
		type="button"
		onclick={ ( e: MouseEvent ) => {
			e.stopPropagation();
			isOpen = !isOpen;
		} }
		class="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#160e2c]/90 hover:bg-[#221442]/95 border text-white shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
		style="border-color: { currentRelation?.color || '#a855f7' }66; box-shadow: 0 4px 20px -2px { currentRelation?.color || '#a855f7' }44;"
	>
		<!-- Avatar / Ícono de la Relación -->
		<div
			class="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[11px] font-black shrink-0 shadow-sm overflow-hidden"
			style="background: linear-gradient(135deg, { currentRelation?.color || '#a855f7' }, { currentRelation?.color || '#a855f7' }cc);"
		>
			{#if isImageAvatar( currentRelation?.avatar )}
				<img
					src={ currentRelation?.avatar }
					alt={ currentRelation?.name || 'Avatar' }
					class="w-full h-full object-cover rounded-lg"
				/>
			{:else}
				{@const IconComp = getRelationIcon( currentRelation?.avatar )}
				<IconComp size={ 13 } />
			{/if}
		</div>

		<span class="text-xs font-bold text-white tracking-wide">
			{ currentRelation?.name || 'Seleccionar Relación' }
		</span>

		<ChevronDown
			size={ 14 }
			class="text-purple-300 transition-transform duration-300 { isOpen ? 'rotate-180' : '' }"
		/>
	</button>

	<!-- Menú Desplegable Flotante por Encima (Z-50) con Paleta Púrpura y Dorada -->
	{#if isOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			onclick={ ( e: MouseEvent ) => e.stopPropagation() }
			class="absolute top-full right-0 mt-2 min-w-64 p-2 rounded-2xl bg-linear-to-b from-[#1c1138]/98 via-[#130b28]/98 to-[#0a0516]/98 border border-purple-500/35 shadow-2xl shadow-black/90 backdrop-blur-2xl z-50 flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-200"
		>
			<div class="px-3 py-1.5 flex items-center justify-between border-b border-white/10 text-[10px] font-black uppercase tracking-wider text-purple-300">
				<span>Mis Relaciones</span>
				<span class="text-zinc-400 font-normal">({ relationships.length })</span>
			</div>

			<div class="flex flex-col gap-1 max-h-64 overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-white/10">
				{#each relationships as rel (rel.id)}
					{@const isSelected = rel.id === currentRelation?.id}
					<button
						type="button"
						onclick={ () => handleSelect( rel.id ) }
						class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left text-xs transition-all duration-200 cursor-pointer { isSelected ? 'bg-linear-to-r from-purple-600/35 to-pink-600/25 border border-purple-400/40 text-white font-bold shadow-md shadow-purple-950/50' : 'hover:bg-white/10 text-zinc-300 hover:text-white font-medium' }"
					>
						<div class="flex items-center gap-2.5 truncate">
							<div
								class="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-xs overflow-hidden"
								style="background-color: { rel.color || '#a855f7' };"
							>
								{#if isImageAvatar( rel.avatar )}
									<img
										src={ rel.avatar }
										alt={ rel.name }
										class="w-full h-full object-cover rounded-lg"
									/>
								{:else}
									{@const ItemIcon = getRelationIcon( rel.avatar )}
									<ItemIcon size={ 12 } />
								{/if}
							</div>
							<span class="truncate">{ rel.name }</span>
						</div>

						<span class="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full border border-amber-500/25 bg-amber-500/10 text-amber-300 shrink-0">
							{ rel.points || 0 } pts
						</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
