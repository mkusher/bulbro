import type { Stats } from "../bulbro/BulbroCharacter";
import type { WaveState } from "../waveState";

export type GameStatsOverlayProps =
	{
		state: WaveState | null;
		showPlayerStats?: boolean;
	};

export function GameStatsOverlay({
	state,
	showPlayerStats = false,
}: GameStatsOverlayProps) {
	if (
		!state
	)
		return null;

	const player =
		state
			.players[0];
	const aliveEnemies =
		state.enemies.filter(
			(
				e,
			) =>
				e.healthPoints >
				0,
		);
	const deadEnemies =
		state.enemies.filter(
			(
				e,
			) =>
				e.healthPoints <=
				0,
		);

	return (
		<div className="fixed top-2.5 right-2.5 z-40 bg-black/80 text-white p-3 rounded-lg text-xs font-mono min-w-[250px] max-w-[300px]">
			<div className="text-sm font-bold mb-2">
				Game
				Stats
			</div>

			<div className="space-y-1">
				<div className="flex justify-between">
					<span className="text-gray-400">
						Wave:
					</span>
					<span className="font-medium">
						{
							state
								.round
								.wave
						}
					</span>
				</div>

				<div className="flex justify-between">
					<span className="text-gray-400">
						Enemies:
					</span>
					<span className="font-medium">
						{
							aliveEnemies.length
						}{" "}
						/{" "}
						{
							state
								.enemies
								.length
						}
					</span>
				</div>

				<div className="flex justify-between">
					<span className="text-gray-400">
						Killed:
					</span>
					<span className="font-medium text-green-400">
						{
							deadEnemies.length
						}
					</span>
				</div>
			</div>

			{player && (
				<>
					<div className="border-t border-gray-600 my-2" />
					<div className="text-sm font-bold mb-2">
						Player
						Stats
					</div>

					<div className="space-y-1 mb-2">
						<div className="flex justify-between">
							<span className="text-gray-400">
								HP:
							</span>
							<span
								className={`font-medium ${
									player.healthPoints <
									player
										.stats
										.maxHp *
										0.3
										? "text-red-400"
										: "text-green-400"
								}`}
							>
								{player.healthPoints.toFixed(
									0,
								)}{" "}
								/{" "}
								{
									player
										.stats
										.maxHp
								}
							</span>
						</div>

						<div className="flex justify-between">
							<span className="text-gray-400">
								Level:
							</span>
							<span className="font-medium">
								{
									player.level
								}
							</span>
						</div>

						<div className="flex justify-between">
							<span className="text-gray-400">
								XP:
							</span>
							<span className="font-medium">
								{
									player.totalExperience
								}
							</span>
						</div>

						<div className="flex justify-between">
							<span className="text-gray-400">
								Materials:
							</span>
							<span className="font-medium">
								{
									player.materialsAvailable
								}
							</span>
						</div>

						<div className="flex justify-between">
							<span className="text-gray-400">
								Weapons:
							</span>
							<span className="font-medium">
								{
									player
										.weapons
										.length
								}
							</span>
						</div>
					</div>

					{showPlayerStats && (
						<>
							<div className="border-t border-gray-600 my-2" />
							<div className="text-xs font-bold mb-2 text-gray-300">
								Core
								Stats
							</div>
							<div className="space-y-1">
								{getMainStatEntries(
									player.stats,
								).map(
									([
										key,
										value,
									]) => (
										<div
											key={
												key
											}
											className="flex justify-between"
										>
											<span className="text-gray-400">
												{formatStatName(
													key,
												)}
												:
											</span>
											<span className="font-medium">
												{
													value
												}
											</span>
										</div>
									),
								)}
							</div>

							{getSecondaryStatEntries(
								player.stats,
							)
								.length >
								0 && (
								<>
									<div className="border-t border-gray-600 my-2" />
									<div className="text-xs font-bold mb-2 text-gray-300">
										Secondary
										Stats
									</div>
									<div className="space-y-1">
										{getSecondaryStatEntries(
											player.stats,
										).map(
											([
												key,
												value,
											]) => (
												<div
													key={
														key
													}
													className="flex justify-between"
												>
													<span className="text-gray-400">
														{formatStatName(
															key,
														)}
														:
													</span>
													<span className="font-medium">
														{
															value
														}
													</span>
												</div>
											),
										)}
									</div>
								</>
							)}
						</>
					)}
				</>
			)}
		</div>
	);
}

function getMainStatEntries(
	stats: Stats,
) {
	const mainStats: (keyof Stats)[] =
		[
			"maxHp",
			"hpRegeneration",
			"damage",
			"meleeDamage",
			"rangedDamage",
			"elementalDamage",
			"attackSpeed",
			"critChance",
			"engineering",
			"range",
			"armor",
			"dodge",
			"speed",
			"luck",
			"harvesting",
		];

	return mainStats
		.map(
			(
				key,
			) =>
				[
					key,
					stats[
						key
					],
				] as const,
		)
		.filter(
			([
				_,
				value,
			]) =>
				value !==
					undefined &&
				value !==
					0,
		);
}

function getSecondaryStatEntries(
	stats: Stats,
) {
	const secondaryStats: (keyof Stats)[] =
		[
			"pickupRange",
			"knockback",
		];

	return secondaryStats
		.map(
			(
				key,
			) =>
				[
					key,
					stats[
						key
					],
				] as const,
		)
		.filter(
			([
				_,
				value,
			]) =>
				value !==
					undefined &&
				value !==
					0,
		);
}

function formatStatName(
	key: string,
): string {
	return key
		.replace(
			/([A-Z])/g,
			" $1",
		)
		.replace(
			/^./,
			(
				str,
			) =>
				str.toUpperCase(),
		)
		.trim();
}
