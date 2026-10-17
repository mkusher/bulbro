import {
	useEffect,
	useMemo,
	useRef,
	useState,
} from "preact/hooks";
import { BulbroState } from "@/bulbro/BulbroState";
import { wellRoundedBulbro } from "@/characters-definitions/well-rounded";
import { waveSummaryDismissed } from "@/currentGameProcess";
import {
	canvasSize,
	classicMapSize,
} from "@/game-canvas";
import { withEventMeta } from "@/game-events/GameEvents";
import { waveStats } from "@/gameStats";
import type { Position } from "@/geometry";
import type { Camera } from "@/graphics/Camera";
import { createGameCamera } from "@/graphics/GameCamera";
import { StageWithUi } from "@/graphics/StageWithUi";
import { logger } from "@/logger";
import type { Material } from "@/object/MaterialState";
import { WaveEndSummary } from "@/screens/WaveEndSummary";
import {
	deltaTime,
	nowTime,
} from "@/time";
import { Button } from "@/ui/shadcn/button";
import {
	updateState,
	type WaveState,
	waveState,
} from "@/waveState";
import { StorybookGameScene } from "./StorybookGameScene";
import { createBulbroState } from "./storyHelpers";

export default {
	title:
		"Game Scenes/Bagged Materials",
};

const playerPosition =
	{
		x: 1000,
		y: 750,
	};

/** Materials scattered on a spiral around the player */
function scatterMaterials(
	count: number,
	minRadius: number,
	maxRadius: number,
): Material[] {
	return Array.from(
		{
			length:
				count,
		},
		(
			_,
			i,
		) => {
			const angle =
				i *
				2.4;
			const radius =
				minRadius +
				((maxRadius -
					minRadius) *
					i) /
					Math.max(
						1,
						count -
							1,
					);
			const position: Position =
				{
					x: Math.round(
						playerPosition.x +
							Math.cos(
								angle,
							) *
								radius,
					),
					y: Math.round(
						playerPosition.y +
							Math.sin(
								angle,
							) *
								radius *
								0.7,
					),
				};
			return {
				type: "material",
				id: `material-${i}`,
				position,
				value: 1,
			};
		},
	);
}

function stateWithBag(
	bagMaterials: number,
	materials: Material[],
	materialsAvailable = 12,
): WaveState {
	const state =
		createBulbroState(
			"player-1",
			playerPosition,
			{
				...wellRoundedBulbro,
				weapons:
					[
						...wellRoundedBulbro.defaultWeapons,
					],
			},
			{
				objects:
					materials,
			},
		);
	return {
		...state,
		players:
			state.players.map(
				(
					p,
				) =>
					new BulbroState(
						{
							...p.toJSON(),
							materialsAvailable,
							bagMaterials,
						},
					),
			),
	};
}

/**
 * Bag under the materials counter in the HUD. Play the scene and walk over
 * the materials: every pickup takes one material out of the bag and gives +2.
 */
export const BagInHud =
	{
		render:
			() => {
				const state =
					useMemo(
						() =>
							stateWithBag(
								7,
								scatterMaterials(
									14,
									40,
									450,
								),
							),
						[],
					);
				return (
					<div
						style={{
							height:
								"100vh",
						}}
					>
						<StorybookGameScene
							initialState={
								state
							}
							showGameStats={
								false
							}
						/>
					</div>
				);
			},
	};

type WaveEndProps =
	{
		bagMaterials: number;
		materials: Material[];
	};

/**
 * The real game stage at the moment a wave is won: materials left on the field
 * fly into the bag, then the wave end summary shows up.
 */
function WaveEndBaggingScene({
	bagMaterials,
	materials,
}: WaveEndProps) {
	const rootRef =
		useRef<HTMLDivElement>(
			null,
		);
	const [
		run,
		setRun,
	] =
		useState(
			0,
		);
	const [
		isBagged,
		setBagged,
	] =
		useState(
			false,
		);

	useEffect(() => {
		const root =
			rootRef.current;
		if (
			!root
		)
			return;
		let isCancelled = false;
		let camera:
			| Camera
			| undefined;
		setBagged(
			false,
		);

		const start =
			async () => {
				const size =
					{
						width:
							root.clientWidth,
						height:
							root.clientHeight,
					};
				canvasSize.value =
					size;
				camera =
					createGameCamera();
				await camera.init(
					size,
				);
				const zoom =
					Math.max(
						size.height,
						1125,
					) /
					classicMapSize.height;
				camera.zoom(
					zoom,
				);
				const stage =
					new StageWithUi(
						logger,
						false,
						camera,
						zoom,
					);
				const running =
					stateWithBag(
						bagMaterials,
						materials,
					);
				await stage.init(
					running,
				);
				if (
					isCancelled
				)
					return;
				root.innerHTML =
					"";
				root.appendChild(
					camera.canvas as HTMLCanvasElement,
				);
				camera.ticker.start();

				// Let the field be seen for a moment before the wave ends
				await new Promise(
					(
						resolve,
					) =>
						setTimeout(
							resolve,
							700,
						),
				);
				if (
					isCancelled
				)
					return;
				const ended =
					updateState(
						running,
						withEventMeta(
							{
								type: "waveEnded",
							},
							deltaTime(
								16,
							),
							nowTime(
								0,
							),
						),
					);
				stage.update(
					deltaTime(
						0,
					),
					nowTime(
						0,
					),
					ended,
					[],
				);
				await stage.playBaggingAnimation(
					ended,
					camera.ticker,
				);
				if (
					isCancelled
				)
					return;
				waveState.value =
					ended;
				waveStats.value =
					{
						wave: 1,
						enemiesKilled: 31,
						damageDealt: 2140,
						damageTaken: 9,
						materialsCollected: 23,
						survivalTime: 60,
					};
				waveSummaryDismissed.value = false;
				setBagged(
					true,
				);
			};

		start().catch(
			console.error,
		);
		return () => {
			isCancelled = true;
			camera?.detach();
			root.innerHTML =
				"";
		};
	}, [
		run,
		bagMaterials,
		materials,
	]);

	return (
		<div className="relative h-screen w-full">
			<div
				ref={
					rootRef
				}
				className="h-full w-full"
			/>
			{isBagged &&
				!waveSummaryDismissed.value && (
					<WaveEndSummary />
				)}
			<div className="fixed right-4 bottom-4 z-30">
				<Button
					onClick={() =>
						setRun(
							(
								r,
							) =>
								r +
								1,
						)
					}
				>
					Replay
				</Button>
			</div>
		</div>
	);
}

// Module constants: a new array on every render would restart the scene
const fewMaterials =
	scatterMaterials(
		18,
		150,
		650,
	);
const someMaterials =
	scatterMaterials(
		6,
		200,
		500,
	);
const manyMaterials =
	scatterMaterials(
		120,
		100,
		900,
	);

export const WaveEndBagging =
	{
		render:
			() => (
				<WaveEndBaggingScene
					bagMaterials={
						0
					}
					materials={
						fewMaterials
					}
				/>
			),
	};

export const WaveEndBaggingIntoNonEmptyBag =
	{
		render:
			() => (
				<WaveEndBaggingScene
					bagMaterials={
						9
					}
					materials={
						someMaterials
					}
				/>
			),
	};

export const WaveEndBaggingManyMaterials =
	{
		render:
			() => (
				<WaveEndBaggingScene
					bagMaterials={
						0
					}
					materials={
						manyMaterials
					}
				/>
			),
	};
