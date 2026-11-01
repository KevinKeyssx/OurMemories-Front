export const INTERNAL_ENDPOINT = {
	USER : {
		ME : '/api/user/me'
	},
	RELATIONSHIP : {
		GET    : '/api/relationship',
		CREATE : '/api/relationship/create',
		UPDATE : '/api/relationship/update',
		DELETE : '/api/relationship/delete',
		TYPES  : '/api/relationship-types'
	}
} as const;

export const EXTERNAL_ENDPOINT = {
	USER : {
		ME : 'api/v1/user/me'
	},
	RELATIONSHIP : {
		GET    : 'api/v1/relationship',
		CREATE : 'api/v1/relationship',
		UPDATE : 'api/v1/relationship',
		DELETE : 'api/v1/relationship',
		TYPES  : 'api/v1/relationship-types'
	}
} as const;
