import type { Signal } from "@preact/signals";
import type { SoundName } from "@/AudioAssets";
import type {
	BulbroAttackedEvent,
	BulbroReceivedHitEvent,
	ConsumableCollectedEvent,
	EnemyAttackedEvent,
	EnemyDiedEvent,
	GameEvent,
	MaterialCollectedEvent,
} from "@/game-events/GameEvents";
import type { WaveState } from "@/waveState";
import {
	fromWeaponState,
	type Weapon,
} from "@/weapon";
import { audioEngine } from "./AudioEngine";

/**
 * Audio Controller - Event-based audio playback
 *
 * Listens for game events and plays corresponding sound effects.
 * Maps weapon/attack types to specific sound effects.
 */
class AudioController {
	#waveStateSignal: Signal<WaveState | null>;

	constructor(
		waveStateSignal: Signal<WaveState | null>,
	) {
		this.#waveStateSignal =
			waveStateSignal;
	}

	/**
	 * Process an array of game events and play corresponding sound effects
	 */
	handleEvents(
		events: GameEvent[],
	): void {
		for (const event of events) {
			this.#handleEvent(
				event,
			);
		}
	}

	#handleEvent(
		event: GameEvent,
	): void {
		switch (
			event.type
		) {
			case "bulbroAttacked":
				this.#handlePlayerAttack(
					event,
				);
				break;
			case "enemyAttacked":
				this.#handleEnemyAttack(
					event,
				);
				break;
			case "materialCollected":
			case "consumableCollected":
				this.#handleMaterialCollected(
					event,
				);
				break;
			case "enemyDied":
				this.#handleEnemyDied(
					event,
				);
				break;
			case "bulbroReceivedHit":
				this.#handleBulbroReceivedHit(
					event,
				);
				break;
			case "shotExploded":
				audioEngine.playEffect(
					"explosion",
				);
				break;
		}
	}

	/**
	 * Handle material collected sound
	 */
	#handleMaterialCollected(
		_event:
			| MaterialCollectedEvent
			| ConsumableCollectedEvent,
	): void {
		audioEngine.playEffect(
			"collectCoins",
		);
	}

	/**
	 * Handle enemy died sound: trees break, creatures scream
	 */
	#handleEnemyDied(
		event: EnemyDiedEvent,
	): void {
		const enemy =
			this.#waveStateSignal.value?.enemies.find(
				(
					e,
				) =>
					e.id ===
					event.enemyId,
			);
		audioEngine.playEffect(
			enemy?.type ===
				"tree"
				? "treeBreak"
				: "scream",
		);
	}

	/**
	 * Handle bulbro received hit sound
	 */
	#handleBulbroReceivedHit(
		_event: BulbroReceivedHitEvent,
	): void {
		audioEngine.playEffect(
			"ouch",
		);
	}

	/**
	 * Handle player attack sound
	 * Map weapon type to appropriate sound effect
	 */
	#handlePlayerAttack(
		event: BulbroAttackedEvent,
	): void {
		const weaponId =
			event.weaponId;

		// Get the weapon definition from state
		const state =
			this
				.#waveStateSignal
				.value;

		if (
			!state
		)
			return;

		const player =
			state.players.find(
				(
					p: any,
				) =>
					p.id ===
					event.bulbroId,
			);

		if (
			!player
		)
			return;

		const weaponState =
			player.weapons.find(
				(
					w: any,
				) =>
					w.id ===
					weaponId,
			);

		if (
			!weaponState
		)
			return;

		audioEngine.playEffect(
			weaponSound(
				fromWeaponState(
					weaponState,
				),
			),
		);
	}

	/**
	 * Handle enemy attack sound
	 * Map enemy weapon type to appropriate sound effect
	 */
	#handleEnemyAttack(
		event: EnemyAttackedEvent,
	): void {
		const weaponId =
			event.weaponId;

		// Get the weapon definition from state
		const state =
			this
				.#waveStateSignal
				.value;

		if (
			!state
		)
			return;

		const enemy =
			state.enemies.find(
				(
					e: any,
				) =>
					e.id ===
					event.enemyId,
			);

		if (
			!enemy
		)
			return;

		const weaponState =
			enemy.weapons.find(
				(
					w: any,
				) =>
					w.id ===
					weaponId,
			);

		if (
			!weaponState
		)
			return;

		audioEngine.playEffect(
			weaponSound(
				fromWeaponState(
					weaponState,
				),
			),
		);
	}
}

/**
 * Map a weapon to its attack sound: specific weapons first,
 * then fall back to weapon classes.
 */
export function weaponSound(
	weapon: Weapon,
): SoundName {
	switch (
		weapon.id
	) {
		case "laserGun":
			return "laser";
		case "orcGun":
		case "aphidGun":
			return "enemyShot";
	}
	// Exploding projectiles make their boom when they explode, not when fired
	if (
		weapon
			.attack
			.type ===
		"explosion"
	)
		return weapon.classes.includes(
			"gun",
		)
			? "gunshot"
			: "kick";
	if (
		weapon.classes.includes(
			"explosive",
		)
	)
		return "explosion";
	if (
		weapon.classes.includes(
			"gun",
		)
	)
		return "gunshot";
	return "kick";
}

// Export the class to be instantiated where waveState is available
export {
	AudioController,
};
