import type { Relationship, MomentEntity, MemoryEntity, MomentUserView, MomentTag, User } from './types';
import { INITIAL_RELATIONSHIPS, INITIAL_MEMORIES, INITIAL_MOMENTS, INITIAL_USER_VIEWS, CURRENT_USER } from './data';

function computeMomentTags( data: Partial<MomentEntity> ): MomentTag[] {
	const tags: MomentTag[] = [];
	const hasImage = Boolean( data.metadata?.imageUrl && data.metadata.imageUrl.trim() !== '' );
	const hasVideo = Boolean( data.metadata?.videoUrl && data.metadata.videoUrl.trim() !== '' );
	const hasText = Boolean( data.content && data.content.trim() !== '' );

	if ( hasImage ) {
		tags.push( 'image' );
	}
	if ( hasVideo ) {
		tags.push( 'video' );
	}
	if ( hasText ) {
		tags.push( 'text' );
		if ( !hasImage && !hasVideo ) {
			tags.push( 'quote' );
		}
	}

	return tags;
}

class MemoriesStore {
	currentUser = $state<User>( CURRENT_USER );
	groups = $state<Relationship[]>( INITIAL_RELATIONSHIPS );
	memories = $state<MemoryEntity[]>( INITIAL_MEMORIES );
	moments = $state<MomentEntity[]>( INITIAL_MOMENTS );
	momentViews = $state<MomentUserView[]>( INITIAL_USER_VIEWS );
	theme = $state<'light' | 'dark'>( 'light' );
	isAuthenticated = $state<boolean>( false );

	constructor() {
		if ( typeof window !== 'undefined' ) {
			const savedUser = localStorage.getItem( 'ourmemories_user' );
			const savedGroups = localStorage.getItem( 'ourmemories_groups' );
			const savedMemories = localStorage.getItem( 'ourmemories_memories_v2' );
			const savedMoments = localStorage.getItem( 'ourmemories_moments' );
			const savedViews = localStorage.getItem( 'ourmemories_views' );
			const savedTheme = localStorage.getItem( 'ourmemories_theme' ) as 'light' | 'dark' | null;
			const savedAuth = localStorage.getItem( 'ourmemories_auth' );

			if ( savedUser ) {
				try {
					this.currentUser = JSON.parse( savedUser );
				} catch ( e ) {
					console.error( 'Error parsing saved user', e );
				}
			}

			if ( savedGroups ) {
				try {
					const parsed = JSON.parse( savedGroups );
					if ( Array.isArray( parsed ) ) {
						this.groups = parsed.map( ( g: Partial<Relationship> & { icon?: string } ) => ( {
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
							color      : g.color || '#f43f5e'
						} ) );
					}
				} catch ( e ) {
					console.error( 'Error parsing saved groups', e );
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
					this.moments = JSON.parse( savedMoments );
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
			}

			if ( savedAuth === 'true' ) {
				this.isAuthenticated = true;
			}
		}
	}

	private persist(): void {
		if ( typeof window !== 'undefined' ) {
			localStorage.setItem( 'ourmemories_user', JSON.stringify( this.currentUser ) );
			localStorage.setItem( 'ourmemories_groups', JSON.stringify( this.groups ) );
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
		// Desvincular momentos pertenecientes a la memoria eliminada
		this.moments = this.moments.map( ( moment: MomentEntity ) => {
			if ( moment.memory_id === id ) {
				const { memory_id, ...rest } = moment;
				return rest as MomentEntity;
			}
			return moment;
		} );
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

	updateMoment( id: string, updated: Partial<MomentEntity> ): boolean {
		const target = this.moments.find( ( m: MomentEntity ) => m.id === id );
		if ( !target ) {
			return false;
		}

		if ( target.created_by && target.created_by !== this.currentUser.id ) {
			console.warn( 'No tienes permisos para editar este momento porque no eres el creador.' );
			return false;
		}

		const merged = { ...target, ...updated };
		const computedTags = computeMomentTags( merged );

		this.moments = this.moments.map( ( m: MomentEntity ) => {
			if ( m.id === id ) {
				return {
					...m,
					...updated,
					updated_at : new Date().toISOString(),
					tags       : computedTags
				};
			}
			return m;
		} );
		this.persist();
		return true;
	}

	deleteMoment( id: string ): boolean {
		const target = this.moments.find( ( m: MomentEntity ) => m.id === id );
		if ( target && target.created_by && target.created_by !== this.currentUser.id ) {
			console.warn( 'No tienes permisos para eliminar este momento.' );
			return false;
		}

		this.moments = this.moments.filter( ( m: MomentEntity ) => m.id !== id );
		this.persist();
		return true;
	}

	recordMomentView( momentId: string, userId: string ): void {
		const alreadyViewed = this.momentViews.some( ( v: MomentUserView ) => v.moment_id === momentId && v.user_id === userId );
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
		return this.momentViews.some( ( v: MomentUserView ) => v.moment_id === momentId && v.user_id === userId );
	}
}

export const memoriesStore = new MemoriesStore();
