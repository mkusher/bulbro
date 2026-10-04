import {
	describe,
	expect,
	it,
} from "bun:test";
import { spawnBulbro } from "@/bulbro/BulbroState";
import { wellRoundedBulbro } from "@/characters-definitions";
import {
	deltaTime,
	nowTime,
} from "@/time";
import type { WaveState } from "@/waveState";
import { getFollowedPlayer } from "./AutoCenterOnPlayerCamera";

const bulbro =
	(
		id: string,
	) =>
		spawnBulbro(
			id,
			"normal",
			{
				x: 0,
				y: 0,
			},
			0,
			0,
			wellRoundedBulbro,
		);

const dead =
	(
		id: string,
	) =>
		bulbro(
			id,
		).applyEvent(
			{
				type: "bulbroDied",
				bulbroId:
					id,
				damage: 100,
				position:
					{
						x: 0,
						y: 0,
					},
				occurredAt:
					nowTime(
						1000,
					),
				deltaTime:
					deltaTime(
						16,
					),
			},
		);

const stateWith =
	(
		players: WaveState["players"],
	) =>
		({
			players,
		}) as WaveState;

describe("getFollowedPlayer", () => {
	it("follows the local player while alive", () => {
		expect(
			getFollowedPlayer(
				stateWith(
					[
						bulbro(
							"local",
						),
						bulbro(
							"mate",
						),
					],
				),
			)
				?.id,
		).toBe(
			"local",
		);
	});

	it("follows a living teammate when the local player is dead", () => {
		expect(
			getFollowedPlayer(
				stateWith(
					[
						dead(
							"local",
						),
						bulbro(
							"mate",
						),
					],
				),
			)
				?.id,
		).toBe(
			"mate",
		);
	});

	it("stays on the local player when everyone is dead", () => {
		expect(
			getFollowedPlayer(
				stateWith(
					[
						dead(
							"local",
						),
						dead(
							"mate",
						),
					],
				),
			)
				?.id,
		).toBe(
			"local",
		);
	});
});
