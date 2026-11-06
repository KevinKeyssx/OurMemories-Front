<script lang="ts">
	import { untrack } from 'svelte';
	import {
		Heart,
		ShieldCheck,
		UserPlus,
		Crown,
		UserCheck,
		UserMinus,
		Clock,
		Copy,
		Check,
		Trash2,
		Mail,
		Save,
		Sparkles,
		QrCode,
		RefreshCw,
		History
	} from '@lucide/svelte';

	import type {
		Relationship,
		RelationshipType,
		User,
		RelationshipInvitation
	} from '$lib/types';
	import { memoriesStore } from '$lib/store.svelte';
	import { INITIAL_RELATIONSHIP_TYPES } from '$lib/data';
	import Dialog from '$lib/components/shared/Dialog.svelte';
	import Tabs, { type TabItem } from '$lib/components/shared/Tabs.svelte';
	import Input from '$lib/components/shared/inputs/Input.svelte';
	import Select, { type SelectItem } from '$lib/components/shared/inputs/Select.svelte';
	import IconPicker from '$lib/components/shared/inputs/IconPicker.svelte';
	import MediaUploader from '$lib/components/shared/inputs/MediaUploader.svelte';
	import ColorPicker from '$lib/components/shared/inputs/ColorPicker.svelte';
	import ConfirmDialog from '$lib/components/shared/ConfirmDialog.svelte';
	import QRCode from '$lib/components/shared/QRCode.svelte';

	interface Props {
		isOpen         : boolean;
		relationship   : Relationship | null;
		initialTab    ?: 'relacion' | 'roles' | 'invitar' | 'historial';
		onClose        : () => void;
		onUpdate      ?: ( updatedRel: Relationship ) => void;
		onDelete      ?: ( id: string ) => void;
	}

	let {
		isOpen,
		relationship,
		initialTab = 'relacion',
		onClose,
		onUpdate,
		onDelete
	}: Props = $props();

	let activeTab = $state<string>( 'relacion' );

	// Pestaña 1: Estado de la relación
	let name       = $state<string>( '' );
	let typeId     = $state<string>( '1' );
	let avatar     = $state<string>( 'Heart' );
	let avatarMode = $state<string>( 'icon' );
	let color      = $state<string>( '#f43f5e' );

	// Pestaña 3: Estado de invitaciones (solo 2 canales: QR o Correo)
	let inviteChannel = $state<string>( 'qr' );
	let qrRole        = $state<'admin' | 'member'>( 'member' );
	let activeQrInv   = $state<RelationshipInvitation | null>( null );

	let emailInput    = $state<string>( '' );
	let emailRole     = $state<string>( 'member' );
	let inviteSuccess = $state<string>( '' );
	let copiedToken   = $state<string>( '' );

	// Diálogo de confirmación para eliminar relación y remover miembros
	let isConfirmDeleteOpen       = $state<boolean>( false );
	let memberToRemove            = $state<{ id: string; name: string } | null>( null );
	let isConfirmRemoveMemberOpen = $state<boolean>( false );

	// Temporizador reactivo para actualización de cuenta regresiva
	let currentTime = $state<number>( Date.now() );
	$effect( () => {
		const interval = setInterval( () => {
			currentTime = Date.now();
		}, 1000 );
		return () => clearInterval( interval );
	} );

	function ensureActiveQrInvitation( relId: string, role: 'admin' | 'member' ): void {
		// Buscar si ya existe una invitación QR activa no expirada
		const existing = memoriesStore.relationshipInvitations.find(
			( inv: RelationshipInvitation ) =>
				inv.relationship_id === relId &&
				inv.type === 'qr_link' &&
				inv.status === 'pending' &&
				inv.role === role &&
				new Date( inv.expires_at ).getTime() > Date.now()
		);

		if ( existing ) {
			activeQrInv = existing;
		} else {
			activeQrInv = memoriesStore.createRelationshipInvitation( relId, {
				type : 'qr_link',
				role : role
			} );
		}
	}

	function handleRegenerateQr(): void {
		if ( !relationship ) {
			return;
		}
		activeQrInv = memoriesStore.createRelationshipInvitation( relationship.id, {
			type : 'qr_link',
			role : qrRole
		} );
	}

	let lastInitializedKey = $state<string>( '' );

	$effect( () => {
		if ( isOpen && relationship ) {
			const currentKey = `${ relationship.id }-${ initialTab }`;
			if ( currentKey !== lastInitializedKey ) {
				lastInitializedKey = currentKey;
				untrack( () => {
					activeTab = initialTab;
					name = relationship.name || '';
					typeId = relationship.type_id || '1';
					avatar = relationship.avatar || 'Heart';
					color = relationship.color || '#f43f5e';

					const isImg = avatar.startsWith( 'http://' ) || avatar.startsWith( 'https://' ) || avatar.startsWith( 'data:image' );
					avatarMode = isImg ? 'image' : 'icon';
					inviteSuccess = '';
				} );
			}
		} else if ( !isOpen ) {
			lastInitializedKey = '';
		}
	} );

	$effect( () => {
		if ( isOpen && activeTab === 'invitar' && inviteChannel === 'qr' && relationship ) {
			const currentRole = qrRole;
			const relId = relationship.id;
			untrack( () => {
				ensureActiveQrInvitation( relId, currentRole );
			} );
		}
	} );

	const avatarTabs: TabItem[] = [
		{ id: 'icon',  label: 'Ícono' },
		{ id: 'image', label: 'Imagen' }
	];

	const inviteChannelTabs: TabItem[] = [
		{
			id          : 'qr',
			label       : 'Código QR / WhatsApp',
			icon        : QrCode,
			badge       : '5 min'
		},
		{
			id          : 'email',
			label       : 'Correo Electrónico',
			icon        : Mail,
			badge       : '24 horas'
		}
	];

	const inviteRoleItems: SelectItem[] = [
		{
			value       : 'member',
			label       : 'Miembro',
			description : 'Puede ver momentos y memorias'
		},
		{
			value       : 'admin',
			label       : 'Administrador',
			description : 'Puede gestionar miembros e invitaciones'
		}
	];

	const relationshipTypeItems = $derived<SelectItem[]>(
		INITIAL_RELATIONSHIP_TYPES.map( ( type: RelationshipType ) => ({
			value       : type.id,
			label       : type.name,
			description : type.description
		}) )
	);

	const members = $derived(
		relationship ? memoriesStore.getMembersForRelationship( relationship.id ) : []
	);

	const canManage = $derived<boolean>(
		relationship ? memoriesStore.canManageRelationship( relationship.id ) : false
	);

	const isOwnerOrSuperAdmin = $derived<boolean>(
		memoriesStore.currentUser.role === 'super_admin' ||
		Boolean( relationship && relationship.created_by === memoriesStore.currentUser.id )
	);

	const invitations = $derived<RelationshipInvitation[]>(
		relationship
			? memoriesStore.relationshipInvitations.filter( ( inv: RelationshipInvitation ) => inv.relationship_id === relationship.id )
			: []
	);

	const modalTabs = $derived<TabItem[]>( [
		{
			id    : 'relacion',
			label : 'Relación',
			icon  : Heart
		},
		{
			id    : 'roles',
			label : 'Roles',
			icon  : ShieldCheck
		},
		{
			id    : 'invitar',
			label : 'Invitar',
			icon  : UserPlus
		},
		{
			id    : 'historial',
			label : 'Historial',
			icon  : History,
			badge : invitations.length > 0 ? String( invitations.length ) : undefined
		}
	] );

	const currentQrLink = $derived<string>(
		typeof window !== 'undefined' && activeQrInv
			? `${ window.location.origin }/invite?token=${ activeQrInv.token }`
			: ''
	);

	function handleAvatarModeChange( mode: string ): void {
		avatarMode = mode;
		const isImg = avatar.startsWith( 'http://' ) || avatar.startsWith( 'https://' ) || avatar.startsWith( 'data:image' );
		if ( mode === 'icon' && isImg ) {
			avatar = 'Heart';
		} else if ( mode === 'image' && !isImg ) {
			avatar = '';
		}
	}

	function handleSaveRelationship( e: SubmitEvent ): void {
		e.preventDefault();
		if ( !relationship || !name.trim() ) {
			return;
		}

		const updatedData: Partial<Relationship> = {
			name       : name.trim(),
			type_id    : typeId,
			avatar     : avatar.trim() || 'Heart',
			color      : color || '#f43f5e',
			path_name  : name.trim().toLowerCase().replace( /\s+/g, '-' )
		};

		memoriesStore.updateRelationship( relationship.id, updatedData );

		if ( onUpdate ) {
			const refreshed = memoriesStore.groups.find( ( r: Relationship ) => r.id === relationship?.id );
			if ( refreshed ) {
				onUpdate( refreshed );
			}
		}

		onClose();
	}

	function handleConfirmDeleteRelationship(): void {
		if ( !relationship ) {
			return;
		}

		const relId = relationship.id;
		memoriesStore.deleteRelationship( relId );

		if ( onDelete ) {
			onDelete( relId );
		}

		isConfirmDeleteOpen = false;
		onClose();
	}

	function handleRoleChange( userId: string, newRole: 'admin' | 'member' ): void {
		if ( !relationship ) {
			return;
		}
		memoriesStore.updateMemberRole( relationship.id, userId, newRole );
	}

	function promptRemoveMember( member: { id: string; name: string } ): void {
		memberToRemove = member;
		isConfirmRemoveMemberOpen = true;
	}

	function handleConfirmRemoveMember(): void {
		if ( relationship && memberToRemove ) {
			memoriesStore.removeMemberFromRelationship( relationship.id, memberToRemove.id );
		}
		isConfirmRemoveMemberOpen = false;
		memberToRemove = null;
	}

	function handleSendEmailInvitation( e: SubmitEvent ): void {
		e.preventDefault();
		if ( !relationship || !emailInput.trim() ) {
			return;
		}

		const cleanEmail = emailInput.trim();
		memoriesStore.createRelationshipInvitation( relationship.id, {
			type  : 'email',
			email : cleanEmail,
			role  : emailRole === 'admin' ? 'admin' : 'member'
		} );

		inviteSuccess = `Invitación enviada con éxito a ${ cleanEmail }. Válida durante 24 horas.`;
		emailInput = '';

		setTimeout( () => {
			inviteSuccess = '';
		}, 5000 );
	}

	function handleCopyInvitationLink( inv: RelationshipInvitation ): void {
		const link = `${ window.location.origin }/invite?token=${ inv.token }`;
		navigator.clipboard.writeText( link );
		copiedToken = inv.token;
		setTimeout( () => {
			copiedToken = '';
		}, 2500 );
	}

	function handleSimulateAccept( inv: RelationshipInvitation ): void {
		const result = memoriesStore.acceptRelationshipInvitation( inv.token );
		inviteSuccess = result.message;
		setTimeout( () => {
			inviteSuccess = '';
		}, 4000 );
	}

	function formatRemainingTime( expiresAt: string, type: 'qr_link' | 'email' ): { text: string; isExpired: boolean } {
		const diffMs = new Date( expiresAt ).getTime() - currentTime;
		if ( diffMs <= 0 ) {
			return { text: 'Expirada', isExpired: true };
		}
		const totalSec = Math.floor( diffMs / 1000 );
		const hours = Math.floor( totalSec / 3600 );
		const minutes = Math.floor( ( totalSec % 3600 ) / 60 );
		const seconds = totalSec % 60;

		if ( type === 'email' && hours > 0 ) {
			return {
				text      : `${ hours }h ${ minutes }m restantes`,
				isExpired : false
			};
		}

		return {
			text      : `${ minutes }m ${ seconds < 10 ? '0' : '' }${ seconds }s`,
			isExpired : false
		};
	}
