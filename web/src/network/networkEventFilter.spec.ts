import {
	expect,
	it,
} from "bun:test";
import type { GameEvent } from "@/game-events/GameEvents";
import {
	deltaTime,
	nowTime,
} from "@/time";
import {
	isLocallyAuthoritativeEvent,
	isLocallySimulatedEvent,
} from "./networkEventFilter";

const meta =
	{
		deltaTime:
			deltaTime(
				16,
			),
		occurredAt:
			nowTime(
				100,
			),
	};
const hostMove: GameEvent =
	{
		...meta,
		type: "bulbroMoved",
		bulbroId:
			"host",
		from: {
			x: 0,
			y: 0,
		},
		to: {
			x: 1,
			y: 0,
		},
		direction:
			{
				x: 1,
				y: 0,
			},
	};
const guestMove: GameEvent =
	{
		...hostMove,
		bulbroId:
			"guest",
	};
const worldTick: GameEvent =
	{
		...meta,
		type: "tick",
	};

it("lets each player move locally while only the host simulates the world", () => {
	expect(
		[
			hostMove,
			guestMove,
			worldTick,
		].filter(
			(
				event,
			) =>
				isLocallyAuthoritativeEvent(
					event,
					true,
					"host",
				),
		),
	).toEqual(
		[
			hostMove,
			worldTick,
		],
	);
	expect(
		[
			hostMove,
			guestMove,
			worldTick,
		].filter(
			(
				event,
			) =>
				isLocallyAuthoritativeEvent(
					event,
					false,
					"guest",
				),
		),
	).toEqual(
		[
			guestMove,
		],
	);
});

it("predicts remote movement locally but never broadcasts it as authoritative", () => {
	for (const isHost of [
		true,
		false,
	]) {
		const localId =
			isHost
				? "host"
				: "guest";
		const remote =
			isHost
				? guestMove
				: hostMove;
		expect(
			isLocallySimulatedEvent(
				remote,
				isHost,
			),
		).toBe(
			true,
		);
		expect(
			isLocallyAuthoritativeEvent(
				remote,
				isHost,
				localId,
			),
		).toBe(
			false,
		);
		expect(
			isLocallySimulatedEvent(
				worldTick,
				isHost,
			),
		).toBe(
			isHost,
		);
	}
});
