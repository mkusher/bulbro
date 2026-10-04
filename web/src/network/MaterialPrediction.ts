import type { StatePrediction } from "@/GameProcess";
import type { Position } from "@/geometry";
import type { Material } from "@/object/MaterialState";
import { deltaTime } from "@/time";
import { generateMaterialMovementEvents } from "@/waveState";

interface PredictedMaterial {
	authoritative: Material;
	position: Position;
	target?: Position;
	collected: boolean;
}

/** Guest presentation only: pickup rewards and removal remain host-authoritative. */
export class MaterialPrediction {
	#materials =
		new Map<
			string,
			PredictedMaterial
		>();

	predict: StatePrediction =
		(
			state,
			delta,
		) => {
			if (
				!state
					.round
					.isRunning
			) {
				this.#materials.clear();
				return state;
			}
			// Avoid a suspended tab predicting a whole wave in one frame.
			const step =
				deltaTime(
					Math.max(
						0,
						Math.min(
							delta,
							100,
						),
					),
				);
			const correctionFraction =
				1 -
				Math.exp(
					-step /
						100,
				);
			const present =
				new Set<string>();
			const targets: Material[] =
				[];
			const objects =
				state.objects.map(
					(
						object,
					) => {
						if (
							object.type !==
							"material"
						)
							return object;
						present.add(
							object.id,
						);
						let predicted =
							this.#materials.get(
								object.id,
							);
						if (
							!predicted
						) {
							predicted =
								{
									authoritative:
										object,
									position:
										object.position,
									collected: false,
								};
							this.#materials.set(
								object.id,
								predicted,
							);
						} else if (
							predicted.authoritative !==
							object
						) {
							// Reconcile from the latest host position without making the sprite jump
							// backwards whenever a delayed movement batch arrives.
							predicted.authoritative =
								object;
							predicted.target =
								object.position;
						}
						if (
							predicted.target
						) {
							targets.push(
								{
									...object,
									position:
										predicted.target,
								},
							);
							predicted.position =
								{
									x:
										predicted
											.position
											.x +
										(predicted
											.target
											.x -
											predicted
												.position
												.x) *
											correctionFraction,
									y:
										predicted
											.position
											.y +
										(predicted
											.target
											.y -
											predicted
												.position
												.y) *
											correctionFraction,
								};
						}
						if (
							step >
							0
						)
							predicted.collected = false;
						return {
							...object,
							position:
								predicted.position,
						};
					},
				);
			for (const id of this.#materials.keys()) {
				if (
					!present.has(
						id,
					)
				)
					this.#materials.delete(
						id,
					);
			}
			if (
				step >
				0
			) {
				// Advance correction targets with the same pickup physics. A fixed target
				// would pull a moving pickup back toward an obsolete host snapshot.
				for (const event of generateMaterialMovementEvents(
					{
						...state,
						objects:
							targets,
					},
					step,
				)) {
					this.#materials.get(
						event.materialId,
					)!.target =
						event.type ===
						"materialMoved"
							? event.to
							: state.players.find(
									(
										player,
									) =>
										player.id ===
										event.playerId,
								)!
									.position;
				}
				for (const event of generateMaterialMovementEvents(
					{
						...state,
						objects,
					},
					step,
				)) {
					const predicted =
						this.#materials.get(
							event.materialId,
						)!;
					predicted.collected =
						event.type ===
						"materialCollected";
					predicted.position =
						event.type ===
						"materialMoved"
							? event.to
							: state.players.find(
									(
										player,
									) =>
										player.id ===
										event.playerId,
								)!
									.position;
				}
			}
			return {
				...state,
				objects:
					objects
						.filter(
							(
								object,
							) =>
								object.type !==
									"material" ||
								!this.#materials.get(
									object.id,
								)!
									.collected,
						)
						.map(
							(
								object,
							) =>
								object.type ===
								"material"
									? {
											...object,
											position:
												this.#materials.get(
													object.id,
												)!
													.position,
										}
									: object,
						),
			};
		};
}
