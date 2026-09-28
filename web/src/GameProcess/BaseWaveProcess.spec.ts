import {
	afterEach,
	expect,
	it,
} from "bun:test";
import { signal } from "@preact/signals";
import type { Logger } from "pino";
import { InMemoryGameEventQueue } from "@/game-events/InMemoryGameEventQueue";
import { VoidGameEventQueue } from "@/game-events/VoidGameEventQueue";
import {
	deltaTime,
	nowTime,
} from "@/time";
import { BaseWaveProcess } from "./BaseWaveProcess";

const logger =
	{
		child() {
			return this;
		},
	} as unknown as Logger;
const tickFactory =
	() => ({
		tick: () => [],
	});
const originalGetContext =
	HTMLCanvasElement
		.prototype
		.getContext;
afterEach(
	() => {
		HTMLCanvasElement.prototype.getContext =
			originalGetContext;
	},
);

it("captures network wave events immediately while local waves discard them", () => {
	HTMLCanvasElement.prototype.getContext =
		(() => ({
			createImageData:
				(
					width: number,
					height: number,
				) => ({
					data: new Uint8ClampedArray(
						width *
							height *
							4,
					),
				}),
			putImageData() {},
		})) as unknown as typeof HTMLCanvasElement.prototype.getContext;
	const network =
		new BaseWaveProcess(
			logger,
			[],
			signal(
				undefined,
			),
			false,
			tickFactory,
			() =>
				true,
		);
	const local =
		new BaseWaveProcess(
			logger,
			[],
			signal(
				undefined,
			),
			false,
			tickFactory,
		);
	expect(
		network.eventQueue,
	).toBeInstanceOf(
		InMemoryGameEventQueue,
	);
	expect(
		local.eventQueue,
	).toBeInstanceOf(
		VoidGameEventQueue,
	);
	const movement =
		{
			type: "bulbroMoved" as const,
			bulbroId:
				"guest",
			from: {
				x: 1,
				y: 1,
			},
			to: {
				x: 2,
				y: 1,
			},
			direction:
				{
					x: 1,
					y: 0,
				},
			deltaTime:
				deltaTime(
					16,
				),
			occurredAt:
				nowTime(
					100,
				),
		};
	network.eventQueue.addEvent(
		movement,
	);
	expect(
		network.eventQueue.flush(),
	).toEqual(
		[
			movement,
		],
	);
	expect(
		network.eventQueue.flush(),
	).toEqual(
		[],
	);
});
