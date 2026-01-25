import * as PIXI from "pixi.js";
import {
	useEffect,
	useRef,
} from "preact/hooks";
import { createPixiInitOptions } from "../graphics/PixiConfiguration";
import { MaterialSprite } from "../object/MaterialSprite";
import type { Material } from "../object/MaterialState";
import { SpawningEnemySprite } from "../object/SpawningEnemySprite";
import type { SpawningEnemy } from "../object/SpawningEnemyState";

export default {
	title:
		"Objects/Objects",
};

interface ObjectRendererProps {
	objectType:
		| "material"
		| "spawning_enemy";
	width: number;
	height: number;
	backgroundColor?: number;
	debug?: boolean;
	centerObject?: boolean;
	tick?: (
		deltaTime: number,
	) => void;
}

function ObjectRenderer({
	objectType,
	width,
	height,
	backgroundColor = 0x222222,
	debug = false,
	centerObject = true,
	tick,
}: ObjectRendererProps) {
	const canvasRef =
		useRef<HTMLDivElement>(
			null,
		);

	useEffect(() => {
		const canvas =
			canvasRef.current;
		if (
			!canvas
		)
			return;

		let app: PIXI.Application | null =
			null;
		let objectSprite:
			| MaterialSprite
			| SpawningEnemySprite;

		const initPixi =
			async () => {
				// Create PIXI application
				app =
					new PIXI.Application();
				await app.init(
					createPixiInitOptions(
						{
							width,
							height,
							backgroundColor,
						},
					),
				);

				// Add canvas to container
				canvas.appendChild(
					app.canvas as HTMLCanvasElement,
				);

				// Create render layer
				const layer =
					new PIXI.RenderLayer();
				app.stage.addChild(
					layer,
				);

				// Create object sprite based on type
				if (
					objectType ===
					"material"
				) {
					objectSprite =
						new MaterialSprite(
							debug,
						);
					const material: Material =
						{
							type: "material",
							id: "demo-material",
							position:
								centerObject
									? {
											x:
												width /
												2,
											y:
												height /
												2,
										}
									: {
											x: 50,
											y: 50,
										},
							value: 10,
						};
					await objectSprite.init(
						material,
						app.stage,
						layer,
					);
				} else {
					objectSprite =
						new SpawningEnemySprite(
							debug,
						);
					const spawningEnemy: SpawningEnemy =
						{
							type: "spawning-enemy",
							id: "demo-spawner",
							position:
								centerObject
									? {
											x:
												width /
												2,
											y:
												height /
												2,
										}
									: {
											x: 50,
											y: 50,
										},
							startedAt:
								Date.now(),
							duration: 3000,
							enemy:
								null as any, // TODO: Create proper enemy state
						};
					await objectSprite.init();
					app.stage.addChild(
						(
							objectSprite as any
						)
							.container,
					);
					layer.attach(
						(
							objectSprite as any
						)
							.container,
					);
				}

				// Start animation loop if tick function provided
				if (
					tick
				) {
					app.ticker.add(
						(
							ticker,
						) => {
							const deltaTime =
								ticker.deltaMS /
								1000;
							tick(
								deltaTime,
							);
						},
					);
				}
			};

		const initPromise =
			initPixi();

		// Cleanup function
		return async () => {
			if (
				objectSprite
			) {
				objectSprite.remove();
			}
			if (
				app
			) {
				try {
					await initPromise;
					canvas.removeChild(
						app.canvas,
					);
					app.ticker?.stop();
					app.destroy();
					app =
						null;
				} catch (e) {
					console.error(
						"Destroy failed",
						e,
					);
				}
			}
		};
	}, [
		objectType,
		width,
		height,
		backgroundColor,
		debug,
		centerObject,
		tick,
	]);

	return (
		<div
			ref={
				canvasRef
			}
			style={{
				display:
					"inline-block",
				border:
					"2px solid #333",
				borderRadius:
					"8px",
				boxShadow:
					"0 4px 8px rgba(0,0,0,0.3)",
			}}
		/>
	);
}

