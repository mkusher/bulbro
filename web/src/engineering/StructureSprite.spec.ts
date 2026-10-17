import {
	expect,
	it,
} from "bun:test";
import { StructureSprite } from "./StructureSprite";
import {
	STRUCTURE_SPAWN_DURATION,
	type Structure,
} from "./structures";

for (const kind of [
	"landmine",
	"turret",
	"medicalTurret",
	"laserTurret",
	"explosiveTurret",
	"incendiaryTurret",
] as const) {
	it(`shows only the spawning cross before revealing ${kind}`, () => {
		const structure: Structure =
			{
				type: "structure",
				id: "s",
				ownerId:
					"p",
				kind,
				position:
					{
						x: 100,
						y: 200,
					},
				spawnStartedAt: 100,
				nextActionAt: 100,
				interval: 0,
			};
		const sprite =
			new StructureSprite(
				structure,
			);
		const [
			cross,
			body,
			barrel,
		] =
			sprite.children;
		for (const now of [
			100,
			350,
			1099,
		]) {
			sprite.update(
				structure,
				now,
			);
			expect(
				cross!
					.visible,
			).toBe(
				true,
			);
			expect(
				cross!
					.alpha,
			).toBeGreaterThan(
				0,
			);
			expect(
				body!
					.visible,
			).toBe(
				false,
			);
			expect(
				barrel!
					.visible,
			).toBe(
				false,
			);
			expect(
				sprite
					.position
					.x,
			).toBe(
				100,
			);
			expect(
				sprite
					.position
					.y,
			).toBe(
				200,
			);
		}
		sprite.update(
			structure,
			100 +
				STRUCTURE_SPAWN_DURATION,
		);
		expect(
			cross!
				.visible,
		).toBe(
			false,
		);
		expect(
			body!
				.visible,
		).toBe(
			true,
		);
		expect(
			barrel!
				.visible,
		).toBe(
			true,
		);
		sprite.destroy(
			{
				children: true,
			},
		);
	});
}

it("renders gardens and structures from older snapshots immediately", () => {
	for (const kind of [
		"garden",
		"turret",
	] as const) {
		const structure: Structure =
			{
				type: "structure",
				id: "s",
				ownerId:
					"p",
				kind,
				position:
					{
						x: 100,
						y: 200,
					},
				nextActionAt: 0,
				interval: 0,
			};
		const sprite =
			new StructureSprite(
				structure,
			);
		sprite.update(
			structure,
			0,
		);
		expect(
			sprite
				.children[0]!
				.visible,
		).toBe(
			false,
		);
		expect(
			sprite
				.children[1]!
				.visible,
		).toBe(
			true,
		);
		sprite.destroy(
			{
				children: true,
			},
		);
	}
});
