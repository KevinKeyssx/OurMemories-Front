import type {
	LevelDefinition,
	AchievementDefinition,
	GamificationProgress,
	GamificationScope,
	RewardEffectKey
} from '$lib/types/gamification';

export const USER_LEVELS: LevelDefinition[] = [
	{
		id             : 'user_lvl_1',
		scope          : 'USER',
		levelNumber    : 1,
		title          : 'Iniciado del Archivo',
		description    : 'Tu viaje de memoria apenas comienza. Tu espacio personal está listo.',
		requiredPoints : 0,
		isMilestone    : false,
		tier           : 'SILVER',
		rewardKey      : 'COSMETIC_PAPER',
		rewardLabel    : 'Fondo de Papel Clásico',
		iconName       : 'BookOpen'
	},
	{
		id             : 'user_lvl_2',
		scope          : 'USER',
		levelNumber    : 2,
		title          : 'Guardián Curioso',
		description    : 'Has empezado a registrar los primeros suspiros y detalles valiosos.',
		requiredPoints : 100,
		isMilestone    : false,
		tier           : 'SILVER',
		rewardKey      : 'EXTRA_AUDIO_SEC',
		rewardPayload  : { seconds: 15 },
		rewardLabel    : '+15s en Notas de Voz',
		iconName       : 'Mic'
	},
	{
		id             : 'user_lvl_3',
		scope          : 'USER',
		levelNumber    : 3,
		title          : 'Coleccionista de Historias',
		description    : 'El hábito de no olvidar se arraiga con fuerza en tu archivo.',
		requiredPoints : 250,
		isMilestone    : false,
		tier           : 'SILVER',
		rewardKey      : 'EXTRA_MOMENT_SLOT',
		rewardPayload  : { slots: 5 },
		rewardLabel    : '+5 Momentos por Memoria',
		iconName       : 'Layers'
	},
	{
		id             : 'user_lvl_4',
		scope          : 'USER',
		levelNumber    : 4,
		title          : 'Tejedor de Recuerdos',
		description    : 'Tus memorias comienzan a entrelazarse creando una red viva.',
		requiredPoints : 450,
		isMilestone    : false,
		tier           : 'SILVER',
		rewardKey      : 'UNLOCK_THEME',
		rewardPayload  : { themeId: 'aurora' },
		rewardLabel    : 'Tema Visual Aurora',
		iconName       : 'Palette'
	},
	{
		id             : 'user_lvl_5',
		scope          : 'USER',
		levelNumber    : 5,
		title          : 'Arquitecto de Memorias',
		description    : 'Hito mayor alcanzado: tus momentos ahora pueden sellarse en el tiempo.',
		requiredPoints : 750,
		isMilestone    : true,
		tier           : 'PURPLE',
		rewardKey      : 'UNLOCK_COLLAB_CAPSULE',
		rewardLabel    : 'Cápsula Colaborativa Épica',
		iconName       : 'Sparkles'
	},
	{
		id             : 'user_lvl_6',
		scope          : 'USER',
		levelNumber    : 6,
		title          : 'Cronista Mayor',
		description    : 'Cada nota de voz y fotografía adquiere una calidad cinematográfica.',
		requiredPoints : 1150,
		isMilestone    : false,
		tier           : 'GOLD',
		rewardKey      : 'VOICE_COMMENTS',
		rewardLabel    : 'Comentarios por Nota de Voz',
		iconName       : 'MessageSquareShare'
	},
	{
		id             : 'user_lvl_7',
		scope          : 'USER',
		levelNumber    : 7,
		title          : 'Custodio del Legado',
		description    : 'Tu perfil resplandece con la distinción de quien atesora cada vivencia.',
		requiredPoints : 1650,
		isMilestone    : false,
		tier           : 'GOLD',
		rewardKey      : 'PROFILE_FRAME',
		rewardPayload  : { frameId: 'laurel_gold' },
		rewardLabel    : 'Marco Laurel Dorado',
		iconName       : 'Award'
	},
	{
		id             : 'user_lvl_8',
		scope          : 'USER',
		levelNumber    : 8,
		title          : 'Maestro del Tiempo',
		description    : 'Tienes el poder de revivir cualquier instante con claridad cristalina.',
		requiredPoints : 2250,
		isMilestone    : false,
		tier           : 'GOLD',
		rewardKey      : 'EXTRA_MEMORY_SLOT',
		rewardPayload  : { slots: 3 },
		rewardLabel    : '+3 Capítulos de Memoria',
		iconName       : 'FolderPlus'
	},
	{
		id             : 'user_lvl_9',
		scope          : 'USER',
		levelNumber    : 9,
		title          : 'Baluarte Emocional',
		description    : 'Tus vínculos son más fuertes gracias a los cimientos que construiste.',
		requiredPoints : 2950,
		isMilestone    : false,
		tier           : 'GOLD',
		rewardKey      : 'EXTRA_RELATION_SLOT',
		rewardPayload  : { slots: 1 },
		rewardLabel    : '+1 Espacio de Relación',
		iconName       : 'HeartHandshake'
	},
	{
		id             : 'user_lvl_10',
		scope          : 'USER',
		levelNumber    : 10,
		title          : 'Leyenda Eterna',
		description    : 'Tu biblioteca de vida es un santuario inmune al paso del tiempo.',
		requiredPoints : 3800,
		isMilestone    : true,
		tier           : 'PURPLE',
		rewardKey      : 'CINEMA_EFFECT',
		rewardPayload  : { effect: 'cosmic_sparkles' },
		rewardLabel    : 'Efectos Cósmicos en Modo Cine',
		iconName       : 'Crown'
	}
];

