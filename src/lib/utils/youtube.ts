/**
 * Utilidades para extraer y manipular identificadores de video de YouTube
 */

export function extractYouTubeVideoId( urlOrId: string ): string | null {
	if ( !urlOrId || typeof urlOrId !== 'string' ) {
		return null;
	}

	const trimmed = urlOrId.trim();

	// Si ya es un ID de 11 caracteres alfanuméricos
	if ( /^[a-zA-Z0-9_-]{11}$/.test( trimmed ) ) {
		return trimmed;
	}

	// Expresión regular universal para URLs de YouTube (watch?v=, youtu.be/, /shorts/, /embed/, etc.)
	const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
	const match = trimmed.match( regex );

	if ( match && match[ 1 ] ) {
		return match[ 1 ];
	}

	return null;
}

