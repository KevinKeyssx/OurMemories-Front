import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Relationship } from '$lib/types';
import {
	getRelationshipsDatabase,
	setRelationshipsDatabase,
	createPathName,
	getCurrentUser
} from '$lib/server/relationshipsDb';

export const POST: RequestHandler = async ( { request } ) => {
	await new Promise( ( resolve ) => setTimeout( resolve, 600 ) );

	const body = await request.json() as Partial<Relationship>;
	const currentList = getRelationshipsDatabase();
	const user = getCurrentUser();

	const name = ( body.name || 'Nueva Relación' ).trim();
	// El path_name se genera automáticamente en el servidor y nunca se toma del cliente
	const path_name = createPathName( name );

	const newRelationship: Relationship = {
		id         : Math.random().toString( 36 ).substring( 2, 11 ),
		created_by : user.id,
		updated_by : user.id,
		name,
		path_name,
		avatar     : body.avatar || 'Heart',
		points     : 0,
		created_at : new Date().toISOString(),
		updated_at : new Date().toISOString(),
		is_active  : true,
		type_id    : body.type_id || '1',
		color      : body.color || '#f43f5e',
		order      : typeof body.order === 'number' ? body.order : currentList.length,
		date       : body.date || undefined
	};

	const updatedList = [ ...currentList, newRelationship ];
	setRelationshipsDatabase( updatedList );

	return json( newRelationship, { status: 201 } );
};
