const SPANISH_MONTHS: string[] = [
	'enero',
	'febrero',
	'marzo',
	'abril',
	'mayo',
	'junio',
	'julio',
	'agosto',
	'septiembre',
	'octubre',
	'noviembre',
	'diciembre'
];

/**
 * Formatea una fecha (YYYY-MM-DD, ISO o Date) al formato legible en español: "02 de mayo 2026"
 * Protege contra desfases de zona horaria al procesar strings de fecha.
 */
export function formatCaptureDate( dateInput: string | Date | undefined | null ): string {
	if ( !dateInput ) {
		return '';
	}

	if ( typeof dateInput === 'string' ) {
		const cleanDate = dateInput.trim();
		if ( !cleanDate ) {
			return '';
		}

		// Manejo directo de YYYY-MM-DD para evitar desfases de timezone
		const datePart = cleanDate.split( 'T' )[ 0 ];
		const parts = datePart.split( '-' );

		if ( parts.length === 3 ) {
			const year = parts[ 0 ];
			const monthIndex = parseInt( parts[ 1 ], 10 ) - 1;
			const day = parseInt( parts[ 2 ], 10 );

			if ( !isNaN( monthIndex ) && !isNaN( day ) && monthIndex >= 0 && monthIndex < 12 ) {
				const dayStr = String( day ).padStart( 2, '0' );
				const monthStr = SPANISH_MONTHS[ monthIndex ];
				return `${ dayStr } de ${ monthStr } ${ year }`;
			}
		}

		const parsed = new Date( cleanDate );
		if ( !isNaN( parsed.getTime() ) ) {
			const day = String( parsed.getDate() ).padStart( 2, '0' );
			const month = SPANISH_MONTHS[ parsed.getMonth() ];
			const year = parsed.getFullYear();
			return `${ day } de ${ month } ${ year }`;
		}

		return cleanDate;
	}

	if ( dateInput instanceof Date && !isNaN( dateInput.getTime() ) ) {
		const day = String( dateInput.getDate() ).padStart( 2, '0' );
		const month = SPANISH_MONTHS[ dateInput.getMonth() ];
		const year = dateInput.getFullYear();
		return `${ day } de ${ month } ${ year }`;
	}

	return '';
}

