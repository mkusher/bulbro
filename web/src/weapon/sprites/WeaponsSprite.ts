import * as PIXI from "pixi.js";
import type { BulbroState } from "@/bulbro/BulbroState";
import { WeaponSprite } from "./WeaponSprite";
import type { WeaponState } from "../WeaponState";
import { calculateWeaponPosition } from "@/game-formulas";

const scaling = 0.125;
export class WeaponsSprite {
	#container = new PIXI.Container();
	#weaponSprites = new Map<string, WeaponSprite>();

	constructor() {
		// Constructor is intentionally empty
	}

	appendTo(parent: PIXI.Container) {
		parent.addChild(this.#container);
		this.#container.position.y = 15;
		this.#container.position.x = 5;
	}

	async update(bulbroState: BulbroState) {
		const weapons = bulbroState.weapons;
		const numberOfWeapons = weapons.length;

		// Remove weapons that are no longer present
		const currentWeaponIds = new Set(weapons.map((w) => w.id));
		for (const [weaponId, weaponSprite] of this.#weaponSprites) {
			if (!currentWeaponIds.has(weaponId)) {
				weaponSprite.remove();
				this.#weaponSprites.delete(weaponId);
			}
		}

		// Add or update weapons
		weapons.forEach((weapon, i) => {
			let weaponSprite = this.#weaponSprites.get(weapon.id);

			if (!weaponSprite) {
				weaponSprite = new WeaponSprite(weapon.type, scaling);
				weaponSprite.init();
				weaponSprite.appendTo(this.#container);
				this.#weaponSprites.set(weapon.id, weaponSprite);
			}

			// Position weapons around the bulbro character
			this.#positionWeapon(weaponSprite, weapon, i, numberOfWeapons);
		});
	}

	#positionWeapon(
		weaponSprite: WeaponSprite,
		weapon: WeaponState,
		index: number,
		totalWeapons: number,
	) {
		const position = calculateWeaponPosition(weapon, index, totalWeapons);

		// Set final position and rotation
		weaponSprite.updatePosition(position.x, position.y);

		// Rotate weapon based on aiming direction
		weaponSprite.aim(weapon.aimingDirection);
	}

	remove() {
		// Remove all weapon sprites
		for (const weaponSprite of this.#weaponSprites.values()) {
			weaponSprite.remove();
		}
		this.#weaponSprites.clear();

		// Remove container from parent
		this.#container.removeFromParent();
	}
}
