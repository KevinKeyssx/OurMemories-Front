import type { Relationship, User, RelationshipType, Sex } from '$lib/types';
import {
	INITIAL_RELATIONSHIPS,
	CURRENT_USER,
	INITIAL_RELATIONSHIP_TYPES,
	INITIAL_SEXES
} from '$lib/data';

let currentUserDatabase: User = { ...CURRENT_USER };
let relationshipsDatabase: Relationship[] = [ ...INITIAL_RELATIONSHIPS ];
const relationshipTypesDatabase: RelationshipType[] = [ ...INITIAL_RELATIONSHIP_TYPES ];
const sexesDatabase: Sex[] = [ ...INITIAL_SEXES ];

export const createPathName = ( name: string ): string => {
	const base = name
		.toLowerCase()
		.trim()
		.normalize( 'NFD' )
		.replace( /[\u0300-\u036f]/g, '' )
		.replace( /[^\w\s-]/g, '' )
		.replace( /[\s_-]+/g, '-' )
		.replace( /^-+|-+$/g, '' ) || 'relacion';

	let unique = base;
	let counter = 1;
	while ( relationshipsDatabase.some( ( r ) => r.path_name === unique ) ) {
		unique = `${ base }-${ counter }`;
		counter++;
	}
	return unique;
};

export const getCurrentUser = (): User => currentUserDatabase;

export const getRelationshipsDatabase = (): Relationship[] => {
	return [ ...relationshipsDatabase ].sort( ( a: Relationship, b: Relationship ) => {
		const orderA = typeof a.order === 'number' ? a.order : 0;
		const orderB = typeof b.order === 'number' ? b.order : 0;
		if ( orderA !== orderB ) {
			return orderA - orderB;
		}
		return new Date( a.created_at ).getTime() - new Date( b.created_at ).getTime();
	} );
};

export const setRelationshipsDatabase = ( updated: Relationship[] ): void => {
	relationshipsDatabase = [ ...updated ].sort( ( a: Relationship, b: Relationship ) => {
		const orderA = typeof a.order === 'number' ? a.order : 0;
		const orderB = typeof b.order === 'number' ? b.order : 0;
		if ( orderA !== orderB ) {
			return orderA - orderB;
		}
		return new Date( a.created_at ).getTime() - new Date( b.created_at ).getTime();
	} );
};

export const getRelationshipTypes = (): RelationshipType[] => relationshipTypesDatabase;

export const getSexes = (): Sex[] => sexesDatabase;
