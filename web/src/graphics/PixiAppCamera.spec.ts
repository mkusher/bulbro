import {
	expect,
	it,
	spyOn,
} from "bun:test";
import {
	Application,
	Ticker,
	TickerPlugin,
} from "pixi.js";
import { AutoCenterOnPlayerCamera } from "./AutoCenterOnPlayerCamera";
import { FadeAwayOnLowHealthCamera } from "./FadeAwayOnLowHealthCamera";
import { PixiAppCamera } from "./PixiAppCamera";

it("detaches old wave rendering through both camera wrappers while keeping the next wave attached", async () => {
	// Exercise Pixi's actual render-listener registration without a GPU renderer.
	const init =
		spyOn(
			Application.prototype,
			"init",
		).mockImplementation(
			async function (
				this: Application,
			) {
				TickerPlugin.init.call(
					this,
					{
						sharedTicker: true,
						autoStart: false,
					},
				);
			},
		);
	const render =
		spyOn(
			Application.prototype,
			"render",
		).mockImplementation(
			() => {},
		);
	const oldCamera =
		new PixiAppCamera();
	const nextCamera =
		new PixiAppCamera();
	const wrapped =
		new FadeAwayOnLowHealthCamera(
			new AutoCenterOnPlayerCamera(
				oldCamera,
			),
		);
	const ticker =
		Ticker.shared;
	const initialCount =
		ticker.count;
	try {
		await oldCamera.init(
			{
				width: 100,
				height: 100,
			},
		);
		expect(
			ticker.count,
		).toBe(
			initialCount +
				1,
		);
		ticker.update(
			ticker.lastTime +
				17,
		);
		expect(
			render,
		).toHaveBeenCalledTimes(
			1,
		);
		wrapped.detach();
		wrapped.detach();
		expect(
			ticker.count,
		).toBe(
			initialCount,
		);
		await nextCamera.init(
			{
				width: 100,
				height: 100,
			},
		);
		expect(
			ticker.count,
		).toBe(
			initialCount +
				1,
		);
		ticker.update(
			ticker.lastTime +
				17,
		);
		expect(
			render,
		).toHaveBeenCalledTimes(
			2,
		);
	} finally {
		oldCamera.detach();
		nextCamera.detach();
		init.mockRestore();
		render.mockRestore();
	}
});
