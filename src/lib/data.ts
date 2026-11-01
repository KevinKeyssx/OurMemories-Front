import type { Sex, RelationshipType, User, Relationship, MomentEntity } from './types';

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
	sex_id     : '1'
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

export const INITIAL_MOMENTS: MomentEntity[] = [
	{
		id              : '1',
		relationship_id : 'rel_1',
		type            : 'image',
		title           : 'Amanecer en la Montaña',
		content         : '',
		author          : 'Elena',
		date            : '12 Oct 2023',
		metadata        : {
			imageUrl : 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800'
		}
	},
	{
		id              : '2',
		relationship_id : 'rel_1',
		type            : 'quote',
		content         : 'La vida no se mide por las veces que respiras, sino por los momentos que te dejan sin aliento.',
		author          : 'Papá',
		date            : '5 Nov 2023'
	},
	{
		id              : '3',
		relationship_id : 'rel_2',
		type            : 'video',
		title           : 'Primeros pasos de Luca',
		content         : '',
		author          : 'Mamá',
		date            : '15 Nov 2023',
		metadata        : {
			videoUrl : 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
			imageUrl : 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&q=80&w=800'
		}
	},
	{
		id              : '4',
		relationship_id : 'rel_2',
		type            : 'text',
		title           : 'Receta Secreta del Abuelo',
		content         : 'Para que la salsa quede perfecta, el secreto está en añadir una pizca de canela justo antes de apagar el fuego. Nunca lo olvides.',
		author          : 'Abuelo Juan',
		date            : '28 Nov 2023'
	},
	{
		id              : '5',
		relationship_id : 'rel_3',
		type            : 'meme',
		title           : 'Cuando se cae producción',
		content         : 'Pero te acuerdas que es viernes a las 6pm',
		author          : 'Carlos',
		date            : '1 Dic 2023',
		metadata        : {
			imageUrl : 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800'
		}
	}
];

// Compatibilidad
export const INITIAL_GROUPS = INITIAL_RELATIONSHIPS;
export const INITIAL_MEMORIES = INITIAL_MOMENTS;
