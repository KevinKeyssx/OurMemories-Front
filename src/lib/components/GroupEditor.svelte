<script lang="ts">
	import type { Component } from 'svelte';
	import { scale, fade } from 'svelte/transition';
	import {
		X,
		Check,
		Heart,
		Home,
		Users,
		Users2,
		Baby,
		Palmtree,
		Grid,
		Trash2,
		Smile,
		Plus
	} from '@lucide/svelte';
	import type { Relationship, RelationshipType } from '$lib/types';
	import Select, { type SelectItem } from '$lib/components/shared/inputs/Select.svelte';


    interface Props {
		isOpen              : boolean;
		relationships       : Relationship[];
		relationshipTypes   : RelationshipType[];
		onClose             : () => void;
		onUpdate            : ( relationships: Relationship[] ) => void;
		onCreate            : ( newRel: Partial<Relationship> ) => void;
		onDelete            : ( id: string ) => void;
	}


    interface IconOption {
		id   : string;
		icon : Component;
	}


    let {
		isOpen = true,
		relationships,
		relationshipTypes,
		onClose,
		onUpdate
	}: Props = $props();


    const ICON_OPTIONS: IconOption[] = [
		{ id: 'Heart',      icon: Heart },
		{ id: 'Home',       icon: Home },
		{ id: 'Users',      icon: Users },
		{ id: 'Users2',     icon: Users2 },
		{ id: 'Baby',       icon: Baby },
		{ id: 'Palmtree',   icon: Palmtree },
		{ id: 'Grid',       icon: Grid },
		{ id: 'Smile',      icon: Smile }
	];


    const COLOR_OPTIONS: string[] = [
		'#f43f5e',
		'#ec4899',
		'#d946ef',
		'#a855f7',
		'#8b5cf6',
		'#6366f1',
		'#3b82f6',
		'#0ea5e9',
		'#06b6d4',
		'#14b8a6',
		'#10b981',
		'#22c55e',
		'#84cc16',
		'#eab308'
	];

	function initRelationships(): Relationship[] {
		return ( relationships || [] ).map( ( r: Relationship ) => ( {
			...r,
			avatar  : r.avatar || ( r as unknown as { icon?: string } ).icon || 'Heart',
			type_id : r.type_id || ( relationshipTypes && relationshipTypes[0] ? relationshipTypes[0].id : '1' ),
			color   : r.color || '#f43f5e'
		} ) );
	}

	function initAvatarModes( rels: Relationship[] ): Record<string, 'icon' | 'image'> {
		const modes: Record<string, 'icon' | 'image'> = {};
		for ( const r of rels ) {
			const isImage = ( r.avatar || '' ).startsWith( 'http://' ) || ( r.avatar || '' ).startsWith( 'https://' );
			modes[r.id] = isImage ? 'image' : 'icon';
		}
		return modes;
	}

	const initialList = initRelationships();

	let localRelationships = $state<Relationship[]>( initialList );
	let avatarMode = $state<Record<string, 'icon' | 'image'>>( initAvatarModes( initialList ) );

	const relationshipTypeItems = $derived<SelectItem[]>(
		( relationshipTypes || [] ).map( ( type: RelationshipType ) => ({
			value       : type.id,
			label       : type.name,
			description : type.description
		}) )
	);

	function toggleAvatarMode( relId: string, mode: 'icon' | 'image' ): void {
		avatarMode = {
			...avatarMode,
			[relId] : mode
		};

		const rel = localRelationships.find( ( r: Relationship ) => r.id === relId );

        if ( rel ) {
			if ( mode === 'icon' && ( ( rel.avatar || '' ).startsWith( 'http://' ) || ( rel.avatar || '' ).startsWith( 'https://' ) ) ) {
				rel.avatar = 'Heart';
			} else if ( mode === 'image' && !( ( rel.avatar || '' ).startsWith( 'http://' ) || ( rel.avatar || '' ).startsWith( 'https://' ) ) ) {
				rel.avatar = '';
			}
		}
	}

	function addRelationship(): void {
		const defaultTypeId = relationshipTypes && relationshipTypes.length > 0 ? relationshipTypes[0].id : '1';
		const randomColor   = COLOR_OPTIONS[Math.floor( Math.random() * COLOR_OPTIONS.length )];

        const newRel: Relationship = {
			id         : `rel_${ Date.now() }`,
			created_by : 'user_1',
			updated_by : 'user_1',
			name       : 'Nueva Relación',
			path_name  : '',
			avatar     : 'Heart',
			points     : 0,
			created_at : new Date().toISOString(),
			updated_at : new Date().toISOString(),
			is_active  : true,
			type_id    : defaultTypeId,
			color      : randomColor
		};

		localRelationships  = [ ...localRelationships, newRel ];
		avatarMode          = {
			...avatarMode,
			[newRel.id] : 'icon'
		};
	}


    function removeRelationship( id: string ): void {
		if ( localRelationships.length <= 1 ) {
			alert( 'Debes mantener al menos una relación' );
			return;
		}

        localRelationships = localRelationships.filter( ( r: Relationship ) => r.id !== id );
	}

	function save(): void {
		onUpdate( localRelationships );
		onClose();
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 px-4 flex items-center justify-center overflow-y-auto py-10">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			transition:fade={{ duration: 150 }}
			class="fixed inset-0 bg-stone-950/60 backdrop-blur-sm transition-opacity"
			onclick={onClose}
		></div>

		<div
			transition:scale={{ start: 0.95, duration: 200 }}
			class="relative w-full max-w-2xl bg-white dark:bg-dark-card border border-stone-200/60 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
		>
			<!-- Cabecera del Modal -->
			<div class="px-6 py-5 border-b border-stone-100 dark:border-white/5 flex items-center justify-between">
				<div>
					<h2 class="text-xl font-bold tracking-tight text-stone-800 dark:text-stone-100">Editar Relaciones</h2>
					<p class="text-xs text-stone-500 mt-1">Configura el tipo, avatar, color y nombre de tus espacios</p>
				</div>
				<button
					type="button"
					onclick={onClose}
					class="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-white/5 transition-colors"
					aria-label="Cerrar modal"
				>
					<X size={20} />
				</button>
			</div>

			<!-- Lista de Relaciones Editables -->
			<div class="p-6 overflow-y-auto space-y-5 flex-1 no-scrollbar">
				{#each localRelationships as rel (rel.id)}
					<div class="p-5 rounded-3xl bg-stone-50/80 dark:bg-white/3 border border-stone-200/60 dark:border-white/5 flex flex-col gap-4 transition-all">
						<!-- Fila Superior: Nombre y Tipo de Relación -->
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
							<div>
								<span class="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Nombre</span>
								<input
									type="text"
									bind:value={rel.name}
									placeholder="Nombre de la relación"
									class="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/70 dark:border-white/10 text-sm font-semibold text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
								/>
							</div>

							<div>
								<Select
									label="Tipo de Relación"
									bind:value={rel.type_id}
									items={relationshipTypeItems}
									placeholder="Selecciona un tipo"
								/>
							</div>
						</div>

						<!-- Configuración de Avatar: Alternar entre Icono o URL de Imagen -->
						<div class="pt-2 border-t border-stone-200/40 dark:border-white/5">
							<div class="flex items-center justify-between mb-2">
								<span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Avatar de la Relación</span>
								<div class="flex items-center gap-1 bg-stone-200/60 dark:bg-white/5 p-0.5 rounded-lg text-[10px] font-semibold">
									<button
										type="button"
										onclick={() => toggleAvatarMode( rel.id, 'icon' )}
										class="px-2 py-1 rounded-md transition-all {avatarMode[rel.id] !== 'image' ? 'bg-white dark:bg-stone-800 text-brand-ink dark:text-white shadow-sm' : 'text-stone-500'}"
									>
										Ícono
									</button>
									<button
										type="button"
										onclick={() => toggleAvatarMode( rel.id, 'image' )}
										class="px-2 py-1 rounded-md transition-all {avatarMode[rel.id] === 'image' ? 'bg-white dark:bg-stone-800 text-brand-ink dark:text-white shadow-sm' : 'text-stone-500'}"
									>
										Imagen URL
									</button>
								</div>
							</div>

							{#if avatarMode[rel.id] === 'image'}
								<input
									type="url"
									bind:value={rel.avatar}
									placeholder="https://ejemplo.com/avatar.jpg"
									class="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/70 dark:border-white/10 text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
								/>
							{:else}
								<div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
									{#each ICON_OPTIONS as opt}
										{@const IconComp = opt.icon}
										<button
											type="button"
											onclick={() => ( rel.avatar = opt.id )}
											class="p-2 rounded-xl border transition-all {rel.avatar === opt.id ? 'bg-brand-accent text-white border-brand-accent scale-110 shadow-md' : 'border-stone-200/60 dark:border-white/5 text-stone-500 hover:border-stone-300 dark:hover:border-white/10'}"
											aria-label={`Seleccionar icono ${opt.id}`}
										>
											<IconComp size={16} />
										</button>
									{/each}
								</div>
							{/if}
						</div>

						<!-- Fila Inferior: Color y Botón Eliminar -->
						<div class="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-200/40 dark:border-white/5">
							<div>
								<span class="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Color de Resaltado</span>
								<div class="flex items-center gap-1.5">
									{#each COLOR_OPTIONS.slice( 0, 7 ) as color}
										<button
											type="button"
											onclick={() => ( rel.color = color )}
											class="w-6 h-6 rounded-full border border-black/10 dark:border-white/10 transition-transform {rel.color === color ? 'scale-125 ring-2 ring-brand-accent ring-offset-2 dark:ring-offset-dark-card shadow-sm' : 'hover:scale-110'}"
											style="background-color: {color};"
											aria-label={`Seleccionar color ${color}`}
										></button>
									{/each}
								</div>
							</div>

							<button
								type="button"
								onclick={() => removeRelationship( rel.id )}
								class="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors"
								title="Eliminar relación"
								aria-label="Eliminar relación"
							>
								<Trash2 size={16} />
								<span>Eliminar</span>
							</button>
						</div>
					</div>
				{/each}

				<!-- Botón Agregar Relación -->
				<button
					type="button"
					onclick={addRelationship}
					class="w-full py-3.5 rounded-2xl border-2 border-dashed border-stone-200 dark:border-white/10 text-stone-500 dark:text-stone-400 hover:border-brand-accent hover:text-brand-accent dark:hover:border-dark-accent dark:hover:text-dark-accent text-sm font-semibold transition-all hover:bg-stone-50/50 dark:hover:bg-white/2 flex items-center justify-center gap-2"
				>
					<Plus size={16} />
					<span>Agregar Nueva Relación</span>
				</button>
			</div>

			<!-- Pie del Modal: Cancelar y Guardar Cambios -->
			<div class="p-6 border-t border-stone-100 dark:border-white/5 flex items-center justify-end gap-3 bg-stone-50/50 dark:bg-white/2">
				<button
					type="button"
					onclick={onClose}
					class="px-5 py-2.5 rounded-xl border border-stone-200/80 dark:border-white/10 text-stone-600 dark:text-stone-300 text-sm font-medium hover:bg-stone-100 dark:hover:bg-white/5 transition-colors"
				>
					Cancelar
				</button>
				<button
					type="button"
					onclick={save}
					class="px-5 py-2.5 rounded-xl bg-brand-accent text-white text-sm font-semibold hover:bg-brand-accent/90 flex items-center gap-2 shadow-md shadow-brand-accent/20 transition-all active:scale-95"
				>
					<Check size={16} />
					<span>Guardar Cambios</span>
				</button>
			</div>
		</div>
	</div>
{/if}