export const RELATION_LEVELS: LevelDefinition[] = [
	{
		id             : 'rel_lvl_1',
		scope          : 'RELATION',
		levelNumber    : 1,
		title          : 'Chispa Compartida',
		description    : 'El inicio de una historia compartida. Dos universos que se encuentran.',
		requiredPoints : 0,
		isMilestone    : false,
		tier           : 'SILVER',
		rewardKey      : 'UNLOCK_COMMENTS',
		rewardLabel    : 'Muro Íntimo de Comentarios',
		iconName       : 'Sparkle'
	},
	{
		id             : 'rel_lvl_2',
		scope          : 'RELATION',
		levelNumber    : 2,
		title          : 'Paso Firme',
		description    : 'Construyendo anécdotas conjuntas con risas y confidencias.',
		requiredPoints : 100,
		isMilestone    : false,
		tier           : 'SILVER',
		rewardKey      : 'EXTRA_AUDIO_SEC',
		rewardPayload  : { seconds: 15 },
		rewardLabel    : '+15s de Grabación Compartida',
		iconName       : 'Mic2'
	},
	{
		id             : 'rel_lvl_3',
		scope          : 'RELATION',
		levelNumber    : 3,
		title          : 'Cómplices Diarios',
		description    : 'Cada detalle cotidiano se convierte en un tesoro invaluable.',
		requiredPoints : 250,
		isMilestone    : false,
		tier           : 'SILVER',
		rewardKey      : 'EXTRA_MOMENT_SLOT',
		rewardPayload  : { slots: 10 },
		rewardLabel    : '+10 Momentos Compartidos',
		iconName       : 'ImagePlus'
	},
	{
		id             : 'rel_lvl_4',
		scope          : 'RELATION',
		levelNumber    : 4,
		title          : 'Vínculo Resonante',
		description    : 'El entendimiento mutuo fluye sin necesidad de muchas palabras.',
		requiredPoints : 450,
		isMilestone    : false,
		tier           : 'SILVER',
		rewardKey      : 'COSMETIC_PAPER',
		rewardPayload  : { paper: 'parchment' },
		rewardLabel    : 'Estilo Pergamino Antiguo',
		iconName       : 'Scroll'
	},
	{
		id             : 'rel_lvl_5',
		scope          : 'RELATION',
		levelNumber    : 5,
		title          : 'Alianza Inquebrantable',
		description    : 'Hito mayor de complicidad: sellando pactos para el futuro.',
		requiredPoints : 750,
		isMilestone    : true,
		tier           : 'PURPLE',
		rewardKey      : 'UNLOCK_COLLAB_CAPSULE',
		rewardLabel    : 'Cápsulas de Desbloqueo Conjunto',
		iconName       : 'Hourglass'
	},
	{
		id             : 'rel_lvl_6',
		scope          : 'RELATION',
		levelNumber    : 6,
		title          : 'Sinfonía Compartida',
		description    : 'Las melodías y dedicatorias forman la banda sonora de la relación.',
		requiredPoints : 1150,
		isMilestone    : false,
		tier           : 'GOLD',
		rewardKey      : 'EXTRA_MEMBER_SLOT',
		rewardPayload  : { slots: 1 },
		rewardLabel    : '+1 Espacio de Miembro',
		iconName       : 'UserPlus'
	},
	{
		id             : 'rel_lvl_7',
		scope          : 'RELATION',
		levelNumber    : 7,
		title          : 'Pacto de Confianza',
		description    : 'Capítulos enteros que solo pertenecen a quienes los vivieron.',
		requiredPoints : 1650,
		isMilestone    : false,
		tier           : 'GOLD',
		rewardKey      : 'EXTRA_MEMORY_SLOT',
		rewardPayload  : { slots: 5 },
		rewardLabel    : '+5 Capítulos Compartidos',
		iconName       : 'FolderLock'
	},
	{
		id             : 'rel_lvl_8',
		scope          : 'RELATION',
		levelNumber    : 8,
		title          : 'Mundo Secreto',
		description    : 'Un refugio digital donde el ruido del exterior nunca puede entrar.',
		requiredPoints : 2250,
		isMilestone    : false,
		tier           : 'GOLD',
		rewardKey      : 'UNLOCK_THEME',
		rewardPayload  : { themeId: 'starlight' },
		rewardLabel    : 'Tema Noche Estrellada',
		iconName       : 'Star'
	},
	{
		id             : 'rel_lvl_9',
		scope          : 'RELATION',
		levelNumber    : 9,
		title          : 'Corazón Sincronizado',
		description    : 'La distancia o el tiempo jamás apagan lo que aquí se atesora.',
		requiredPoints : 2950,
		isMilestone    : false,
		tier           : 'GOLD',
		rewardKey      : 'VOICE_COMMENTS',
		rewardLabel    : 'Reacciones de Voz Instantáneas',
		iconName       : 'Radio'
	},
	{
		id             : 'rel_lvl_10',
		scope          : 'RELATION',
		levelNumber    : 10,
		title          : 'Vínculo Legendario',
		description    : 'La máxima cúspide de una conexión inmortalizada para siempre.',
		requiredPoints : 3800,
		isMilestone    : true,
		tier           : 'PURPLE',
		rewardKey      : 'CINEMA_EFFECT',
		rewardPayload  : { effect: 'aurora_glow' },
		rewardLabel    : 'Aura Dorada Eterna en Modo Cine',
		iconName       : 'ShieldCheck'
	}
];

