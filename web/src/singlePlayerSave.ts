import { BulbroState } from "./bulbro/BulbroState";
import type { TotalGameStats } from "./gameStats";
import type { WaveState } from "./waveState";

const storageKey =
	"singlePlayerGame";

export interface SinglePlayerSave {
	version: 1;
	phase:
		| "wave"
		| "shop";
	state: WaveState;
	stats: TotalGameStats;
}

export function saveSinglePlayerGame(
	state: WaveState,
	stats: TotalGameStats,
	phase: SinglePlayerSave["phase"],
	storage: Storage = localStorage,
): void {
	if (
		state
			.players
			.length !==
		1
	)
		return;
	try {
		storage.setItem(
			storageKey,
			JSON.stringify(
				{
					version: 1,
					phase,
					state:
						{
							...state,
							enemies:
								[],
							objects:
								[],
							shots:
								[],
						},
					stats,
				} satisfies SinglePlayerSave,
			),
		);
	} catch {
		// Storage can be unavailable or full; gameplay can still continue.
	}
}

export function loadSinglePlayerGame(
	storage: Storage = localStorage,
):
	| SinglePlayerSave
	| undefined {
	try {
		const save: SinglePlayerSave =
			JSON.parse(
				storage.getItem(
					storageKey,
				) ??
					"null",
			);
		if (
			!save ||
			save.version !==
				1 ||
			![
				"wave",
				"shop",
			].includes(
				save.phase,
			)
		)
			return;
		const state =
			save.state;
		if (
			!state ||
			!Array.isArray(
				state.players,
			) ||
			state
				.players
				.length !==
				1 ||
			!Number.isInteger(
				state
					.round
					?.wave,
			) ||
			state
				.round
				.wave <
				1 ||
			!Number.isInteger(
				state
					.round
					.difficulty,
			) ||
			state
				.round
				.difficulty <
				0 ||
			state
				.round
				.difficulty >
				5 ||
			!Number.isFinite(
				state
					.mapSize
					?.width,
			) ||
			state
				.mapSize
				.width <=
				0 ||
			!Number.isFinite(
				state
					.mapSize
					?.height,
			) ||
			state
				.mapSize
				.height <=
				0 ||
			!save.stats ||
			![
				"wavesCompleted",
				"enemiesKilled",
				"damageDealt",
				"damageTaken",
				"materialsCollected",
				"totalSurvivalTime",
				"materialsSpent",
				"rerolls",
			].every(
				(
					key,
				) =>
					Number.isFinite(
						save
							.stats[
							key as keyof TotalGameStats
						],
					),
			)
		)
			return;
		const player =
			new BulbroState(
				state
					.players[0]!,
			);
		if (
			!player.id ||
			!player.characterId ||
			!Array.isArray(
				player.weapons,
			) ||
			!Array.isArray(
				player.statSources,
			) ||
			!Number.isFinite(
				player.healthPoints,
			) ||
			!Number.isFinite(
				player
					.stats
					.maxHp,
			)
		)
			return;
		return {
			...save,
			state:
				{
					...state,
					players:
						[
							player,
						],
					enemies:
						[],
					objects:
						[],
					shots:
						[],
				},
		};
	} catch {
		return;
	}
}

export function clearSinglePlayerGame(
	storage: Storage = localStorage,
): void {
	try {
		storage.removeItem(
			storageKey,
		);
	} catch {
		/* Ignore browsers that disable storage. */
	}
}
