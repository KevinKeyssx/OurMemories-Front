<script lang="ts">
    import { scale, fade } from 'svelte/transition';

    import { X, Check, Trash2, Plus } from '@lucide/svelte';

    import type {
        Relationship,
        RelationshipType
    }                                   from '$lib/types';
	import Select, { type SelectItem }  from '$lib/components/shared/inputs/Select.svelte';
	import Input                        from '$lib/components/shared/inputs/Input.svelte';
	import Tabs, { type TabItem }       from '$lib/components/shared/Tabs.svelte';
	import IconPicker                   from '$lib/components/shared/inputs/IconPicker.svelte';
	import MediaUploader                from '$lib/components/shared/inputs/MediaUploader.svelte';
	import ColorPicker                  from '$lib/components/shared/inputs/ColorPicker.svelte';
	import DatePicker                   from '$lib/components/shared/inputs/DatePicker.svelte';


    interface Props {
		isOpen            : boolean;
		relationships     : Relationship[];
		relationshipTypes : RelationshipType[];
		onClose           : () => void;
		onUpdate          : ( relationships: Relationship[] ) => void;
		onCreate          : ( newRel: Partial<Relationship> ) => void;
		onDelete          : ( id: string ) => void;
	}


    let {
		isOpen = true,
		relationships,
		relationshipTypes,
		onClose,
		onUpdate
	}: Props = $props();

	const avatarTabs: TabItem[] = [
		{ id: 'icon',  label: 'Ícono' },
		{ id: 'image', label: 'Imagen' }
	];

	function initRelationships(): Relationship[] {
		return ( relationships || [] ).map( ( r: Relationship ) => ({
			...r,
			avatar  : r.avatar || ( r as unknown as { icon?: string } ).icon || 'Heart',
			type_id : r.type_id || ( relationshipTypes && relationshipTypes[ 0 ] ? relationshipTypes[ 0 ].id : '1' ),
			color   : r.color || '#f43f5e',
			date    : r.date ? r.date.split( 'T' )[ 0 ] : ''
		}) );
	}

	function initAvatarModes( rels: Relationship[] ): Record<string, string> {
		const modes: Record<string, string> = {};
		for ( const r of rels ) {
			const isImage = ( r.avatar || '' ).startsWith( 'http://' ) || ( r.avatar || '' ).startsWith( 'https://' ) || ( r.avatar || '' ).startsWith( 'data:image' );
			modes[ r.id ] = isImage ? 'image' : 'icon';
		}
		return modes;
	}

	const initialList = initRelationships();

	let localRelationships = $state<Relationship[]>( initialList );
	let avatarMode = $state<Record<string, string>>( initAvatarModes( initialList ) );

	const relationshipTypeItems = $derived<SelectItem[]>(
		( relationshipTypes || [] ).map( ( type: RelationshipType ) => ({
			value       : type.id,
			label       : type.name,
			description : type.description
		}) )
	);

	function handleTabChange( relId: string, mode: string ): void {
		avatarMode[ relId ] = mode;
		const rel = localRelationships.find( ( r: Relationship ) => r.id === relId );
		if ( rel ) {
			const isImg = ( rel.avatar || '' ).startsWith( 'http://' ) || ( rel.avatar || '' ).startsWith( 'https://' ) || ( rel.avatar || '' ).startsWith( 'data:image' );
			if ( mode === 'icon' && isImg ) {
				rel.avatar = 'Heart';
			} else if ( mode === 'image' && !isImg ) {
				rel.avatar = '';
			}
		}
	}

	function addRelationship(): void {
		const defaultTypeId = relationshipTypes && relationshipTypes.length > 0 ? relationshipTypes[ 0 ].id : '1';
		const defaultColor = '#f43f5e';

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
			color      : defaultColor,
			order      : localRelationships.length,
			date       : new Date().toISOString().split( 'T' )[ 0 ]
		};

		localRelationships = [ ...localRelationships, newRel ];
		avatarMode = {
			...avatarMode,
			[ newRel.id ] : 'icon'
		};
	}

	function removeRelationship( id: string ): void {
		if ( localRelationships.length <= 1 ) {
			alert( 'Debes mantener al menos una relación activa.' );
			return;
		}

		localRelationships = localRelationships.filter( ( r: Relationship ) => r.id !== id );
	}

	function save(): void {
		const formatted: Relationship[] = localRelationships.map( ( r: Relationship ) => ({
			...r,
			date : r.date ? ( r.date.includes( 'T' ) ? r.date : `${ r.date }T00:00:00.000Z` ) : undefined
		}) );
		onUpdate( formatted );
		onClose();
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 px-4 flex items-center justify-center overflow-y-auto py-10">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			transition:fade={ { duration: 150 } }
			class="fixed inset-0 bg-stone-950/70 backdrop-blur-md transition-opacity"
			onclick={onClose}
		></div>

		<div
			transition:scale={ { start: 0.95, duration: 200 } }
			class="relative w-full max-w-2xl bg-white dark:bg-dark-card border border-stone-200/60 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
		>
			<!-- Cabecera del Modal -->
			<div class="px-6 py-5 border-b border-stone-100 dark:border-white/5 flex items-center justify-between">
				<div>
					<h2 class="text-xl font-bold tracking-tight text-stone-800 dark:text-stone-100">
						Editar Relaciones
					</h2>
					<p class="text-xs text-stone-500 dark:text-stone-400 mt-1">
						Configura el nombre, tipo, avatar y color de cada uno de tus espacios
					</p>
				</div>

				<button
					type="button"
					onclick={onClose}
					class="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
					aria-label="Cerrar modal"
				>
					<X size={ 20 } />
				</button>
			</div>

			<!-- Lista de Relaciones Editables -->
			<div class="p-6 overflow-y-auto space-y-6 flex-1 no-scrollbar">
				{#each localRelationships as rel (rel.id)}
					<div class="p-5 sm:p-6 rounded-3xl bg-stone-50/80 dark:bg-white/3 border border-stone-200/60 dark:border-white/5 flex flex-col gap-5 transition-all">
						<!-- Fila Superior: Nombre y Tipo de Relación con nuevos componentes -->
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
							<div>
								<Input
									bind:value={rel.name}
									label="Nombre de la Relación"
									placeholder="Ej. Pareja, Familia..."
									required={ true }
									id={`rel-name-${ rel.id }`}
								/>
							</div>

							<div>
								<Select
									label="Tipo de Relación"
									bind:value={rel.type_id}
									items={relationshipTypeItems}
									placeholder="Selecciona un tipo"
									id={`rel-type-${ rel.id }`}
								/>
							</div>
						</div>

						<!-- Fecha de Inicio / Aniversario -->
						<div class="pt-3 border-t border-stone-200/50 dark:border-white/5">
							<DatePicker
								bind:value={ rel.date }
								label="Fecha de inicio / aniversario de la relación"
								id={`rel-date-${ rel.id }`}
							/>
						</div>

						<!-- Configuración de Avatar: Alternar entre Ícono o Imagen con Tabs animados -->
						<div class="pt-3 border-t border-stone-200/50 dark:border-white/5 space-y-3">
							<div class="flex items-center justify-between">
								<span class="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
									Avatar de la Relación
								</span>

								<Tabs
									tabs={avatarTabs}
									bind:activeId={avatarMode[ rel.id ]}
									size="small"
									onChange={( mode: string ) => handleTabChange( rel.id, mode )}
								/>
							</div>

							{#if avatarMode[ rel.id ] === 'image'}
								<MediaUploader
									bind:imageUrl={rel.avatar}
									accept="image"
									label="Foto o Imagen de la Relación"
								/>
							{:else}
								<IconPicker
									bind:value={rel.avatar}
									color={rel.color}
								/>
							{/if}
						</div>

						<!-- Fila Inferior: Color de Resaltado Reutilizable y Botón Eliminar -->
						<div class="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-200/50 dark:border-white/5">
							<ColorPicker
								bind:value={rel.color}
								allowReset={ false }
								label="Color de Resaltado:"
							/>

							<button
								type="button"
								onclick={() => removeRelationship( rel.id )}
								class="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
								title="Eliminar relación"
								aria-label="Eliminar relación"
							>
								<Trash2 size={ 15 } />
								<span>Eliminar</span>
							</button>
						</div>
					</div>
				{/each}

				<!-- Botón Agregar Relación -->
				<button
					type="button"
					onclick={addRelationship}
					class="w-full py-3.5 rounded-2xl border-2 border-dashed border-stone-200 dark:border-white/10 text-stone-500 dark:text-stone-400 hover:border-brand-accent hover:text-brand-accent dark:hover:border-dark-accent dark:hover:text-dark-accent text-sm font-semibold transition-all hover:bg-stone-50/50 dark:hover:bg-white/2 flex items-center justify-center gap-2 cursor-pointer"
				>
					<Plus size={ 16 } />
					<span>Agregar Nueva Relación</span>
				</button>
			</div>

			<!-- Pie del Modal: Cancelar y Guardar Cambios -->
			<div class="p-6 border-t border-stone-100 dark:border-white/5 flex items-center justify-end gap-3 bg-stone-50/50 dark:bg-white/2">
				<button
					type="button"
					onclick={onClose}
					class="px-5 py-2.5 rounded-xl border border-stone-200/80 dark:border-white/10 text-stone-600 dark:text-stone-300 text-sm font-medium hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
				>
					Cancelar
				</button>

				<button
					type="button"
					onclick={save}
					class="px-6 py-2.5 rounded-xl bg-linear-to-r from-brand-accent to-purple-600 text-white text-sm font-bold shadow-lg shadow-brand-accent/25 hover:shadow-brand-accent/40 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
				>
					<Check size={ 16 } />
					<span>Guardar Cambios</span>
				</button>
			</div>
		</div>
	</div>
{/if}
