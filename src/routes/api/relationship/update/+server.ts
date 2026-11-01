import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Relationship } from '$lib/types';
import {
	getRelationshipsDatabase,
	setRelationshipsDatabase,
	createPathName,
	getCurrentUser
} from '$lib/server/relationshipsDb';

export const PATCH: RequestHandler = async ( { request } ) => {
	await new Promise( ( resolve ) => setTimeout( resolve, 600 ) );

	const body = await request.json() as Relationship | Relationship[];
	let currentList = getRelationshipsDatabase();
	const user = getCurrentUser();

	if ( Array.isArray( body ) ) {
		currentList = body.map( ( item ) => ( {
			...item,
			path_name  : item.path_name && item.path_name.length > 0 ? item.path_name : createPathName( item.name ),
			updated_by : user.id,
			updated_at : new Date().toISOString()
		} ) );
	} else if ( body && body.id ) {
		currentList = currentList.map( ( item ) => {
			if ( item.id === body.id ) {
				const nameChanged = body.name && body.name !== item.name;
				return {
					...item,
					...body,
					path_name  : nameChanged ? createPathName( body.name ) : item.path_name,
					updated_by : user.id,
					updated_at : new Date().toISOString()
				};
			}
			return item;
		} );
	}

	setRelationshipsDatabase( currentList );

	return json( currentList );
};