export const USER_ACHIEVEMENTS: AchievementDefinition[] = [
	{
		id           : 'ach_usr_1',
		code         : 'USER_FIRST_MOMENT',
		scope        : 'USER',
		title        : 'Primer Recuerdo',
		description  : 'Diste el primer paso inmortalizando un instante que merecía ser guardado.',
		pointsReward : 50,
		tier         : 'SILVER',
		unlocked     : true,
		unlockedAt   : '12 de octubre de 2026',
		iconName     : 'Camera',
		criteriaHint : 'Crea tu primer momento en cualquier formato (foto, video, nota o texto).',
		category     : 'MEMORIES'
	},
	{
		id           : 'ach_usr_2',
		code         : 'USER_VOICE_NOTE',
		scope        : 'USER',
		title        : 'Voz del Corazón',
		description  : 'Grabaste tu voz para que las palabras tengan tono, risas y emoción real.',
		pointsReward : 75,
		tier         : 'SILVER',
		unlocked     : true,
		unlockedAt   : '18 de octubre de 2026',
		iconName     : 'Mic',
		criteriaHint : 'Graba y sube una nota de voz íntima en uno de tus momentos.',
		category     : 'INTERACTION'
	},
	{
		id           : 'ach_usr_3',
		code         : 'USER_ARCHIVE_50',
		scope        : 'USER',
		title        : 'Guardián del Archivo',
		description  : 'Tu baúl personal cuenta con una rica colección de recuerdos atesorados.',
		pointsReward : 150,
		tier         : 'GOLD',
		unlocked     : true,
		unlockedAt   : '2 de noviembre de 2026',
		iconName     : 'Archive',
		criteriaHint : 'Alcanza al menos 20 momentos acumulados entre todas tus memorias.',
		category     : 'MEMORIES'
	},
	{
		id           : 'ach_usr_4',
		code         : 'USER_CAPSULE_UNLOCK',
		scope        : 'USER',
		title        : 'Viajero del Tiempo',
		description  : 'Sellaste un mensaje dirigido a tu yo del futuro o a un ser querido.',
		pointsReward : 200,
		tier         : 'GOLD',
		unlocked     : false,
		iconName     : 'Hourglass',
		criteriaHint : 'Crea una cápsula del tiempo programada para abrirse en una fecha futura.',
		category     : 'TIME'
	},
	{
		id           : 'ach_usr_5',
		code         : 'USER_ALL_RELATIONS',
		scope        : 'USER',
		title        : 'Constelación Completa',
		description  : 'Tienes espacios activos con todas las personas importantes de tu vida.',
		pointsReward : 300,
		tier         : 'PURPLE',
		unlocked     : true,
		unlockedAt   : '15 de noviembre de 2026',
		iconName     : 'Compass',
		criteriaHint : 'Vincula al menos 3 relaciones activas en tu universo de recuerdos.',
		category     : 'SPECIAL'
	},
	{
		id           : 'ach_usr_6',
		code         : 'USER_MAX_SECURITY',
		scope        : 'USER',
		title        : 'Bóveda Inquebrantable',
		description  : 'Tus secretos más preciados se encuentran tras muros de protección impenetrable.',
		pointsReward : 500,
		tier         : 'PURPLE',
		unlocked     : false,
		iconName     : 'ShieldAlert',
		criteriaHint : 'Protege con clave y contraseña secreta al menos 5 recuerdos confidenciales.',
		category     : 'SPECIAL'
	}
];

