import type { Relationship, MomentEntity, User } from './types';
import { INITIAL_RELATIONSHIPS, INITIAL_MOMENTS, CURRENT_USER } from './data';

class MemoriesStore {
	currentUser = $state<User>( CURRENT_USER );
	groups = $state<Relationship[]>( INITIAL_RELATIONSHIPS );
	memories = $state<MomentEntity[]>( INITIAL_MOMENTS );
	theme = $state<'light' | 'dark'>( 'light' );
	isAuthenticated = $state<boolean>( false );

	constructor() {
		if ( typeof window !== 'undefined' ) {
			const savedUser = localStorage.getItem( 'ourmemories_user' );
			const savedGroups = localStorage.getItem( 'ourmemories_groups' );
			const savedMemories = localStorage.getItem( 'ourmemories_memories' );
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
			localStorage.setItem( 'ourmemories_memories', JSON.stringify( this.memories ) );
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

	addMemory( memoryData: Partial<MomentEntity> ): void {
		const newMemory: MomentEntity = {
			id              : Math.random().toString( 36 ).substring( 2, 11 ),
			relationship_id : memoryData.relationship_id || this.groups[0]?.id || 'rel_1',
			type            : memoryData.type || 'text',
			title           : memoryData.title,
			content         : memoryData.content || '',
			author          : memoryData.author || this.currentUser.name || 'Tú',
			date            : memoryData.date || new Date().toLocaleDateString( 'es-ES', { month: 'short', day: 'numeric', year: 'numeric' } ),
			metadata        : memoryData.metadata,
			tags            : memoryData.tags || []
		};

		this.memories = [ newMemory, ...this.memories ];
		this.persist();
	}

	deleteMemory( id: string ): void {
		this.memories = this.memories.filter( ( m ) => m.id !== id );
		this.persist();
	}
}

export const memoriesStore = new MemoriesStore();
