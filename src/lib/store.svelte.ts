import type {
	Relationship,
	RelationshipUserRole,
	RelationshipInvitation,
	RelationshipMemberRole,
	MomentEntity,
	MemoryEntity,
	MomentUserView,
	MomentTag,
	User,
	UserRole
} from './types';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { reorderWithEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge';
import {
	INITIAL_RELATIONSHIPS,
	INITIAL_MEMORIES,
	INITIAL_MOMENTS,
	INITIAL_USER_VIEWS,
	CURRENT_USER,
	INITIAL_USERS,
	INITIAL_RELATIONSHIP_USER_ROLES,
	INITIAL_RELATIONSHIP_INVITATIONS
} from './data';

function computeMomentTags( data: Partial<MomentEntity> ): MomentTag[] {
	if ( data.tags && data.tags.length > 0 ) {
		return [ ...data.tags ];
	}

	const tags: MomentTag[] = [];
	const mediaUrl = ( data.metadata?.url || data.metadata?.imageUrl || data.metadata?.videoUrl || data.metadata?.audioUrl || '' ).trim();
	const isAudio  = Boolean( data.metadata?.audioDuration || mediaUrl.startsWith( 'data:audio' ) || mediaUrl.endsWith( '.mp3' ) || mediaUrl.endsWith( '.wav' ) || mediaUrl.endsWith( '.ogg' ) || mediaUrl.endsWith( '.webm' ) );
	const isVideo  = Boolean( mediaUrl.includes( 'youtube.com' ) || mediaUrl.includes( 'youtu.be' ) || mediaUrl.endsWith( '.mp4' ) || mediaUrl.endsWith( '.mov' ) || data.metadata?.videoUrl );
	const isImage  = Boolean( mediaUrl && !isAudio && !isVideo );
	const hasText  = Boolean( data.content && data.content.trim() !== '' );

	if ( isAudio ) {
		tags.push( 'voice note' );
	} else if ( isVideo ) {
		tags.push( 'video' );
	} else if ( isImage ) {
		tags.push( 'image' );
	}

	if ( hasText ) {
		tags.push( 'text' );
		if ( !isAudio && !isVideo && !isImage ) {
			tags.push( 'quote' );
		}
	}

	return tags;
}

class MemoriesStore {
	currentUser             = $state<User>( CURRENT_USER );
	users                   = $state<User[]>( INITIAL_USERS );
	groups                  = $state<Relationship[]>( INITIAL_RELATIONSHIPS );
	relationshipUserRoles   = $state<RelationshipUserRole[]>( INITIAL_RELATIONSHIP_USER_ROLES );
	relationshipInvitations = $state<RelationshipInvitation[]>( INITIAL_RELATIONSHIP_INVITATIONS );
	memories                = $state<MemoryEntity[]>( INITIAL_MEMORIES );
	moments                 = $state<MomentEntity[]>( INITIAL_MOMENTS );
	momentViews             = $state<MomentUserView[]>( INITIAL_USER_VIEWS );
	unlockedMomentIds       = $state<string[]>( [] );
	unlockedMemoryIds       = $state<string[]>( [] );
	memoryTimerRemaining    = $state<Record<string, number>>( {} );
	private memoryTimerIntervals: Record<string, ReturnType<typeof setInterval>> = {};
	theme                   = $state<'light' | 'dark'>( 'dark' );
	isAuthenticated         = $state<boolean>( false );

	isSyncingOrder          = $state<boolean>( false );
	lastOrderSyncTime       = $state<number | null>( null );
	private orderSyncTimeout: ReturnType<typeof setTimeout> | null = null;

	constructor() {
		if ( typeof window !== 'undefined' ) {
			const savedUser = localStorage.getItem( 'ourmemories_user' );
			const savedSystemUsers = localStorage.getItem( 'ourmemories_system_users' );
			const savedGroups = localStorage.getItem( 'ourmemories_groups' );
			const savedRoles = localStorage.getItem( 'ourmemories_relationship_roles' );
			const savedInvitations = localStorage.getItem( 'ourmemories_relationship_invitations' );
			const savedMemories = localStorage.getItem( 'ourmemories_memories_v2' );
			const savedMoments = localStorage.getItem( 'ourmemories_moments' );
			const savedViews = localStorage.getItem( 'ourmemories_views' );
			const savedTheme = localStorage.getItem( 'ourmemories_theme' ) as 'light' | 'dark' | null;
			const savedAuth = localStorage.getItem( 'ourmemories_auth' );

			if ( savedUser ) {
				try {
					const parsedUser = JSON.parse( savedUser );
					this.currentUser = {
						...CURRENT_USER,
						...parsedUser,
						role : ( parsedUser.role as UserRole ) || 'super_admin'
					};
				} catch ( e ) {
					console.error( 'Error parsing saved user', e );
				}
			}

			if ( savedSystemUsers ) {
				try {
					this.users = JSON.parse( savedSystemUsers );
				} catch ( e ) {
					console.error( 'Error parsing saved system users', e );
				}
			}

			if ( savedGroups ) {
				try {
					const parsed = JSON.parse( savedGroups );
					if ( Array.isArray( parsed ) ) {
						this.groups = parsed.map( ( g: Partial<Relationship> & { icon?: string }, index: number ) => ({
							id         : g.id || `rel_${ Math.random().toString( 36 ).substring( 2, 9 ) }`,
							created_by : g.created_by || 'user_1',
							updated_by : g.updated_by || 'user_1',
							name       : g.name || 'Relación',
							path_name  : g.path_name || ( g.name ? g.name.toLowerCase() : 'relacion' ),
							avatar     : g.avatar || g.icon || 'Heart',
							points     : typeof g.points === 'number' ? g.points : 100,
							created_at : g.created_at || new Date().toISOString(),
							updated_at : g.updated_at || new Date().toISOString(),
							is_active  : g.is_active !== undefined ? g.is_active : true,
							type_id    : g.type_id || '1',
							color      : g.color || '#f43f5e',
							order      : typeof g.order === 'number' ? g.order : index
						}) );
						this.groups.sort( ( a: Relationship, b: Relationship ) => a.order - b.order );
					}
				} catch ( e ) {
					console.error( 'Error parsing saved groups', e );
				}
			}

			if ( savedRoles ) {
				try {
					this.relationshipUserRoles = JSON.parse( savedRoles );
				} catch ( e ) {
					console.error( 'Error parsing saved relationship roles', e );
				}
			}

			if ( savedInvitations ) {
				try {
					this.relationshipInvitations = JSON.parse( savedInvitations );
				} catch ( e ) {
					console.error( 'Error parsing saved relationship invitations', e );
				}
			}

			if ( savedMemories ) {
				try {
					this.memories = JSON.parse( savedMemories );
				} catch ( e ) {
					console.error( 'Error parsing saved memories', e );
				}
			}

			if ( savedMoments ) {
				try {
					const parsedMoments = JSON.parse( savedMoments );
					if ( Array.isArray( parsedMoments ) ) {
						this.moments = parsedMoments.map( ( m: MomentEntity ) => {
							if ( m.id === '4' && m.metadata && !m.metadata.password ) {
								return {
									...m,
									metadata : {
										...m.metadata,
										password   : '1234',
										is_blocked : true
									}
								};
							}
							return m;
						} );
					}
				} catch ( e ) {
					console.error( 'Error parsing saved moments', e );
				}
			}

			if ( savedViews ) {
				try {
					this.momentViews = JSON.parse( savedViews );
				} catch ( e ) {
					console.error( 'Error parsing saved views', e );
				}
			}

			if ( savedTheme ) {
				this.theme = savedTheme;
			} else {
				this.theme = 'dark';
			}

			if ( savedAuth === 'true' ) {
				this.isAuthenticated = true;
			}
		}
	}

	private persist(): void {
		if ( typeof window !== 'undefined' ) {
			localStorage.setItem( 'ourmemories_user', JSON.stringify( this.currentUser ) );
			localStorage.setItem( 'ourmemories_system_users', JSON.stringify( this.users ) );
			localStorage.setItem( 'ourmemories_groups', JSON.stringify( this.groups ) );
			localStorage.setItem( 'ourmemories_relationship_roles', JSON.stringify( this.relationshipUserRoles ) );
			localStorage.setItem( 'ourmemories_relationship_invitations', JSON.stringify( this.relationshipInvitations ) );
			localStorage.setItem( 'ourmemories_memories_v2', JSON.stringify( this.memories ) );
			localStorage.setItem( 'ourmemories_moments', JSON.stringify( this.moments ) );
			localStorage.setItem( 'ourmemories_views', JSON.stringify( this.momentViews ) );
			localStorage.setItem( 'ourmemories_theme', this.theme );
			localStorage.setItem( 'ourmemories_auth', String( this.isAuthenticated ) );
		}
	}

	updateUser( updated: Partial<User> ): void {
		this.currentUser = {
			...this.currentUser,
			...updated,
			updated_at : new Date().toISOString()
		};
		this.persist();
	}

	toggleTheme(): void {
		this.theme = this.theme === 'light' ? 'dark' : 'light';
		this.persist();
	}

	login(): void {
		this.isAuthenticated = true;
		this.persist();
	}

	logout(): void {
		this.isAuthenticated = false;
		this.persist();
	}

	setGroups( newGroups: Relationship[] ): void {
		this.groups = newGroups;
		this.persist();
	}

	reorderRelationships( sourceId: string, targetId: string, edge: Edge | 'before' | 'after' = 'bottom' ): void {
		if ( sourceId === targetId ) {
			return;
		}

		const currentList = [ ...this.groups ].sort( ( a: Relationship, b: Relationship ) => {
			const orderA = typeof a.order === 'number' ? a.order : 0;
			const orderB = typeof b.order === 'number' ? b.order : 0;
			if ( orderA !== orderB ) {
				return orderA - orderB;
			}
			return new Date( a.created_at ).getTime() - new Date( b.created_at ).getTime();
		} );

		const startIndex = currentList.findIndex( ( r: Relationship ) => r.id === sourceId );
		const targetIndex = currentList.findIndex( ( r: Relationship ) => r.id === targetId );

		if ( startIndex === -1 || targetIndex === -1 ) {
			return;
		}

		const closestEdgeOfTarget: Edge = ( edge === 'after' || edge === 'bottom' ) ? 'bottom' : 'top';

		const reordered = reorderWithEdge( {
			list                : currentList,
			startIndex,
			indexOfTarget       : targetIndex,
			closestEdgeOfTarget,
			axis                : 'vertical'
		} );

		// Reasignación secuencial del campo order (0, 1, 2, ...)
		this.groups = reordered.map( ( item: Relationship, idx: number ) => ({
			...item,
			order      : idx,
			updated_at : new Date().toISOString()
		}) );

		this.persist();

		// Debounce de 1.5s antes de enviar la petición de sincronización al servicio
		this.scheduleRelationshipsOrderSync( 1500 );
	}

	scheduleRelationshipsOrderSync( delayMs = 1500 ): void {
		if ( this.orderSyncTimeout ) {
			clearTimeout( this.orderSyncTimeout );
		}

		this.orderSyncTimeout = setTimeout( () => {
			this.syncRelationshipsOrder();
		}, delayMs );
	}

	async syncRelationshipsOrder(): Promise<void> {
		this.isSyncingOrder = true;
		try {
			await fetch( '/api/relationship/update', {
				method  : 'PATCH',
				headers : {
					'Content-Type' : 'application/json'
				},
				body    : JSON.stringify( this.groups )
			} );
			this.lastOrderSyncTime = Date.now();
		} catch ( error ) {
			console.error( 'Error al sincronizar el orden de las relaciones en el servicio:', error );
		} finally {
			this.isSyncingOrder = false;
		}
	}

	updateRelationship( id: string, updated: Partial<Relationship> ): boolean {
		const target = this.groups.find( ( r: Relationship ) => r.id === id );
		if ( !target ) {
			return false;
		}

		this.groups = this.groups.map( ( r: Relationship ) => {
			if ( r.id === id ) {
				return {
					...r,
					...updated,
					updated_at : new Date().toISOString()
				};
			}
			return r;
		} );
		this.persist();
		return true;
	}

	deleteRelationship( id: string ): void {
		this.groups = this.groups.filter( ( r: Relationship ) => r.id !== id );
		this.relationshipUserRoles = this.relationshipUserRoles.filter(
			( rur: RelationshipUserRole ) => rur.relationship_id !== id
		);
		this.relationshipInvitations = this.relationshipInvitations.filter(
			( inv: RelationshipInvitation ) => inv.relationship_id !== id
		);

		// Eliminar memorias y momentos asociados
		const memoriesToDelete = this.memories.filter( ( m: MemoryEntity ) => m.relationship_id === id );
		for ( const m of memoriesToDelete ) {
			this.deleteMemory( m.id );
		}
		this.moments = this.moments.filter( ( m: MomentEntity ) => m.relationship_id !== id );
		this.persist();
	}

	addRelationship( data: Partial<Relationship> ): Relationship {
		const defaultTypeId = '1';
		const defaultColor = '#f43f5e';
		const newRel: Relationship = {
			id         : data.id || `rel_${ Date.now() }`,
			created_by : data.created_by || this.currentUser.id,
			updated_by : data.updated_by || this.currentUser.id,
			name       : data.name || 'Nueva Relación',
			path_name  : data.path_name || ( data.name ? data.name.toLowerCase().replace( /\s+/g, '-' ) : `relacion-${ Date.now() }` ),
			avatar     : data.avatar || 'Heart',
			points     : data.points || 0,
			created_at : data.created_at || new Date().toISOString(),
			updated_at : new Date().toISOString(),
			is_active  : data.is_active !== undefined ? data.is_active : true,
			type_id    : data.type_id || defaultTypeId,
			color      : data.color || defaultColor,
			order      : typeof data.order === 'number' ? data.order : this.groups.length
		};

		this.groups = [ ...this.groups, newRel ];

		// El creador queda registrado como owner
		const ownerRole: RelationshipUserRole = {
			id              : `rur_${ Date.now() }`,
			relationship_id : newRel.id,
			user_id         : newRel.created_by,
			role            : 'owner',
			created_at      : new Date().toISOString()
		};
		this.relationshipUserRoles = [ ...this.relationshipUserRoles, ownerRole ];

		this.persist();
		return newRel;
	}

	canManageRelationship( relationshipId?: string, userId?: string ): boolean {
		const targetUserId = userId || this.currentUser.id;

		// El super_admin global siempre puede gestionar todo
		if ( this.currentUser.role === 'super_admin' ) {
			return true;
		}

		if ( !relationshipId ) {
			return this.currentUser.role === 'admin';
		}

		const rel = this.groups.find( ( r: Relationship ) => r.id === relationshipId );
		if ( rel && rel.created_by === targetUserId ) {
			return true;
		}

		const memberRole = this.relationshipUserRoles.find(
			( rur: RelationshipUserRole ) => rur.relationship_id === relationshipId && rur.user_id === targetUserId
		);

		return memberRole?.role === 'owner' || memberRole?.role === 'admin';
	}

	getMembersForRelationship( relationshipId: string ): Array<{ user: User; role: RelationshipMemberRole; roleId: string; joinedAt: string }> {
		const rel = this.groups.find( ( r: Relationship ) => r.id === relationshipId );
		const roles = this.relationshipUserRoles.filter(
			( rur: RelationshipUserRole ) => rur.relationship_id === relationshipId
		);

		const membersList: Array<{ user: User; role: RelationshipMemberRole; roleId: string; joinedAt: string }> = [];

		for ( const roleEntry of roles ) {
			const foundUser = this.users.find( ( u: User ) => u.id === roleEntry.user_id ) || {
				id         : roleEntry.user_id,
				name       : 'Usuario',
				last_name  : '',
				email      : 'usuario@ourmemories.com',
				phone      : '',
				created_at : roleEntry.created_at,
				updated_at : roleEntry.created_at,
				points     : 0,
				birthdate  : '',
				is_active  : true,
				sex_id     : '1',
				role       : 'user' as UserRole
			};

			membersList.push({
				user     : foundUser,
				role     : roleEntry.role,
				roleId   : roleEntry.id,
				joinedAt : roleEntry.created_at
			});
		}

		// Asegurar presencia del creador como owner si no estuviera listado
		if ( rel && !membersList.some( ( m ) => m.user.id === rel.created_by ) ) {
			const creatorUser = this.users.find( ( u: User ) => u.id === rel.created_by ) || this.currentUser;
			membersList.unshift({
				user     : creatorUser,
				role     : 'owner',
				roleId   : `rur_creator_${ rel.id }`,
				joinedAt : rel.created_at
			});
		}

		return membersList;
	}

	getUserRoleInRelationship( relationshipId: string, userId: string ): RelationshipMemberRole | null {
		const rel = this.groups.find( ( r: Relationship ) => r.id === relationshipId );
		if ( rel && rel.created_by === userId ) {
			return 'owner';
		}

		const memberRole = this.relationshipUserRoles.find(
			( rur: RelationshipUserRole ) => rur.relationship_id === relationshipId && rur.user_id === userId
		);

		return memberRole ? memberRole.role : null;
	}

	updateMemberRole( relationshipId: string, userId: string, newRole: 'admin' | 'member' ): boolean {
		if ( !this.canManageRelationship( relationshipId ) ) {
			return false;
		}

		const rel = this.groups.find( ( r: Relationship ) => r.id === relationshipId );
		if ( rel && rel.created_by === userId ) {
			// El dueño / creador no puede ser degradado
			return false;
		}

		const index = this.relationshipUserRoles.findIndex(
			( rur: RelationshipUserRole ) => rur.relationship_id === relationshipId && rur.user_id === userId
		);

		if ( index !== -1 ) {
			this.relationshipUserRoles[ index ] = {
				...this.relationshipUserRoles[ index ],
				role       : newRole,
				updated_at : new Date().toISOString()
			};
			this.persist();
			return true;
		}

		return false;
	}

	removeMemberFromRelationship( relationshipId: string, userId: string ): boolean {
		if ( !this.canManageRelationship( relationshipId ) ) {
			return false;
		}

		const rel = this.groups.find( ( r: Relationship ) => r.id === relationshipId );
		if ( rel && rel.created_by === userId ) {
			return false;
		}

		this.relationshipUserRoles = this.relationshipUserRoles.filter(
			( rur: RelationshipUserRole ) => !( rur.relationship_id === relationshipId && rur.user_id === userId )
		);
		this.persist();
		return true;
	}

	createRelationshipInvitation(
		relationshipId : string,
		payload        : { type : 'qr_link' | 'email'; email ?: string; role : 'admin' | 'member' }
	): RelationshipInvitation {
		const token = `inv_${ Math.random().toString( 36 ).substring( 2, 11 ) }`;
		// QR / enlace expira en 5 minutos; correo electrónico expira en 24 horas
		const durationMs = payload.type === 'qr_link' ? 5 * 60 * 1000 : 24 * 60 * 60 * 1000;
		const newInv: RelationshipInvitation = {
			id              : `inv_${ Date.now() }_${ Math.random().toString( 36 ).substring( 2, 6 ) }`,
			relationship_id : relationshipId,
			invited_by      : this.currentUser.id,
			type            : payload.type,
			email           : payload.email,
			role            : payload.role,
			token,
			expires_at      : new Date( Date.now() + durationMs ).toISOString(),
			created_at      : new Date().toISOString(),
			status          : 'pending'
		};

		this.relationshipInvitations = [ newInv, ...this.relationshipInvitations ];
		this.persist();
		return newInv;
	}

	acceptRelationshipInvitation( tokenOrId: string ): { success: boolean; message: string } {
		const inv = this.relationshipInvitations.find(
			( i: RelationshipInvitation ) => i.token === tokenOrId || i.id === tokenOrId
		);

		if ( !inv ) {
			return { success: false, message: 'Invitación no encontrada.' };
		}

		if ( new Date( inv.expires_at ).getTime() < Date.now() ) {
			inv.status = 'expired';
			this.persist();
			const limitText = inv.type === 'qr_link' ? '5 minutos' : '24 horas';
			return { success: false, message: `La invitación ha expirado (límite de ${ limitText }).` };
		}

		if ( inv.status === 'accepted' ) {
			return { success: false, message: 'Esta invitación ya fue utilizada.' };
		}

		let targetUser: User | undefined = undefined;
		if ( inv.email ) {
			targetUser = this.users.find( ( u: User ) => u.email.toLowerCase() === inv.email?.toLowerCase() );
		}

		if ( !targetUser ) {
			const generatedName = inv.email ? inv.email.split( '@' )[ 0 ] : `Miembro ${ Math.random().toString( 36 ).substring( 2, 6 ) }`;
			targetUser = {
				id         : `user_${ Date.now() }`,
				name       : generatedName,
				last_name  : '',
				email      : inv.email || `invitado_${ Date.now() }@ourmemories.com`,
				phone      : '',
				created_at : new Date().toISOString(),
				updated_at : new Date().toISOString(),
				points     : 50,
				birthdate  : '2000-01-01',
				is_active  : true,
				sex_id     : '1',
				role       : 'user'
			};
			this.users = [ ...this.users, targetUser ];
		}

		const alreadyMember = this.relationshipUserRoles.some(
			( rur: RelationshipUserRole ) => rur.relationship_id === inv.relationship_id && rur.user_id === targetUser?.id
		);

		if ( alreadyMember ) {
			inv.status = 'accepted';
			this.persist();
			return { success: false, message: 'El usuario ya es miembro de esta relación.' };
		}

		const newRoleEntry: RelationshipUserRole = {
			id              : `rur_${ Date.now() }`,
			relationship_id : inv.relationship_id,
			user_id         : targetUser.id,
			role            : inv.role,
			created_at      : new Date().toISOString()
		};

		this.relationshipUserRoles = [ ...this.relationshipUserRoles, newRoleEntry ];
		inv.status = 'accepted';
		this.persist();

		return { success: true, message: `¡Invitación aceptada! ${ targetUser.name } se unió como ${ inv.role }.` };
	}

	cancelRelationshipInvitation( id: string ): void {
		this.relationshipInvitations = this.relationshipInvitations.filter(
			( i: RelationshipInvitation ) => i.id !== id
		);
		this.persist();
	}

	addMemory( data: Partial<MemoryEntity> ): MemoryEntity {
		const newMemory: MemoryEntity = {
			id              : data.id || `mem_${ Math.random().toString( 36 ).substring( 2, 11 ) }`,
			relationship_id : data.relationship_id || this.groups[ 0 ]?.id || 'rel_1',
			title           : data.title || 'Nueva Memoria',
			description     : data.description || '',
			cover_url       : data.cover_url || '',
			created_by      : data.created_by || this.currentUser.id,
			created_at      : data.created_at || new Date().toISOString(),
			updated_at      : new Date().toISOString(),
			is_blocked      : data.is_blocked || false,
			password        : data.password || '',
			timer           : data.timer
		};

		this.memories = [ newMemory, ...this.memories ];
		this.persist();
		return newMemory;
	}

	updateMemory( id: string, updated: Partial<MemoryEntity> ): void {
		this.memories = this.memories.map( ( m: MemoryEntity ) => {
			if ( m.id === id ) {
				return {
					...m,
					...updated,
					updated_at : new Date().toISOString()
				};
			}
			return m;
		} );
		this.persist();
	}

	deleteMemory( id: string ): void {
		this.memories = this.memories.filter( ( m: MemoryEntity ) => m.id !== id );

		// Eliminar permanentemente todos los momentos y vistas asociadas a la memoria
		const momentsToDelete = this.moments.filter( ( moment: MomentEntity ) => moment.memory_id === id );
		for ( const moment of momentsToDelete ) {
			this.clearMomentViews( moment.id );
		}

		this.moments = this.moments.filter( ( moment: MomentEntity ) => moment.memory_id !== id );
		this.persist();
	}

	addMoment( data: Partial<MomentEntity> ): MomentEntity {
		const computedTags = computeMomentTags( data );
		const newMoment: MomentEntity = {
			id              : data.id || `mom_${ Math.random().toString( 36 ).substring( 2, 11 ) }`,
			relationship_id : data.relationship_id || this.groups[ 0 ]?.id || 'rel_1',
			memory_id       : data.memory_id || undefined,
			title           : data.title || '',
			content         : data.content || '',
			author          : data.author || this.currentUser.name || 'Tú',
			created_by      : data.created_by || this.currentUser.id,
			created_at      : data.created_at || new Date().toISOString(),
			updated_at      : new Date().toISOString(),
			capture_date    : data.capture_date || new Date().toISOString().split( 'T' )[ 0 ],
			metadata        : data.metadata || {},
			tags            : computedTags
		};

		this.moments = [ newMoment, ...this.moments ];
		this.persist();
		return newMoment;
	}

	canEditMoment( moment: MomentEntity ): boolean {
		if ( this.currentUser.role === 'super_admin' || this.currentUser.role === 'admin' ) {
			return true;
		}
		return Boolean( moment.created_by && moment.created_by === this.currentUser.id );
	}

	canDeleteMoment( moment: MomentEntity ): boolean {
		if ( this.currentUser.role === 'super_admin' || this.currentUser.role === 'admin' ) {
			return true;
		}
		return Boolean( moment.created_by && moment.created_by === this.currentUser.id );
	}

	setUserRole( role: UserRole ): void {
		this.currentUser = {
			...this.currentUser,
			role,
			updated_at : new Date().toISOString()
		};
		this.persist();
	}

	clearMomentViews( momentId: string ): void {
		this.momentViews = this.momentViews.filter( ( v: MomentUserView ) => v.moment_id !== momentId );
		this.persist();
	}

	resetMomentViewForUser( momentId: string, userId: string ): void {
		this.momentViews = this.momentViews.filter(
			( v: MomentUserView ) => !( v.moment_id === momentId && v.user_id === userId )
		);
		this.persist();
	}

	isMomentViewed( momentId: string, userId: string ): boolean {
		return this.momentViews.some(
			( v: MomentUserView ) => v.moment_id === momentId && v.user_id === userId
		);
	}

	updateMoment( id: string, updated: Partial<MomentEntity> ): boolean {
		const target = this.moments.find( ( m: MomentEntity ) => m.id === id );
		if ( !target ) {
			return false;
		}

		if ( !this.canEditMoment( target ) ) {
			console.warn( 'No tienes permisos para editar este momento.' );
			return false;
		}

		const merged = { ...target, ...updated };
		const computedTags = computeMomentTags( merged );

		this.moments = this.moments.map( ( m: MomentEntity ) => {
			if ( m.id === id ) {
				return {
					...m,
					...updated,
					tags       : computedTags,
					updated_at : new Date().toISOString()
				};
			}
			return m;
		} );
		this.persist();
		return true;
	}

	deleteMoment( id: string ): boolean {
		const target = this.moments.find( ( m: MomentEntity ) => m.id === id );
		if ( !target ) {
			return false;
		}

		if ( !this.canDeleteMoment( target ) ) {
			console.warn( 'No tienes permisos para eliminar este momento.' );
			return false;
		}

		this.moments = this.moments.filter( ( m: MomentEntity ) => m.id !== id );
		this.clearMomentViews( id );
		this.persist();
		return true;
	}

	recordMomentView( momentId: string, userId: string ): void {
		const alreadyViewed = this.momentViews.some(
			( v: MomentUserView ) => v.moment_id === momentId && v.user_id === userId
		);
		if ( !alreadyViewed ) {
			const newView: MomentUserView = {
				id        : `view_${ Math.random().toString( 36 ).substring( 2, 11 ) }`,
				moment_id : momentId,
				user_id   : userId,
				viewed_at : new Date().toISOString()
			};
			this.momentViews = [ ...this.momentViews, newView ];
			this.persist();
		}
	}

	hasUserViewedMoment( momentId: string, userId: string ): boolean {
		return this.momentViews.some(
			( v: MomentUserView ) => v.moment_id === momentId && v.user_id === userId
		);
	}

	unlockMoment( id: string ): void {
		if ( !this.unlockedMomentIds.includes( id ) ) {
			this.unlockedMomentIds = [ ...this.unlockedMomentIds, id ];
		}
	}

	lockMoment( id: string ): void {
		this.unlockedMomentIds = this.unlockedMomentIds.filter( ( mid: string ) => mid !== id );
	}

	isMomentUnlocked( id: string ): boolean {
		return this.unlockedMomentIds.includes( id );
	}

	unlockMemory( id: string, timerSeconds?: number ): void {
		if ( !this.unlockedMemoryIds.includes( id ) ) {
			this.unlockedMemoryIds = [ ...this.unlockedMemoryIds, id ];
		}

		if ( this.memoryTimerIntervals[ id ] ) {
			clearInterval( this.memoryTimerIntervals[ id ] );
			delete this.memoryTimerIntervals[ id ];
		}

		if ( timerSeconds && timerSeconds > 0 ) {
			this.memoryTimerRemaining = {
				...this.memoryTimerRemaining,
				[ id ] : timerSeconds
			};

			this.memoryTimerIntervals[ id ] = setInterval( () => {
				const current = this.memoryTimerRemaining[ id ];
				if ( current && current > 1 ) {
					this.memoryTimerRemaining = {
						...this.memoryTimerRemaining,
						[ id ] : current - 1
					};
				} else {
					this.lockMemory( id );
				}
			}, 1000 );
		} else {
			const updatedRemaining = { ...this.memoryTimerRemaining };
			delete updatedRemaining[ id ];
			this.memoryTimerRemaining = updatedRemaining;
		}
	}

	lockMemory( id: string ): void {
		if ( this.memoryTimerIntervals[ id ] ) {
			clearInterval( this.memoryTimerIntervals[ id ] );
			delete this.memoryTimerIntervals[ id ];
		}

		this.unlockedMemoryIds = this.unlockedMemoryIds.filter( ( mid: string ) => mid !== id );

		const updatedRemaining = { ...this.memoryTimerRemaining };
		delete updatedRemaining[ id ];
		this.memoryTimerRemaining = updatedRemaining;
	}

	isMemoryUnlocked( id: string ): boolean {
		return this.unlockedMemoryIds.includes( id );
	}

	getMemoryRemainingSeconds( id: string ): number | undefined {
		return this.memoryTimerRemaining[ id ];
	}
}

export const memoriesStore = new MemoriesStore();
