import type { Sex, RelationshipType, User, Relationship, MomentEntity, MemoryEntity, MomentUserView } from './types';

export const INITIAL_SEXES: Sex[] = [
	{
		id         : '1',
		name       : 'Masculino',
		short_name : 'M'
	},
	{
		id         : '2',
		name       : 'Femenino',
		short_name : 'F'
	},
	{
		id         : '3',
		name       : 'Otro',
		short_name : 'O'
	}
];

export const INITIAL_RELATIONSHIP_TYPES: RelationshipType[] = [
	{
		id          : '1',
		name        : 'Pareja',
		description : 'Amor, complicidad y momentos íntimos'
	},
	{
		id          : '2',
		name        : 'Familia',
		description : 'Lazos de sangre, unión y hogar'
	},
	{
		id          : '3',
		name        : 'Amigos',
		description : 'Amistad, risas y aventuras compartidas'
	},
	{
		id          : '4',
		name        : 'Mascota',
		description : 'Compañeros fieles e incondicionales'
	}
];

export const CURRENT_USER: User = {
	id         : 'user_1',
	name       : 'Kevin',
	last_name  : 'Dev',
	email      : 'kevin@ourmemories.com',
	phone      : '+56912345678',
	created_at : '2023-01-01T00:00:00.000Z',
	updated_at : '2026-10-31T00:00:00.000Z',
	points     : 450,
	birthdate  : '1998-05-15',
	is_active  : true,
	sex_id     : '1',
	role       : 'super_admin'
};

export const INITIAL_RELATIONSHIPS: Relationship[] = [
	{
		id         : 'rel_1',
		created_by : 'user_1',
		updated_by : 'user_1',
		name       : 'Pareja',
		path_name  : 'pareja',
		avatar     : 'Heart',
		points     : 240,
		created_at : '2023-02-14T00:00:00.000Z',
		updated_at : '2026-10-31T00:00:00.000Z',
		is_active  : true,
		type_id    : '1',
		color      : '#f43f5e'
	},
	{
		id         : 'rel_2',
		created_by : 'user_1',
		updated_by : 'user_1',
		name       : 'Familia',
		path_name  : 'familia',
		avatar     : 'Home',
		points     : 180,
		created_at : '2023-03-01T00:00:00.000Z',
		updated_at : '2026-10-31T00:00:00.000Z',
		is_active  : true,
		type_id    : '2',
		color      : '#c084fc'
	},
	{
		id         : 'rel_3',
		created_by : 'user_1',
		updated_by : 'user_1',
		name       : 'Amigos',
		path_name  : 'amigos',
		avatar     : 'Users',
		points     : 95,
		created_at : '2023-04-10T00:00:00.000Z',
		updated_at : '2026-10-31T00:00:00.000Z',
		is_active  : true,
		type_id    : '3',
		color      : '#38bdf8'
	}
];

export const INITIAL_MEMORIES: MemoryEntity[] = [
	{
		id              : 'mem_1',
		relationship_id : 'rel_1',
		title           : 'Viaje a las Montañas',
		description     : 'Nuestra primera gran aventura juntos en la cordillera.',
		cover_url       : 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
		created_by      : 'user_1',
		created_at      : '2023-10-10T10:00:00.000Z',
		updated_at      : '2023-10-10T10:00:00.000Z'
	},
	{
		id              : 'mem_2',
		relationship_id : 'rel_1',
		title           : 'Cena de Aniversario Secreta',
		description     : 'Momentos y dedicatorias privadas de nuestro aniversario.',
		cover_url       : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
		created_by      : 'user_1',
		created_at      : '2024-02-14T20:00:00.000Z',
		updated_at      : '2024-02-14T20:00:00.000Z',
		is_blocked      : true,
		password        : '1234'
	},
	{
		id              : 'mem_3',
		relationship_id : 'rel_2',
		title           : 'Historia de Familia',
		description     : 'Recetas, consejos y anécdotas compartidas por los abuelos.',
		cover_url       : 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800',
		created_by      : 'user_1',
		created_at      : '2023-11-20T12:00:00.000Z',
		updated_at      : '2023-11-20T12:00:00.000Z'
	}
];