export const MaterialStory =
	{
		render:
			(
				args: any,
			) => (
				<ObjectRenderer
					objectType="material"
					width={
						args.width
					}
					height={
						args.height
					}
					debug={
						args.debug
					}
					{...args}
				/>
			),
		args: {
			width: 400,
			height: 300,
			debug: false,
		},
		argTypes:
			{
				width:
					{
						control:
							{
								type: "range",
								min: 200,
								max: 800,
								step: 50,
							},
					},
				height:
					{
						control:
							{
								type: "range",
								min: 150,
								max: 600,
								step: 50,
							},
					},
				debug:
					{
						control:
							"boolean",
					},
			},
	};

export const SpawningEnemyStory =
	{
		render:
			(
				args: any,
			) => (
				<ObjectRenderer
					objectType="spawning_enemy"
					width={
						args.width
					}
					height={
						args.height
					}
					debug={
						args.debug
					}
					{...args}
				/>
			),
		args: {
			width: 400,
			height: 300,
			debug: false,
		},
		argTypes:
			{
				width:
					{
						control:
							{
								type: "range",
								min: 200,
								max: 800,
								step: 50,
							},
					},
				height:
					{
						control:
							{
								type: "range",
								min: 150,
								max: 600,
								step: 50,
							},
					},
				debug:
					{
						control:
							"boolean",
					},
			},
	};

export const AnimatedMaterial =
	{
		render:
			(
				args: any,
			) => (
				<ObjectRenderer
					objectType="material"
					width={
						args.width
					}
					height={
						args.height
					}
					debug={
						args.debug
					}
					tick={(
						deltaTime,
					) => {
						// Add a gentle floating animation to the material
						const canvas =
							document.querySelector(
								"canvas",
							);
						if (
							canvas &&
							(
								canvas as any
							)
								.app
						) {
							const app =
								(
									canvas as any
								)
									.app;
							const container =
								app
									.stage
									.children[0]
									?.children[0]; // Navigate to the material container
							if (
								container
							) {
								const time =
									Date.now() /
									1000;
								container.y =
									args.height /
										2 +
									Math.sin(
										time *
											2,
									) *
										10; // Gentle floating
								container.rotation =
									Math.sin(
										time,
									) *
									0.1; // Gentle rotation
							}
						}
					}}
					{...args}
				/>
			),
		args: {
			width: 400,
			height: 300,
			debug: false,
		},
		argTypes:
			{
				width:
					{
						control:
							{
								type: "range",
								min: 200,
								max: 800,
								step: 50,
							},
					},
				height:
					{
						control:
							{
								type: "range",
								min: 150,
								max: 600,
								step: 50,
							},
					},
				debug:
					{
						control:
							"boolean",
					},
			},
	};

export const ObjectShowcase =
	{
		render:
			(
				args: any,
			) => {
				return (
					<div
						style={{
							display:
								"flex",
							flexWrap:
								"wrap",
							gap: "20px",
							padding:
								"20px",
							backgroundColor:
								"#1a1a1a",
						}}
					>
						<div
							style={{
								textAlign:
									"center",
							}}
						>
							<h3
								style={{
									margin:
										"0 0 10px 0",
									color:
										"#fff",
								}}
							>
								Material
								Crystal
							</h3>
							<ObjectRenderer
								objectType="material"
								width={
									200
								}
								height={
									150
								}
								debug={
									args.debug
								}
							/>
							<div
								style={{
									color:
										"#ccc",
									fontSize:
										"12px",
									marginTop:
										"10px",
								}}
							>
								<div>
									Collectible
									resource
								</div>
								<div>
									Value:
									10
									materials
								</div>
							</div>
						</div>

						<div
							style={{
								textAlign:
									"center",
							}}
						>
							<h3
								style={{
									margin:
										"0 0 10px 0",
									color:
										"#fff",
								}}
							>
								Enemy
								Spawner
							</h3>
							<ObjectRenderer
								objectType="spawning_enemy"
								width={
									200
								}
								height={
									150
								}
								debug={
									args.debug
								}
							/>
							<div
								style={{
									color:
										"#ccc",
									fontSize:
										"12px",
									marginTop:
										"10px",
								}}
							>
								<div>
									Spawns
									enemies
								</div>
								<div>
									Type:
									Baby
									Enemy
								</div>
							</div>
						</div>
					</div>
				);
			},
		args: {
			debug: false,
		},
		argTypes:
			{
				debug:
					{
						control:
							"boolean",
					},
			},
	};
