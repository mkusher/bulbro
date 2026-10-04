import {
	expect,
	it,
} from "bun:test";
import { baseBulbro } from "@/characters-definitions/base";
import { withEventMeta } from "@/game-events/GameEvents";
import type { Material } from "@/object/MaterialState";
import {
	deltaTime,
	nowTime,
} from "@/time";
import {
	createInitialState,
	updateState,
	type WaveState,
} from "@/waveState";
import { MaterialPrediction } from "./MaterialPrediction";

function initialState(
	distance = 80,
) {
	const state =
		createInitialState(
			[
				{
					id: "guest",
					bulbro:
						baseBulbro,
				},
				{
					id: "host",
					bulbro:
						baseBulbro,
				},
			],
			{
				width: 1000,
				height: 1000,
			},
			1,
		);
	const position =
		state
			.players[0]!
			.position;
	state.objects =
		[
			{
				type: "material",
				id: "pickup",
				value: 1,
				position:
					{
						x: position.x,
						y:
							position.y +
							distance,
					},
			},
		];
	return state;
}
function frame(
	prediction: MaterialPrediction,
	state: WaveState,
	ms = 16,
) {
	return prediction.predict(
		state,
		deltaTime(
			ms,
		),
		nowTime(
			1000,
		),
	);
}
function material(
	state: WaveState,
) {
	return state
		.objects[0] as Material;
}

it("predicts material attraction on every guest frame without changing authoritative state", () => {
	const state =
		initialState();
	const prediction =
		new MaterialPrediction();
	const first =
		frame(
			prediction,
			state,
		);
	const second =
		frame(
			prediction,
			state,
		);
	expect(
		material(
			first,
		)
			.position
			.y,
	).toBeLessThan(
		material(
			state,
		)
			.position
			.y,
	);
	expect(
		material(
			second,
		)
			.position
			.y,
	).toBeLessThan(
		material(
			first,
		)
			.position
			.y,
	);
	expect(
		material(
			state,
		)
			.position
			.y,
	).toBe(
		state
			.players[0]!
			.position
			.y +
			80,
	);
	expect(
		second.players,
	).toBe(
		state.players,
	);
});

it("hides predicted collections until host confirmation without granting rewards twice", () => {
	const state =
		initialState(
			6,
		);
	const prediction =
		new MaterialPrediction();
	const before =
		state.players.map(
			(
				player,
			) => [
				player.materialsAvailable,
				player.totalExperience,
			],
		);
	for (
		let i = 0;
		i <
		20;
		i++
	)
		expect(
			frame(
				prediction,
				state,
			)
				.objects,
		).toEqual(
			[],
		);
	expect(
		state.objects,
	).toHaveLength(
		1,
	);
	expect(
		state.players.map(
			(
				player,
			) => [
				player.materialsAvailable,
				player.totalExperience,
			],
		),
	).toEqual(
		before,
	);
	const confirmed =
		updateState(
			state,
			withEventMeta(
				{
					type: "materialCollected",
					materialId:
						"pickup",
					playerId:
						"guest",
				},
				deltaTime(
					16,
				),
				nowTime(
					1000,
				),
			),
		);
	const view =
		frame(
			prediction,
			confirmed,
		);
	expect(
		view.objects,
	).toEqual(
		[],
	);
	for (
		let i = 0;
		i <
		before.length;
		i++
	) {
		expect(
			view
				.players[
				i
			]!
				.materialsAvailable,
		).toBe(
			before[
				i
			]![0]! +
				1,
		);
		expect(
			view
				.players[
				i
			]!
				.totalExperience,
		).toBe(
			before[
				i
			]![1]! +
				1,
		);
	}
});

it("keeps a predicted collection hidden while delayed host attraction events arrive", () => {
	let state =
		initialState(
			35,
		);
	const prediction =
		new MaterialPrediction();
	for (
		let i = 0;
		i <
		5;
		i++
	)
		frame(
			prediction,
			state,
		);
	const object =
		material(
			state,
		);
	state =
		{
			...state,
			objects:
				[
					{
						...object,
						position:
							{
								x: object
									.position
									.x,
								y:
									object
										.position
										.y -
									10,
							},
					},
				],
		};
	expect(
		frame(
			prediction,
			state,
		)
			.objects,
	).toEqual(
		[],
	);
});

it("smoothly calibrates wrong predictions and restores a pickup when the host disagrees", () => {
	let state =
		initialState(
			6,
		);
	const prediction =
		new MaterialPrediction();
	expect(
		frame(
			prediction,
			state,
		)
			.objects,
	).toEqual(
		[],
	);
	const object =
		material(
			state,
		);
	const corrected =
		{
			x: object
				.position
				.x,
			y:
				object
					.position
					.y +
				300,
		};
	state =
		{
			...state,
			objects:
				[
					{
						...object,
						position:
							corrected,
					},
				],
		};
	const first =
		frame(
			prediction,
			state,
		);
	expect(
		first.objects,
	).toHaveLength(
		1,
	);
	expect(
		material(
			first,
		)
			.position
			.y,
	).toBeLessThan(
		corrected.y,
	);
	let settled =
		first;
	for (
		let i = 0;
		i <
		150;
		i++
	)
		settled =
			frame(
				prediction,
				state,
			);
	expect(
		material(
			settled,
		)
			.position
			.y,
	).toBeCloseTo(
		corrected.y,
		2,
	);
	expect(
		state
			.players[0]!
			.materialsAvailable,
	).toBe(
		0,
	);
});

it("discards removed pickups and starts reused IDs from the new host position", () => {
	const state =
		initialState(
			6,
		);
	const prediction =
		new MaterialPrediction();
	expect(
		frame(
			prediction,
			state,
		)
			.objects,
	).toEqual(
		[],
	);
	frame(
		prediction,
		{
			...state,
			objects:
				[],
		},
	);
	const respawned =
		initialState(
			80,
		);
	expect(
		frame(
			prediction,
			respawned,
		)
			.objects,
	).toHaveLength(
		1,
	);
});

it("ignores dead players, skips paused waves, and handles zero-length frames", () => {
	const state =
		initialState(
			6,
		);
	const prediction =
		new MaterialPrediction();
	expect(
		frame(
			prediction,
			state,
			0,
		)
			.objects,
	).toEqual(
		state.objects,
	);
	const dead =
		updateState(
			state,
			withEventMeta(
				{
					type: "bulbroDied",
					damage: 100,
					position:
						state
							.players[0]!
							.position,
					bulbroId:
						"guest",
				},
				deltaTime(
					16,
				),
				nowTime(
					1000,
				),
			),
		);
	expect(
		frame(
			prediction,
			dead,
		)
			.objects,
	).toHaveLength(
		1,
	);
	const paused =
		{
			...state,
			round:
				{
					...state.round,
					isRunning: false,
				},
		};
	expect(
		frame(
			prediction,
			paused,
		),
	).toBe(
		paused,
	);
});
