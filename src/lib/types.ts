/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Sex {
	id         : string;
	name       : string;
	short_name : string;
}

export interface RelationshipType {
	id          : string;
	name        : string;
	description : string;
}

export interface User {
	id         : string;
	name       : string;
	last_name  : string;
	email      : string;
	phone      : string;
	created_at : string;
	updated_at : string;
	points     : number;
	birthdate  : string;
	is_active  : boolean;
	sex_id     : string;
}

export interface Relationship {
	id          : string;
	created_by  : string;
	updated_by  : string;
	name        : string;
	path_name   : string;
	avatar      : string;
	points      : number;
	created_at  : string;
	updated_at  : string;
	is_active   : boolean;
	type_id     : string;
	color       : string;
}

export interface MemoryMetadata {
	videoUrl ?: string;
	imageUrl ?: string;
	bgColor  ?: string;
}

export type MomentType = 'image' | 'quote' | 'text' | 'video' | 'meme';

export interface MomentEntity {
	id               : string;
	relationship_id  : string;
	memory_id       ?: string;
	type             : MomentType;
	title           ?: string;
	content         ?: string;
	author           : string;
	date             : string;
	metadata        ?: MemoryMetadata;
	tags            ?: string[];
}

export interface MemoryEntity {
	id              : string;
	relationship_id : string;
	title           : string;
	description    ?: string;
	cover_url      ?: string;
	created_at      : string;
	moments         : MomentEntity[];
}

// Compatibilidad hacia atrás durante la migración de recuerdos
export type MemoryType = MomentType;
export type Memory = MomentEntity;
export type Group = Relationship;
