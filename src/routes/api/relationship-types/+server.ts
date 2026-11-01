import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRelationshipTypes } from '$lib/server/relationshipsDb';

export const GET: RequestHandler = async () => {
	await new Promise( ( resolve ) => setTimeout( resolve, 200 ) );
	return json( getRelationshipTypes() );
};

