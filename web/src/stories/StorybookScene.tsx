import { useEffect, useRef, useState } from "preact/hooks";
import * as PIXI from "pixi.js";
import { classicMapSize } from "@/game-canvas";
import { PlayingFieldTile } from "@/graphics/PlayingFieldTile";

export interface StorybookSprite<S> {
	init(): Promise<void>;
	appendTo(parent: PIXI.Container, layer: PIXI.IRenderLayer): void;
	update(state: S, delta: number): void;
	remove(): void;
}

export interface StorybookSceneProps<S> {
	sprite: StorybookSprite<S>;
	state: S;
	canvasScale?: number;
	backgroundColor?: number;
	spriteScale?: number;
	centerSprite?: boolean;
	tick?: (deltaTime: number) => void;
}

export function StorybookScene<S>({
	sprite,
	state: mockState,
	canvasScale = 0.6,
	backgroundColor = 0x1a1a1a,
	spriteScale = 2,
	centerSprite = true,
	tick,
}: StorybookSceneProps<S>) {
	const canvasRef = useRef<HTMLDivElement>(null);
	const [app, setApp] = useState<PIXI.Application | null>(null);

	useEffect(() => {
		if (!canvasRef.current) return;

		const initPixi = async () => {
			const app = new PIXI.Application();
			setApp(app);

			// Calculate canvas size based on scale
			const canvasWidth = classicMapSize.width * canvasScale;
			const canvasHeight = classicMapSize.height * canvasScale;

			await app.init({
				width: canvasWidth,
				height: canvasHeight,
				backgroundColor,
			});

			canvasRef.current?.appendChild(app.canvas as HTMLCanvasElement);

			// Create playing field using the real PlayingFieldTile
			const playingField = new PlayingFieldTile(classicMapSize);
			await playingField.init(app.stage);

			// Scale and center the playing field
			const fieldScale = canvasScale * 0.8;

			playingField.container.scale.set(fieldScale);
			playingField.container.x =
				(app.canvas.width - classicMapSize.width * fieldScale) / 2;
			playingField.container.y =
				(app.canvas.height - classicMapSize.height * fieldScale) / 2;

			// Create sprite container
			const spriteContainer = new PIXI.Container();

			if (centerSprite) {
				spriteContainer.x =
					playingField.container.x + (classicMapSize.width * fieldScale) / 2;
				spriteContainer.y =
					playingField.container.y + (classicMapSize.height * fieldScale) / 2;
			} else {
				spriteContainer.x = playingField.container.x + 100 * fieldScale;
				spriteContainer.y = playingField.container.y + 100 * fieldScale;
			}

			spriteContainer.scale.set(fieldScale * spriteScale);
			app.stage.addChild(spriteContainer);

			// Initialize and add sprite
			await sprite.init();

			const layer = new PIXI.RenderLayer();
			app.stage.addChild(layer);
			sprite.appendTo(spriteContainer, layer);
		};

		if (!app) {
			initPixi();
		}

		return () => {
			if (sprite) {
				sprite.remove();
			}
			if (app) {
				app.destroy();
			}
		};
	}, [
		app,
		setApp,
		sprite,
		canvasScale,
		backgroundColor,
		spriteScale,
		centerSprite,
	]);

	useEffect(() => {
		const state = mockState;
		sprite.update(state, 0);
		// Animation loop with ticker
		let tickCount = 0;
		const ticker: PIXI.TickerCallback<{}> = (ticker) => {
			const delta = ticker.deltaMS / 1000;
			tickCount += delta;

			sprite.update(state, delta);
			tick?.(delta);
		};
		if (app && app.ticker) {
			app.ticker.add(ticker);
			return () => {
				app?.ticker?.remove(ticker);
			};
		}
	}, [mockState, sprite, tick, app, app?.ticker]);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				padding: "20px",
			}}
		>
			<div
				ref={canvasRef}
				style={{
					border: "2px solid #333",
					borderRadius: "8px",
					boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
				}}
			/>
		</div>
	);
}
