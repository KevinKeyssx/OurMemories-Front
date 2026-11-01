import type { HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = ( { error } ) => {
	console.error( 'Server error:', error );
	return {
		message : 'Ha ocurrido un error inesperado en el servidor'
	};
};