export const INITIAL_MOMENTS: MomentEntity[] = [
	{
		id              : '1',
		relationship_id : 'rel_1',
		memory_id       : 'mem_1',
		title           : 'Amanecer en la Cumbre',
		content         : 'El frío valió la pena por este amanecer inolvidable.',
		author          : 'Elena',
		created_by      : 'user_1',
		created_at      : '2023-10-12T08:30:00.000Z',
		capture_date    : '2023-10-12',
		tags            : [ 'image', 'text' ],
		metadata        : {
			imageUrl : 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800'
		}
	},
	{
		id              : '2',
		relationship_id : 'rel_1',
		memory_id       : 'mem_1',
		title           : 'Frase del Viaje',
		content         : 'La vida no se mide por las veces que respiras, sino por los momentos que te dejan sin aliento.',
		author          : 'Kevin',
		created_by      : 'user_1',
		created_at      : '2023-10-13T14:00:00.000Z',
		capture_date    : '2023-10-13',
		tags            : [ 'text', 'quote' ],
		metadata        : {
			bgColor : '#fdf2f8'
		}
	},
	{
		id              : '3',
		relationship_id : 'rel_1',
		title           : 'Sorpresa Efímera Especial',
		content         : '¡Este mensaje solo se puede ver una vez!',
		author          : 'Elena',
		created_by      : 'user_2',
		created_at      : '2023-11-05T19:00:00.000Z',
		capture_date    : '2023-11-05',
		tags            : [ 'image', 'text' ],
		metadata        : {
			imageUrl    : 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=800',
			is_temporal : true
		}
	},
	{
		id              : '4',
		relationship_id : 'rel_1',
		title           : 'Cápsula Bloqueada',
		content         : 'Clave para ver: 1234. Nuestro secreto mejor guardado.',
		author          : 'Kevin',
		created_by      : 'user_1',
		created_at      : '2023-11-08T22:00:00.000Z',
		capture_date    : '2023-11-08',
		tags            : [ 'text', 'quote' ],
		metadata        : {
			is_blocked : true,
			password   : '1234',
			bgColor    : '#fef3c7'
		}
	},
	{
		id              : '5',
		relationship_id : 'rel_2',
		memory_id       : 'mem_3',
		title           : 'Primeros pasos de Luca',
		content         : 'El día en que comenzó a caminar.',
		author          : 'Mamá',
		created_by      : 'user_1',
		created_at      : '2023-11-15T16:00:00.000Z',
		capture_date    : '2023-11-15',
		tags            : [ 'video', 'image', 'text' ],
		metadata        : {
			videoUrl : 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
			imageUrl : 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&q=80&w=800'
		}
	},
	{
		id              : '6',
		relationship_id : 'rel_2',
		memory_id       : 'mem_3',
		title           : 'Receta Secreta del Abuelo',
		content         : 'Para que la salsa quede perfecta, el secreto está en añadir una pizca de canela justo antes de apagar el fuego. Nunca lo olvides.',
		author          : 'Abuelo Juan',
		created_by      : 'user_1',
		created_at      : '2023-11-28T11:00:00.000Z',
		capture_date    : '2023-11-28',
		tags            : [ 'text', 'quote' ],
		metadata        : {
			bgColor : '#ecfdf5'
		}
	},
	{
		id              : '7',
		relationship_id : 'rel_3',
		title           : 'Cuando se cae producción',
		content         : 'Pero te acuerdas que es viernes a las 6pm',
		author          : 'Carlos',
		created_by      : 'user_3',
		created_at      : '2023-12-01T18:05:00.000Z',
		capture_date    : '2023-12-01',
		tags            : [ 'image', 'text' ],
		metadata        : {
			imageUrl : 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800'
		}
	}
];

export const INITIAL_USER_VIEWS: MomentUserView[] = [];

// Compatibilidad
export const INITIAL_GROUPS = INITIAL_RELATIONSHIPS;
