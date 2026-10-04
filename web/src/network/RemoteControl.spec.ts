import {
	expect,
	it,
} from "bun:test";
import type { LiveStateMessage } from "./InGameCommunicationChannel";
import { RemoteRepeatLastKnownDirectionControl } from "./RemoteControl";

function position(
	version: number,
	x = 1,
): LiveStateMessage {
	return {
		type: "game-state-position-updated",
		playerId:
			"remote",
		gameId:
			"game",
		position:
			{
				x: 100,
				y: 100,
			},
		direction:
			{
				x,
				y: 0,
			},
		version,
		sentAt: 0,
	};
}
function batch(
	version: number,
	x = 1,
): LiveStateMessage {
	return {
		type: "game-state-updated-by-host",
		gameId:
			"game",
		version,
		sentAt: 0,
		events:
			[
				{
					type: "bulbroMoved",
					bulbroId:
						"remote",
					from: {
						x: 90,
						y: 100,
					},
					to: {
						x: 100,
						y: 100,
					},
					direction:
						{
							x,
							y: 0,
						},
					deltaTime: 16,
					occurredAt: 100,
				},
			],
	};
}

it("uses fresh position directions and ignores stale packets and batches after a stop", async () => {
	const control =
		new RemoteRepeatLastKnownDirectionControl(
			false,
			"remote",
		);
	await control.start();
	control.onMessage(
		batch(
			50,
			-1,
		),
	);
	expect(
		control
			.direction
			.x,
	).toBe(
		-1,
	);
	control.onMessage(
		position(
			0,
		),
	);
	expect(
		control
			.direction
			.x,
	).toBe(
		1,
	);
	control.onMessage(
		position(
			2,
			0,
		),
	);
	control.onMessage(
		position(
			1,
		),
	);
	control.onMessage(
		batch(
			51,
		),
	);
	expect(
		control.direction,
	).toEqual(
		{
			x: 0,
			y: 0,
		},
	);
});

it("ignores other players and resets directions and sequences between waves", async () => {
	const control =
		new RemoteRepeatLastKnownDirectionControl(
			true,
			"remote",
		);
	control.onMessage(
		position(
			20,
		),
	);
	expect(
		control
			.direction
			.x,
	).toBe(
		0,
	);
	await control.start();
	control.onMessage(
		{
			...position(
				30,
			),
			playerId:
				"local",
		} as LiveStateMessage,
	);
	expect(
		control
			.direction
			.x,
	).toBe(
		0,
	);
	control.onMessage(
		position(
			20,
		),
	);
	expect(
		control
			.direction
			.x,
	).toBe(
		1,
	);
	await control.stop();
	expect(
		control
			.direction
			.x,
	).toBe(
		0,
	);
	await control.start();
	control.onMessage(
		position(
			0,
			-1,
		),
	);
	expect(
		control
			.direction
			.x,
	).toBe(
		-1,
	);
});

it("supports ordered movement batches until the first position packet", async () => {
	const control =
		new RemoteRepeatLastKnownDirectionControl(
			false,
			"remote",
		);
	await control.start();
	control.onMessage(
		batch(
			2,
		),
	);
	control.onMessage(
		batch(
			1,
			-1,
		),
	);
	expect(
		control
			.direction
			.x,
	).toBe(
		1,
	);
	control.onMessage(
		{
			...batch(
				3,
			),
			events:
				[],
		} as LiveStateMessage,
	);
	expect(
		control
			.direction
			.x,
	).toBe(
		0,
	);
});
