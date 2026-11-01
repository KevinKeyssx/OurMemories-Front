import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRelationshipsDatabase } from '$lib/server/relationshipsDb';

export const GET: RequestHandler = async () => {
	// Simulación obligatoria de consulta a BD con promesa de 3 segundos
	await new Promise( ( resolve ) => setTimeout( resolve, 3000 ) );

	return json( getRelationshipsDatabase() );
};
