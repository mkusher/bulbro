import {
	describe,
	expect,
	it,
} from "bun:test";
import * as PIXI from "pixi.js";
import { deltaTime } from "@/time";
import { AnimatedSprite } from "./AnimatedSprite";

function deferredFrames() {
	const resolvers: ((
		frame: PIXI.Container,
	) => void)[] =
		[];
	const animation =
		new AnimatedSprite<PIXI.Container>(
			2,
			() =>
				new Promise<PIXI.Container>(
					(
						resolve,
					) => {
						resolvers.push(
							resolve,
						);
					},
				),
		);
	return {
		animation,
		resolvers,
	};
}

describe("AnimatedSprite", () => {
	it("draws a frame once while it is still being built", async () => {
		const {
			animation,
			resolvers,
		} =
			deferredFrames();
		const first =
			animation.getSprite(
				deltaTime(
					0,
				),
			);
		const second =
			animation.getSprite(
				deltaTime(
					0,
				),
			);
		expect(
			resolvers,
		).toHaveLength(
			1,
		);
		const frame =
			new PIXI.Container();
		resolvers[0]!(
			frame,
		);
		expect(
			await first,
		).toBe(
			frame,
		);
		expect(
			await second,
		).toBe(
			frame,
		);
	});

	it("destroys cached frames", async () => {
		const {
			animation,
			resolvers,
		} =
			deferredFrames();
		const pending =
			animation.getSprite(
				deltaTime(
					0,
				),
			);
		const frame =
			new PIXI.Container();
		resolvers[0]!(
			frame,
		);
		await pending;
		animation.destroy();
		expect(
			frame.destroyed,
		).toBe(
			true,
		);
	});

	it("destroys a frame finished after destroy", async () => {
		const {
			animation,
			resolvers,
		} =
			deferredFrames();
		const pending =
			animation.getSprite(
				deltaTime(
					0,
				),
			);
		animation.destroy();
		const frame =
			new PIXI.Container();
		resolvers[0]!(
			frame,
		);
		await pending;
		expect(
			frame.destroyed,
		).toBe(
			true,
		);
	});
});
