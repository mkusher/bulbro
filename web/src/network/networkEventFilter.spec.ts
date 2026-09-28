import {
	expect,
	it,
} from "bun:test";
import type { GameEvent } from "@/game-events/GameEvents";
import {
	deltaTime,
	nowTime,
} from "@/time";
import { isLocallyAuthoritativeEvent } from "./networkEventFilter";

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
