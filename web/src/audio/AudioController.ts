import type {
	BulbroAttackedEvent,
	EnemyAttackedEvent,
	GameEvent,
} from "@/game-events/GameEvents";
import { audioEngine } from "./AudioEngine";
import { fromWeaponState } from "@/weapon";
import { waveState } from "@/waveState";

/**
 * Audio Controller - Event-based audio playback
 *
 * Listens for game events and plays corresponding sound effects.
 * Maps weapon/attack types to specific sound effects.
 */
class AudioController {
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
		}
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
			waveState.value;
		const player =
			state.players.find(
				(
					p,
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
					w,
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
			waveState.value;
		const enemy =
			state.enemies.find(
				(
					e,
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
					w,
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

// Singleton instance
export const audioController =
	new AudioController();