export const RELATION_ACHIEVEMENTS: AchievementDefinition[] = [
	{
		id           : 'ach_rel_1',
		code         : 'REL_FIRST_MOMENT',
		scope        : 'RELATION',
		title        : 'Chispa Inicial',
		description  : 'Comenzaron su archivo conjunto. El primer momento que marca el inicio.',
		pointsReward : 50,
		tier         : 'SILVER',
		unlocked     : true,
		unlockedAt   : '10 de octubre de 2026',
		unlockedBy   : 'Kevin Dev',
		iconName     : 'Sparkles',
		criteriaHint : 'Suban su primer recuerdo compartido dentro de esta relación.',
		category     : 'MEMORIES'
	},
	{
		id           : 'ach_rel_2',
		code         : 'REL_FIRST_MEMORY',
		scope        : 'RELATION',
		title        : 'Capítulo Compartido',
		description  : 'Inauguraron su primera memoria temática agrupando historias inolvidables.',
		pointsReward : 100,
		tier         : 'SILVER',
		unlocked     : true,
		unlockedAt   : '15 de octubre de 2026',
		unlockedBy   : 'Ambos',
		iconName     : 'FolderHeart',
		criteriaHint : 'Creen su primera memoria temática juntos con portada personalizada.',
		category     : 'MEMORIES'
	},
	{
		id           : 'ach_rel_3',
		code         : 'REL_DUO_AUDIO',
		scope        : 'RELATION',
		title        : 'Sinfonía Compartida',
		description  : 'Las risas y dedicatorias grabadas se convirtieron en su tesoro sonoro.',
		pointsReward : 150,
		tier         : 'GOLD',
		unlocked     : true,
		unlockedAt   : '1 de noviembre de 2026',
		unlockedBy   : 'Kevin Dev',
		iconName     : 'Music2',
		criteriaHint : 'Compartan una dedicatoria musical o nota de voz con música de fondo.',
		category     : 'INTERACTION'
	},
	{
		id           : 'ach_rel_4',
		code         : 'REL_SECRET_LOCK',
		scope        : 'RELATION',
		title        : 'Pacto de Confidencialidad',
		description  : 'Atesoraron recuerdos con clave mutua que solo los dos pueden descifrar.',
		pointsReward : 200,
		tier         : 'GOLD',
		unlocked     : false,
		iconName     : 'KeyRound',
		criteriaHint : 'Sellad juntos un momento efímero o protegido con contraseña de complicidad.',
		category     : 'SPECIAL'
	},
	{
		id           : 'ach_rel_5',
		code         : 'REL_100_DAYS',
		scope        : 'RELATION',
		title        : 'Alquimia Inquebrantable',
		description  : 'Cien días y múltiples recuerdos fortaleciendo el lazo cada semana.',
		pointsReward : 350,
		tier         : 'PURPLE',
		unlocked     : true,
		unlockedAt   : '10 de noviembre de 2026',
		unlockedBy   : 'Ambos',
		iconName     : 'Infinity',
		criteriaHint : 'Mantengan activa la relación con recuerdos durante más de 3 meses.',
		category     : 'TIME'
	},
	{
		id           : 'ach_rel_6',
		code         : 'REL_FUTURE_VAULT',
		scope        : 'RELATION',
		title        : 'Cápsula Centenaria',
		description  : 'Sellaron recuerdos para abrir juntos en una fecha memorable del porvenir.',
		pointsReward : 500,
		tier         : 'PURPLE',
		unlocked     : false,
		iconName     : 'Gift',
		criteriaHint : 'Sellad una cápsula del tiempo conjunta para su próximo aniversario.',
		category     : 'TIME'
	}
];