</script>

<Dialog
	open={ isOpen }
	title={`Gestionar ${ relationship?.name || 'Relación' }`}
	description="Personaliza la configuración, gestiona roles e invita nuevos miembros a este espacio"
	maxWidth="max-w-2xl"
	{onClose}
>
	<!-- Selector de Pestañas Animado Bits UI / Tabs -->
	<div class="mb-4">
		<Tabs
			tabs={ modalTabs }
			bind:activeId={ activeTab }
			color={ color }
		/>
	</div>

	{#if activeTab === 'relacion'}
		<!-- PESTAÑA 1: CONFIGURACIÓN DE LA RELACIÓN -->
		<form onsubmit={ handleSaveRelationship } class="space-y-5">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
				<Input
					bind:value={ name }
					label="Nombre de la Relación"
					placeholder="Ej. Pareja, Familia..."
					required={ true }
					id="manage-rel-name"
				/>

				<Select
					label="Tipo de Relación"
					bind:value={ typeId }
					items={ relationshipTypeItems }
					placeholder="Selecciona un tipo"
					id="manage-rel-type"
				/>
			</div>

			<!-- Avatar de la Relación -->
			<div class="pt-3 border-t border-stone-200/50 dark:border-white/5 space-y-3">
				<div class="flex items-center justify-between">
					<span class="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
						Avatar de la Relación
					</span>

					<Tabs
						tabs={ avatarTabs }
						bind:activeId={ avatarMode }
						size="small"
						color={ color }
						onChange={ handleAvatarModeChange }
					/>
				</div>

				{#if avatarMode === 'image'}
					<MediaUploader
						bind:imageUrl={ avatar }
						accept="image"
						label="Foto o Imagen de la Relación"
					/>
				{:else}
					<IconPicker
						bind:value={ avatar }
						{color}
					/>
				{/if}
			</div>

			<!-- Color de Resaltado y Botón Eliminar -->
			<div class="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-200/50 dark:border-white/5">
				<ColorPicker bind:value={ color } />

				{#if isOwnerOrSuperAdmin}
					<button
						type="button"
						onclick={ () => ( isConfirmDeleteOpen = true ) }
						class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
					>
						<Trash2 size={ 14 } />
						<span>Eliminar Relación</span>
					</button>
				{/if}
			</div>

			<!-- Botones de Acción -->
			<div class="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-white/5">
				<button
					type="button"
					onclick={ onClose }
					class="px-5 py-2.5 rounded-2xl text-xs font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
				>
					Cancelar
				</button>

				<button
					type="submit"
					disabled={ !name.trim() }
					class="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-white text-xs font-bold active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer shadow-lg"
					style="background-color: { color }; box-shadow: 0 4px 14px -2px { color }66;"
				>
					<Save size={ 15 } />
					<span>Guardar Relación</span>
				</button>
			</div>
		</form>
	{:else if activeTab === 'roles'}
		<!-- PESTAÑA 2: GESTIÓN DE ROLES -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<div>
					<h4 class="text-sm font-bold text-stone-900 dark:text-white">
						Miembros de este espacio
					</h4>
					<p class="text-[11px] text-stone-400">
						Los administradores y dueños pueden invitar miembros y cambiar permisos.
					</p>
				</div>
				<span class="text-xs font-bold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-white/5 text-stone-500">
					{ members.length } miembros
				</span>
			</div>

			<!-- Lista de Miembros -->
			<div class="divide-y divide-stone-100 dark:divide-white/5 border border-stone-200/60 dark:border-white/10 rounded-2xl overflow-hidden bg-stone-50/50 dark:bg-white/2">
				{#each members as member (member.roleId)}
					<div class="flex items-center justify-between p-3.5 sm:p-4 gap-3">
						<div class="flex items-center gap-3 min-w-0">
							<div
								class="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm"
								style="background-color: { color }20; color: { color };"
							>
								{ member.user.name.charAt( 0 ).toUpperCase() }
							</div>

							<div class="min-w-0">
								<div class="flex items-center gap-2">
									<p class="text-xs font-bold text-stone-900 dark:text-white truncate">
										{ member.user.name } { member.user.last_name }
									</p>
									{#if member.user.id === memoriesStore.currentUser.id}
										<span class="text-[10px] font-semibold text-stone-400 bg-stone-200/60 dark:bg-white/10 px-1.5 py-0.2 rounded-md">
											Tú
										</span>
									{/if}
								</div>
								<p class="text-[11px] text-stone-400 truncate">
									{ member.user.email }
								</p>
							</div>
						</div>

						<!-- Insignia y Control de Rol -->
						<div class="flex items-center gap-2 shrink-0">
							{#if member.role === 'owner'}
								<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black text-amber-500 bg-amber-500/10 border border-amber-500/20">
									<Crown size={ 12 } />
									<span>Dueño</span>
								</span>
							{:else}
								{#if canManage && member.user.id !== relationship?.created_by}
									<!-- Selector de cambio de rol para administradores -->
									<div class="flex items-center bg-stone-200/70 dark:bg-white/5 p-0.5 rounded-xl text-[11px] font-bold border border-stone-200/60 dark:border-white/10">
										<button
											type="button"
											onclick={ () => handleRoleChange( member.user.id, 'admin' ) }
											class="px-2.5 py-1 rounded-lg transition-all cursor-pointer { member.role === 'admin' ? 'bg-white dark:bg-white/15 text-stone-900 dark:text-white shadow-xs' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200' }"
										>
											Admin
										</button>
										<button
											type="button"
											onclick={ () => handleRoleChange( member.user.id, 'member' ) }
											class="px-2.5 py-1 rounded-lg transition-all cursor-pointer { member.role === 'member' ? 'bg-white dark:bg-white/15 text-stone-900 dark:text-white shadow-xs' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200' }"
										>
											Miembro
										</button>
									</div>

									<button
										type="button"
										onclick={ () => promptRemoveMember({ id: member.user.id, name: member.user.name }) }
										class="p-1.5 rounded-xl text-stone-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
										title="Remover de la relación"
										aria-label="Remover de la relación"
									>
										<UserMinus size={ 16 } />
									</button>
								{:else}
									<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-stone-500 bg-stone-100 dark:bg-white/5">
										<UserCheck size={ 12 } />
										<span>{ member.role === 'admin' ? 'Admin' : 'Miembro' }</span>
									</span>
								{/if}
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else if activeTab === 'invitar'}
		<!-- PESTAÑA 3: INVITAR NUEVOS MIEMBROS (QR / WHATSAPP vs CORREO ELECTRÓNICO) -->
		<div class="space-y-5">
			{#if !canManage}
				<div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-500 flex items-center gap-2">
					<span>Solo el dueño o los administradores de esta relación pueden invitar a nuevos miembros.</span>
				</div>
			{:else}
				<!-- Selector de Canal de Invitación Animado con Tabs -->
				<Tabs
					tabs={ inviteChannelTabs }
					bind:activeId={ inviteChannel }
					color={ color }
				/>

				{#if inviteChannel === 'qr'}
					<!-- CANAL 1: CÓDIGO QR / ENLACE (EXPIRA EN 5 MINUTOS) -->
					<div class="p-5 rounded-3xl bg-stone-50/80 dark:bg-white/3 border border-stone-200/60 dark:border-white/5 flex flex-col items-center text-center space-y-4">
						<div class="flex items-center justify-between w-full max-w-sm">
							<div class="text-left">
								<h4 class="text-xs font-black uppercase tracking-wider text-stone-500 dark:text-stone-400">
									Invitación Directa con QR
								</h4>
								<p class="text-[11px] text-stone-400">
									Válido por 5 minutos para escanear o enviar por WhatsApp
								</p>
							</div>

							<!-- Selector Rápido de Rol del QR -->
							<div class="flex items-center bg-stone-100 dark:bg-white/5 p-0.5 rounded-xl text-xs font-bold border border-stone-200/60 dark:border-white/10">
								<button
									type="button"
									onclick={ () => {
										qrRole = 'member';
										handleRegenerateQr();
									} }
									class="px-2.5 py-1 rounded-lg transition-all cursor-pointer { qrRole === 'member' ? 'bg-white dark:bg-white/15 text-stone-900 dark:text-white shadow-xs' : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200' }"
								>
									Miembro
								</button>
								<button
									type="button"
									onclick={ () => {
										qrRole = 'admin';
										handleRegenerateQr();
									} }
									class="px-2.5 py-1 rounded-lg transition-all cursor-pointer { qrRole === 'admin' ? 'bg-white dark:bg-white/15 text-stone-900 dark:text-white shadow-xs' : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200' }"
								>
									Admin
								</button>
							</div>
						</div>

						<!-- Renderizado del QR Estilizado con qr-code-styling -->
						{#if currentQrLink && activeQrInv}
							{@const timer = formatRemainingTime( activeQrInv.expires_at, 'qr_link' )}
							<QRCode
								value={ currentQrLink }
								{color}
								size={ 190 }
								filename={`qr-invitacion-${ relationship?.name || 'relacion' }`}
								showActions={ true }
							/>

							<!-- Estado del temporizador regresivo de 5 minutos -->
							<div class="flex items-center gap-2 pt-1">
								{#if timer.isExpired}
									<span class="text-xs font-bold text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full flex items-center gap-1.5">
										<Clock size={ 13 } />
										Código expirado
									</span>
								{:else}
									<span class="text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full flex items-center gap-1.5">
										<Clock size={ 13 } />
										Expira en: { timer.text }
									</span>
								{/if}

								<button
									type="button"
									onclick={ handleRegenerateQr }
									class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 bg-stone-200/60 dark:bg-white/10 transition-all cursor-pointer"
									title="Generar un nuevo código de 5 minutos"
								>
									<RefreshCw size={ 12 } />
									<span>Nuevo QR</span>
								</button>
							</div>
						{/if}
					</div>
				{:else}
					<!-- CANAL 2: INVITACIÓN POR CORREO ELECTRÓNICO (EXPIRA EN 24 HORAS) -->
					<form onsubmit={ handleSendEmailInvitation } class="p-5 rounded-3xl bg-stone-50/80 dark:bg-white/3 border border-stone-200/60 dark:border-white/5 space-y-4">
						<div class="flex items-center justify-between">
							<h4 class="text-xs font-black uppercase tracking-wider text-stone-500 dark:text-stone-400">
								Enviar Invitación por Correo
							</h4>
							<span class="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-500/20">
								<Clock size={ 11 } />
								Válido por 24 horas
							</span>
						</div>

						<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
							<div class="sm:col-span-2">
								<Input
									bind:value={ emailInput }
									type="email"
									label="Correo Electrónico Destinatario"
									placeholder="amigo@correo.com"
									required={ true }
									id="invite-email-address"
								/>
							</div>

							<div class="sm:col-span-1">
								<Select
									label="Rol Asignado"
									bind:value={ emailRole }
									items={ inviteRoleItems }
									placeholder="Seleccionar rol"
									id="invite-email-role"
								/>
							</div>
						</div>

						<div class="flex items-center justify-between pt-2">
							<p class="text-[11px] text-stone-400">
								El destinatario recibirá un enlace con plazo de 24 horas para unirse.
							</p>

							<button
								type="submit"
								disabled={ !emailInput.trim() }
								class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white text-xs font-bold active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer shadow-md"
								style="background-color: { color };"
							>
								<Mail size={ 14 } />
								<span>Enviar por Correo</span>
							</button>
						</div>
					</form>
				{/if}
			{/if}

			{#if inviteSuccess}
				<div class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-500 flex items-center gap-2 animate-in fade-in-0 duration-200">
					<Check size={ 16 } />
					<span>{ inviteSuccess }</span>
				</div>
			{/if}
		</div>
	{:else if activeTab === 'historial'}
		<!-- PESTAÑA 4: HISTORIAL DE INVITACIONES -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<div>
					<h4 class="text-sm font-bold text-stone-900 dark:text-white">
						Historial de Invitaciones
					</h4>
					<p class="text-[11px] text-stone-400">
						Registro de enlaces QR y correos electrónicos generados para este espacio.
					</p>
				</div>
				<span class="text-xs font-bold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-white/5 text-stone-500">
					{ invitations.length } registradas
				</span>
			</div>

			{#if invitations.length === 0}
				<p class="text-xs text-stone-400 text-center py-8 border border-dashed border-stone-200/60 dark:border-white/10 rounded-2xl">
					No hay invitaciones registradas para esta relación.
				</p>
			{:else}
				<div class="space-y-2.5">
					{#each invitations as inv (inv.id)}
						{@const timer = formatRemainingTime( inv.expires_at, inv.type )}
						<div class="p-3.5 rounded-2xl bg-stone-50/70 dark:bg-white/3 border border-stone-200/60 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
							<div class="space-y-1">
								<div class="flex items-center gap-2">
									<div class="p-1 rounded-lg bg-stone-200/60 dark:bg-white/10 text-stone-600 dark:text-stone-300">
										{#if inv.type === 'qr_link'}
											<QrCode size={ 13 } />
										{:else}
											<Mail size={ 13 } />
										{/if}
									</div>

									<span class="text-xs font-extrabold text-stone-900 dark:text-white">
										{ inv.email || 'Enlace / Código QR' }
									</span>

									<span class="text-[10px] font-bold px-2 py-0.5 rounded-full { inv.role === 'admin' ? 'bg-purple-500/15 text-purple-400' : 'bg-stone-200/70 dark:bg-white/10 text-stone-400' }">
										{ inv.role === 'admin' ? 'Admin' : 'Miembro' }
									</span>

									{#if inv.status === 'accepted'}
										<span class="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
											Aceptada
										</span>
									{:else if timer.isExpired || inv.status === 'expired'}
										<span class="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
											Expirada
										</span>
									{:else}
										<span class="text-[10px] font-black { inv.type === 'qr_link' ? 'text-amber-500 bg-amber-500/10' : 'text-blue-500 bg-blue-500/10' } px-2 py-0.5 rounded-full flex items-center gap-1">
											<Clock size={ 10 } />
											{ timer.text }
										</span>
									{/if}
								</div>

								<p class="text-[10px] font-mono text-stone-400 truncate max-w-sm">
									Token: { inv.token }
								</p>
							</div>

							<div class="flex items-center gap-2 shrink-0">
								{#if inv.status === 'pending' && !timer.isExpired}
									<button
										type="button"
										onclick={ () => handleCopyInvitationLink( inv ) }
										class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-200/70 dark:border-white/10 text-xs font-bold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-white dark:bg-white/5 hover:dark:bg-white/10 transition-all cursor-pointer shadow-xs active:scale-95"
									>
										{#if copiedToken === inv.token}
											<Check size={ 13 } class="text-emerald-500" />
											<span class="text-emerald-500">Copiado</span>
										{:else}
											<Copy size={ 13 } />
											<span>Copiar Enlace</span>
										{/if}
									</button>

									<button
										type="button"
										onclick={ () => handleSimulateAccept( inv ) }
										class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer active:scale-95"
										title="Simular aceptación inmediata para pruebas"
									>
										<Sparkles size={ 13 } />
										<span>Simular Aceptación</span>
									</button>
								{/if}

								<button
									type="button"
									onclick={ () => memoriesStore.cancelRelationshipInvitation( inv.id ) }
									class="p-1.5 text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
									title="Descartar invitación"
									aria-label="Descartar invitación"
								>
									<Trash2 size={ 14 } />
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</Dialog>

<!-- Diálogo de Confirmación para Eliminar Relación -->
<ConfirmDialog
	isOpen={ isConfirmDeleteOpen }
	title={`¿Eliminar "${ relationship?.name }"?`}
	description="Esta acción eliminará de forma irreversible este espacio de relación, junto con todas sus memorias, momentos y configuraciones asociadas."
	confirmText="Sí, eliminar relación"
	cancelText="Cancelar"
	variant="danger"
	onConfirm={ handleConfirmDeleteRelationship }
	onClose={ () => ( isConfirmDeleteOpen = false ) }
/>

<!-- Diálogo de Confirmación para Remover Miembro -->
<ConfirmDialog
	isOpen={ isConfirmRemoveMemberOpen }
	title={`¿Remover a ${ memberToRemove?.name }?`}
	description="El usuario perderá el acceso a los momentos y memorias compartidos en esta relación."
	confirmText="Remover Miembro"
	cancelText="Cancelar"
	variant="warning"
	onConfirm={ handleConfirmRemoveMember }
	onClose={ () => {
		isConfirmRemoveMemberOpen = false;
		memberToRemove = null;
	} }
/>
