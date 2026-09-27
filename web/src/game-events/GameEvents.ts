import type { EnemyState } from "@/enemy";
import type {
	Direction,
	Position,
} from "@/geometry";
import type { ShotState } from "@/shot/ShotState";
import type { MeleeStrike } from "@/weapon/MeleeStrike";
import type {
	DeltaTime,
	NowTime,
} from "@/time";

// Base events without EventMeta

export type BulbroEvent =
	| ShotEvent
	| BulbroAttackedEvent
	| BulbroCollectedMaterialEvent
	| BulbroDiedEvent
	| BulbroHealedEvent
	| BulbroMovedEvent
	| BulbroReceivedHitEvent
	| BulbroInitializedForWaveEvent
	| ConsumableCollectedEvent
	| HealEvent
	| MaterialCollectedEvent;
export type EnemyEvent =
	| ShotEvent
	| EnemyAttackedEvent
	| EnemyDiedEvent
	| EnemyMovedEvent
	| EnemyReceivedHitEvent
	| EnemySpawnedEvent
	| EnemySpawningStartedEvent
	| EnemyRagingStartedEvent;
export type GameEventInternal =
	| BulbroEvent
	| EnemyEvent
	| ConsumableMovedEvent
	| MaterialMovedEvent
	| MaterialSpawnedEvent
	| MoveShotEvent
	| ShotMovedEvent
	| ShotExpiredEvent
	| StrikeSweptEvent
	| ShopRerolledEvent
	| ShopPurchasedEvent
	| TickEvent
	| UndefinedEvent;

// Events with EventMeta
export type GameEvent =
	WithMeta<GameEventInternal>;

export type WithMeta<
	E extends
		{},
> =
	E &
		EventMeta;

export type MoveDescription =
	{
		from: Position;
		to: Position;
		direction: Direction;
	};

export type EventMeta =
	{
		deltaTime: DeltaTime;
		occurredAt: NowTime;
	};

export type AttackDescription =
	{
		weaponId: string;
		targetId?: string;
		shot?: ShotState;
		/** Melee strike started by this attack */
		strike?: MeleeStrike;
	};
// Event type interfaces in alphabetical order
export type BulbroAttackedEvent =
	{
		type: "bulbroAttacked";
		bulbroId: string;
	} & AttackDescription;

export type BulbroCollectedMaterialEvent =
	{
		type: "bulbroCollectedMaterial";
		bulbroId: string;
		materialId: string;
	};

export type BulbroDiedEvent =
	{
		type: "bulbroDied";
		bulbroId: string;
		damage: number;
		position: {
			x: number;
			y: number;
		};
	};

export type BulbroHealedEvent =
	{
		type: "bulbroHealed";
		bulbroId: string;
		hp: number;
	};

export type BulbroMovedEvent =
	{
		type: "bulbroMoved";
		bulbroId: string;
	} & MoveDescription;

export type BulbroReceivedHitEvent =
	{
		type: "bulbroReceivedHit";
		bulbroId: string;
		damage: number;
	};

/** A melee strike was swept up to `sweptUntil`, touching `targetIds`. */
export type StrikeSweptEvent =
	{
		type: "strikeSwept";
		attackerType:
			| "player"
			| "enemy";
		attackerId: string;
		weaponId: string;
		sweptUntil: number;
		targetIds: string[];
	};

export type BulbroInitializedForWaveEvent =
	{
		type: "bulbroInitializedForWave";
		bulbroId: string;
		position: Position;
		direction: Direction;
	};

export type EnemyAttackedEvent =
	{
		type: "enemyAttacked";
		enemyId: string;
	} & AttackDescription;

export type EnemyDiedEvent =
	{
		type: "enemyDied";
		enemyId: string;
		damage: number;
		position: {
			x: number;
			y: number;
		};
		/** Set when the enemy dropped a consumable on death */
		consumableId?: string;
	};

export type EnemyMovedEvent =
	{
		type: "enemyMoved";
		enemyId: string;
	} & MoveDescription;

export type EnemyReceivedHitEvent =
	{
		type: "enemyReceivedHit";
		enemyId: string;
		damage: number;
		newHealthPoints: number;
		knockback?: KnockbackDescription;
	};

export type KnockbackDescription =
	{
		direction: Direction;
		strength: number;
	};

export type EnemySpawnedEvent =
	{
		type: "spawnEnemy";
		enemy: EnemyState;
	};

export type EnemySpawningStartedEvent =
	{
		type: "enemySpawningStarted";
		enemyId: string;
		position: {
			x: number;
			y: number;
		};
		enemyType: string;
	};

export type EnemyRagingStartedEvent =
	{
		type: "enemyRagingStarted";
		enemyId: string;
		direction: Direction;
	};

export type MaterialCollectedEvent =
	{
		type: "materialCollected";
		materialId: string;
		playerId: string;
	};

export type ConsumableCollectedEvent =
	{
		type: "consumableCollected";
		consumableId: string;
		playerId: string;
		hp: number;
	};

export type ConsumableMovedEvent =
	{
		type: "consumableMoved";
		consumableId: string;
	} & MoveDescription;

export type MaterialMovedEvent =
	{
		type: "materialMoved";
		materialId: string;
	} & MoveDescription;

export type MaterialSpawnedEvent =
	{
		type: "materialSpawned";
		materialId: string;
		position: {
			x: number;
			y: number;
		};
	};

export type ShotMovedEvent =
	{
		type: "shotMoved";
		shotId: string;
	} & MoveDescription;

export type ShotExpiredEvent =
	{
		type: "shotExpired";
		shotId: string;
		position: {
			x: number;
			y: number;
		};
	};

export type TickEvent =
	{
		type: "tick";
	};

export type UndefinedEvent =
	{
		type?: undefined;
	};

export type HealEvent =
	{
		type: "heal";
	};

export type MoveShotEvent =
	{
		type: "moveShot";
		shotId: string;
		direction: Direction;
		chance: number;
	};

export type ShopPurchasedEvent =
	{
		type: "shopPurchased";
		playerId: string;
		weaponId: string;
		price: number;
	};

export type ShopRerolledEvent =
	{
		type: "shopRerolled";
		playerId: string;
		cost: number;
		rerollCount: number;
	};

export type ShotEvent =
	{
		type: "shot";
		shot: ShotState;
		weaponId: string;
	};

// Helper function to add EventMeta to base events
export function withEventMeta(
	baseEvent: GameEventInternal,
	deltaTime: DeltaTime,
	occurredAt: NowTime,
): GameEvent {
	return {
		...baseEvent,
		deltaTime,
		occurredAt,
	} as GameEvent;
}

// Helper function to add EventMeta to multiple events
export function withEventMetaMultiple(
	baseEvents: GameEventInternal[],
	deltaTime: DeltaTime,
	occurredAt: NowTime,
): GameEvent[] {
	return baseEvents.map(
		(
			event,
		) =>
			withEventMeta(
				event,
				deltaTime,
				occurredAt,
			),
	);
}

// Event handler type
export type GameEventHandler =
	(
		event: GameEvent,
	) => void;

// Event queue interface
export interface GameEventQueue {
	addEvent(
		event: GameEvent,
	): void;
	flush(): GameEvent[];
}
