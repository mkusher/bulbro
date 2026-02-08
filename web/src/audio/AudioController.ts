import type { Signal } from "@preact/signals";
import type {
	BulbroAttackedEvent,
	BulbroReceivedHitEvent,
	EnemyAttackedEvent,
	EnemyDiedEvent,
	GameEvent,
	MaterialCollectedEvent,
} from "@/game-events/GameEvents";
import type { WaveState } from "@/waveState";
import { fromWeaponState } from "@/weapon";
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
		}
	}

	/**
	 * Handle material collected sound
	 */
	#handleMaterialCollected(
		_event: MaterialCollectedEvent,
	): void {
		audioEngine.playEffect(
			"collectCoins",
		);
	}

	/**
	 * Handle enemy died sound
	 */
	#handleEnemyDied(
		_event: EnemyDiedEvent,
	): void {
		audioEngine.playEffect(
			"scream",
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

		const weapon =
			fromWeaponState(
				weaponState,
			);
		const weaponType =
			weapon.id;

		// Map weapon type to sound
		this.#playWeaponSound(
			weaponType,
			"player",
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

		const weapon =
			fromWeaponState(
				weaponState,
			);

		// Map enemy weapon to sound based on class
		if (
			weapon.classes.includes(
				"gun",
			)
		) {
			audioEngine.playEffect(
				"laser",
			);
		} else if (
			weapon.classes.includes(
				"unarmed",
			)
		) {
			audioEngine.playEffect(
				"kick",
			);
		} else if (
			weapon.classes.includes(
				"blade",
			) ||
			weapon.classes.includes(
				"blunt",
			)
		) {
			// Melee weapons use kick sound
			audioEngine.playEffect(
				"kick",
			);
		}
	}

	/**
	 * Play sound for player weapon attack
	 */
	#playWeaponSound(
		weaponType: string,
		_source: string,
	): void {
		switch (
			weaponType
		) {
			case "pistol":
			case "ak47":
			case "smg":
			case "doubleBarrelShotgun":
				audioEngine.playEffect(
					"gunshot",
				);
				break;
			case "laserGun":
				audioEngine.playEffect(
					"laser",
				);
				break;
			case "fist":
			case "hand":
				audioEngine.playEffect(
					"kick",
				);
				break;
			case "knife":
			case "sword":
				// Melee weapons use kick sound
				audioEngine.playEffect(
					"kick",
				);
				break;
			case "brick":
				// Impact weapon
				audioEngine.playEffect(
					"kick",
				);
				break;
			case "orcGun":
				// Enemy gun sound
				audioEngine.playEffect(
					"laser",
				);
				break;
			case "enemyGun":
				audioEngine.playEffect(
					"laser",
				);
				break;
			case "enemyFist":
				audioEngine.playEffect(
					"kick",
				);
				break;
		}
	}
}

// Export the class to be instantiated where waveState is available
export {
	AudioController,
};