export function resolveUnlockedEffects(
	levels        : LevelDefinition[],
	currentPoints : number
): Partial<Record<RewardEffectKey, boolean | number | string>> {
	const activeEffects: Partial<Record<RewardEffectKey, boolean | number | string>> = {};

	const reachedLevels = levels.filter( ( lvl: LevelDefinition ) => currentPoints >= lvl.requiredPoints );

	for ( const lvl of reachedLevels ) {
		if ( lvl.rewardPayload ) {
			const payloadVal = Object.values( lvl.rewardPayload )[ 0 ];
			activeEffects[ lvl.rewardKey ] = payloadVal !== undefined ? payloadVal : true;
		} else {
			activeEffects[ lvl.rewardKey ] = true;
		}
	}

	return activeEffects;
}

export function calculateGamificationProgress(
	scope         : GamificationScope,
	points        : number,
	customLevels? : LevelDefinition[],
	achievements? : AchievementDefinition[]
): GamificationProgress {
	const levels = customLevels || ( scope === 'USER' ? USER_LEVELS : RELATION_LEVELS );
	const achList = achievements || ( scope === 'USER' ? USER_ACHIEVEMENTS : RELATION_ACHIEVEMENTS );

	// Niveles ordenados por requerimiento de puntos ascendente
	const sortedLevels = [ ...levels ].sort( ( a, b ) => a.requiredPoints - b.requiredPoints );

	let currentLevelIndex = 0;
	for ( let i = 0; i < sortedLevels.length; i++ ) {
		if ( points >= sortedLevels[ i ].requiredPoints ) {
			currentLevelIndex = i;
		} else {
			break;
		}
	}

	const currentLevel = sortedLevels[ currentLevelIndex ] || sortedLevels[ 0 ];
	const nextLevel = sortedLevels[ currentLevelIndex + 1 ];

	let progressPercent = 100;
	let pointsRemaining = 0;

	if ( nextLevel ) {
		const pointsInThisLevel = points - currentLevel.requiredPoints;
		const pointsNeededForNext = nextLevel.requiredPoints - currentLevel.requiredPoints;
		progressPercent = Math.min( 100, Math.max( 0, Math.round( ( pointsInThisLevel / pointsNeededForNext ) * 100 ) ) );
		pointsRemaining = Math.max( 0, nextLevel.requiredPoints - points );
	}

	const unlockedCount = achList.filter( ( a: AchievementDefinition ) => a.unlocked ).length;
	const activeEffects = resolveUnlockedEffects( sortedLevels, points );

	return {
		currentPoints     : points,
		currentLevel,
		nextLevel,
		progressPercent,
		pointsRemaining,
		totalAchievements : achList.length,
		unlockedCount,
		activeEffects
	};
}
