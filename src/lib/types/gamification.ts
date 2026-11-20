export type GamificationScope = 'USER' | 'RELATION';

export type AchievementTier = 'SILVER' | 'GOLD' | 'PURPLE';

export type RewardEffectKey =
	| 'UNLOCK_COMMENTS'
	| 'EXTRA_AUDIO_SEC'
	| 'UNLOCK_COLLAB_CAPSULE'
	| 'UNLOCK_THEME'
	| 'EXTRA_MEMBER_SLOT'
	| 'EXTRA_RELATION_SLOT'
	| 'EXTRA_MEMORY_SLOT'
	| 'EXTRA_MOMENT_SLOT'
	| 'COSMETIC_PAPER'
	| 'PROFILE_FRAME'
	| 'VOICE_COMMENTS'
	| 'CINEMA_EFFECT';

export type AchievementCategory = 'MEMORIES' | 'INTERACTION' | 'TIME' | 'SPECIAL';

export interface LevelDefinition {
	id              : string;
	scope           : GamificationScope;
	levelNumber     : number;
	title           : string;
	description     : string;
	requiredPoints  : number;
	isMilestone     : boolean;
	tier            : AchievementTier;
	rewardKey       : RewardEffectKey;
	rewardPayload  ?: Record<string, string | number>;
	rewardLabel     : string;
	iconName       ?: string;
}

export interface AchievementDefinition {
	id            : string;
	code          : string;
	scope         : GamificationScope;
	title         : string;
	description   : string;
	pointsReward  : number;
	tier          : AchievementTier;
	unlocked      : boolean;
	unlockedAt   ?: string;
	unlockedBy   ?: string;
	iconName      : string;
	criteriaHint  : string;
	category      : AchievementCategory;
}

export interface GamificationProgress {
	currentPoints     : number;
	currentLevel      : LevelDefinition;
	nextLevel        ?: LevelDefinition;
	progressPercent   : number;
	pointsRemaining   : number;
	totalAchievements : number;
	unlockedCount     : number;
	activeEffects     : Partial<Record<RewardEffectKey, boolean | number | string>>;
}
