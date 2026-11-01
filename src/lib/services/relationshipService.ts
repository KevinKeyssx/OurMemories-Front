import {
	createQuery,
	createMutation,
	useQueryClient,
	type CreateQueryResult,
	type CreateMutationResult
} from '@tanstack/svelte-query';
import type { Relationship, RelationshipType } from '$lib/types';
import { INTERNAL_ENDPOINT } from '$lib/utils/endpoints';

export const RELATIONSHIPS_QUERY_KEY = [ 'relationships' ] as const;
export const RELATIONSHIP_TYPES_QUERY_KEY = [ 'relationship-types' ] as const;

export const fetchRelationships = async (): Promise<Relationship[]> => {
	const response = await fetch( INTERNAL_ENDPOINT.RELATIONSHIP.GET );
	if ( !response.ok ) {
		throw new Error( 'Error al obtener las relaciones' );
	}
	return response.json();
};

export const fetchRelationshipTypes = async (): Promise<RelationshipType[]> => {
	const response = await fetch( INTERNAL_ENDPOINT.RELATIONSHIP.TYPES );
	if ( !response.ok ) {
		throw new Error( 'Error al obtener los tipos de relación' );
	}
	return response.json();
};

export const createRelationship = async ( newGroup: Partial<Relationship> ): Promise<Relationship> => {
	const response = await fetch( INTERNAL_ENDPOINT.RELATIONSHIP.CREATE, {
		method  : 'POST',
		headers : {
			'Content-Type' : 'application/json'
		},
		body    : JSON.stringify( newGroup )
	} );

	if ( !response.ok ) {
		throw new Error( 'Error al crear la relación' );
	}

	return response.json();
};

export const updateRelationships = async ( payload: Relationship[] | Relationship ): Promise<Relationship[]> => {
	const response = await fetch( INTERNAL_ENDPOINT.RELATIONSHIP.UPDATE, {
		method  : 'PATCH',
		headers : {
			'Content-Type' : 'application/json'
		},
		body    : JSON.stringify( payload )
	} );

	if ( !response.ok ) {
		throw new Error( 'Error al actualizar las relaciones' );
	}

	return response.json();
};

export const deleteRelationship = async ( id: string ): Promise<{ success: boolean; id: string }> => {
	const response = await fetch( INTERNAL_ENDPOINT.RELATIONSHIP.DELETE, {
		method  : 'DELETE',
		headers : {
			'Content-Type' : 'application/json'
		},
		body    : JSON.stringify( { id } )
	} );

	if ( !response.ok ) {
		throw new Error( 'Error al eliminar la relación' );
	}

	return response.json();
};

export const useRelationshipsQuery = (): CreateQueryResult<Relationship[], Error> => {
	return createQuery( () => ( {
		queryKey : RELATIONSHIPS_QUERY_KEY,
		queryFn  : fetchRelationships
	} ) );
};

export const useRelationshipTypesQuery = (): CreateQueryResult<RelationshipType[], Error> => {
	return createQuery( () => ( {
		queryKey : RELATIONSHIP_TYPES_QUERY_KEY,
		queryFn  : fetchRelationshipTypes
	} ) );
};

export const useCreateRelationshipMutation = (): CreateMutationResult<Relationship, Error, Partial<Relationship>> => {
	const queryClient = useQueryClient();

	return createMutation( () => ( {
		mutationFn : createRelationship,
		onSuccess  : () => {
			queryClient.invalidateQueries( { queryKey: RELATIONSHIPS_QUERY_KEY } );
		}
	} ) );
};

export const useUpdateRelationshipsMutation = (): CreateMutationResult<Relationship[], Error, Relationship[] | Relationship> => {
	const queryClient = useQueryClient();

	return createMutation( () => ( {
		mutationFn : updateRelationships,
		onSuccess  : () => {
			queryClient.invalidateQueries( { queryKey: RELATIONSHIPS_QUERY_KEY } );
		}
	} ) );
};

export const useDeleteRelationshipMutation = (): CreateMutationResult<{ success: boolean; id: string }, Error, string> => {
	const queryClient = useQueryClient();

	return createMutation( () => ( {
		mutationFn : deleteRelationship,
		onSuccess  : () => {
			queryClient.invalidateQueries( { queryKey: RELATIONSHIPS_QUERY_KEY } );
		}
	} ) );
};
