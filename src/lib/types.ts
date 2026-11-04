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

export type UserRole = 'user' | 'admin' | 'super_admin';

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
	role       : UserRole;
}

export interface Relationship {
	id         : string;
	created_by : string;
	updated_by : string;
	name       : string;
	path_name  : string;
	avatar     : string;
	points     : number;
	created_at : string;
	updated_at : string;
	is_active  : boolean;
	type_id    : string;
	color      : string;
}

export type MomentTag = 'image' | 'video' | 'text' | 'quote';

export interface MomentMetadata {
	imageUrl    ?: string;
	videoUrl    ?: string;
	bgColor     ?: string;
	is_blocked  ?: boolean;
	password    ?: string;
	timer       ?: number;
	is_temporal ?: boolean;
}

export interface MomentEntity {
	id              : string;
	relationship_id : string;
	memory_id      ?: string;
	title          ?: string;
	content        ?: string;
	author          : string;
	created_by      : string;
	created_at      : string;
	updated_at     ?: string;
	capture_date   ?: string;
	metadata       ?: MomentMetadata;
	tags            : MomentTag[];
}

export interface MemoryEntity {
	id              : string;
	relationship_id : string;
	title           : string;
	description    ?: string;
	cover_url      ?: string;
	created_by      : string;
	created_at      : string;
	updated_at      : string;
	is_blocked     ?: boolean;
	password       ?: string;
	timer          ?: number;
	moments        ?: MomentEntity[];
}

export interface MomentUserView {
	id        : string;
	moment_id : string;
	user_id   : string;
	viewed_at : string;
}

// Compatibilidad hacia atrás durante la migración
export type MomentType = MomentTag;
export type Memory = MomentEntity;
export type Group = Relationship;
