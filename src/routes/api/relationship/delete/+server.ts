import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRelationshipsDatabase, setRelationshipsDatabase } from '$lib/server/relationshipsDb';

export const DELETE: RequestHandler = async ( { request } ) => {
	await new Promise( ( resolve ) => setTimeout( resolve, 600 ) );

	const { id } = await request.json() as { id: string };
	const currentList = getRelationshipsDatabase();
	const updatedList = currentList.filter( ( item ) => item.id !== id );

	setRelationshipsDatabase( updatedList );

	return json( { success: true, id } );
};
