/**
 * Game Stats Panel - Real-time display of game and player statistics
 */

import { useState } from "preact/hooks";
import type { GameStatsPanelProps } from "../types";
import {
	gameState,
	isInitialized,
} from "bulbro-game-web/src/stories/gameSceneStore";
import type { BulbroState } from "bulbro-game-web/src/bulbro/BulbroState";

export function GameStatsPanel({}: GameStatsPanelProps) {
	const [
		expandedPlayers,
		setExpandedPlayers,
	] =
		useState<
			Set<string>
		>(
			new Set(),
		);

	const togglePlayerExpanded =
		(
			playerId: string,
		) => {
			const newSet =
				new Set(
					expandedPlayers,
				);
			if (
				newSet.has(
					playerId,
				)
			) {
				newSet.delete(
					playerId,
				);
			} else {
				newSet.add(
					playerId,
				);
			}
			setExpandedPlayers(
				newSet,
			);
		};

	if (
		!isInitialized.value
	) {
		return (
			<div className="bg-slate-900 text-slate-400 p-4 text-sm font-mono">
				<div className="text-xs mb-2">
					Game
					not
					initialized
				</div>
				<div>
					Initialize
					a
					game
					scene
					in
					a
					story
					to
					see
					statistics.
				</div>
			</div>
		);
	}

	const waveState =
		gameState.value;

	if (
		!waveState
	) {
		return (
			<div className="bg-slate-900 text-slate-400 p-4 text-sm font-mono">
				<div className="text-xs mb-2">
					No
					game
					state
				</div>
				<div>
					Start
					a
					game
					scene
					to
					view
					statistics.
				</div>
			</div>
		);
	}

	const {
		players,
		enemies,
		shots,
		round,
	} =
		waveState;

	const healthPercentage =
		(
			hp: number,
			maxHp: number,
		) => {
			return maxHp >
				0
				? (hp /
						maxHp) *
						100
				: 0;
		};

	const getHealthColor =
		(
			percentage: number,
		) => {
			if (
				percentage >
				60
			)
				return "bg-green-600";
			if (
				percentage >
				30
			)
				return "bg-yellow-600";
			return "bg-red-600";
		};

	return (
		<div className="bg-slate-900 text-white p-4 text-sm font-mono flex flex-col gap-4 min-w-[350px] max-h-[calc(100vh-100px)] overflow-y-auto">
			{/* Header */}
			<div className="text-base font-bold text-amber-400">
				Game
				Stats
			</div>

			{/* Game Overview Section */}
			<div className="bg-slate-800 p-3 rounded space-y-1.5 text-xs">
				<div className="font-semibold text-amber-300 mb-2">
					Game
					Overview
				</div>
				<div className="flex justify-between">
					<span className="text-slate-400">
						Wave:
					</span>
					<span className="font-semibold">
						{
							round.wave
						}
					</span>
				</div>
				<div className="flex justify-between">
					<span className="text-slate-400">
						Difficulty:
					</span>
					<span className="font-semibold text-amber-400">
						{round.difficulty.toFixed(
							2,
						)}
						x
					</span>
				</div>
				<div className="flex justify-between">
					<span className="text-slate-400">
						Duration:
					</span>
					<span className="font-semibold">
						{
							round.duration
						}
						s
					</span>
				</div>
				<div className="flex justify-between">
					<span className="text-slate-400">
						Enemies:
					</span>
					<span className="font-semibold text-red-400">
						{
							enemies.length
						}
					</span>
				</div>
				<div className="flex justify-between">
					<span className="text-slate-400">
						Shots:
					</span>
					<span className="font-semibold text-cyan-400">
						{
							shots.length
						}
					</span>
				</div>
			</div>

			{/* Players Section */}
			{players.length >
				0 && (
				<div className="space-y-2">
					<div className="text-xs font-semibold text-amber-300">
						Players
					</div>
					{players.map(
						(
							player,
						) => (
							<PlayerCard
								key={
									player.id
								}
								player={
									player
								}
								isExpanded={expandedPlayers.has(
									player.id,
								)}
								onToggleExpanded={() =>
									togglePlayerExpanded(
										player.id,
									)
								}
								healthPercentage={healthPercentage(
									player.healthPoints,
									player
										.stats
										.maxHp,
								)}
								getHealthColor={
									getHealthColor
								}
							/>
						),
					)}
				</div>
			)}

			{players.length ===
				0 && (
				<div className="text-xs text-slate-400">
					No
					players
					in
					game
				</div>
			)}
		</div>
	);
}

interface PlayerCardProps {
	player: BulbroState;
	isExpanded: boolean;
	onToggleExpanded: () => void;
	healthPercentage: number;
	getHealthColor: (
		percentage: number,
	) => string;
}

function PlayerCard({
	player,
	isExpanded,
	onToggleExpanded,
	healthPercentage,
	getHealthColor,
}: PlayerCardProps) {
	const isAlive =
		!player.killedAt;

	return (
		<div className="bg-slate-800 rounded overflow-hidden">
			{/* Player Header */}
			<button
				className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-700 transition-colors cursor-pointer text-xs"
				onClick={
					onToggleExpanded
				}
			>
				<span className="font-semibold flex-1 text-left">
					{isExpanded
						? "▼"
						: "▶"}{" "}
					{player.type.toUpperCase()}{" "}
					Lv
					{
						player.level
					}
				</span>
				<span
					className={`font-semibold ${isAlive ? "text-green-400" : "text-red-400"}`}
				>
					{isAlive
						? "ALIVE"
						: "DEAD"}
				</span>
			</button>

			{/* Health Bar */}
			<div className="px-3 py-1.5 bg-slate-700">
				<div className="flex items-center gap-1.5 mb-1">
					<div className="flex-1 h-3 bg-slate-600 rounded overflow-hidden">
						<div
							className={`h-full transition-all ${getHealthColor(healthPercentage)}`}
							style={{
								width: `${healthPercentage}%`,
							}}
						/>
					</div>
					<span className="text-xs font-semibold text-amber-300 w-16 text-right">
						{
							player.healthPoints
						}
						/
						{
							player
								.stats
								.maxHp
						}
					</span>
				</div>
				<div className="flex justify-between text-xs text-slate-400">
					<span>
						XP:{" "}
						{
							player.totalExperience
						}
					</span>
					<span>
						Materials:{" "}
						{
							player.materialsAvailable
						}
					</span>
				</div>
			</div>

			{/* Expanded Details */}
			{isExpanded && (
				<div className="px-3 py-2 space-y-3 bg-slate-750">
					{/* Stats Grid */}
					<div>
						<div className="text-xs font-semibold text-amber-300 mb-2">
							Stats
						</div>
						<div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
							{/* Left Column */}
							<StatRow
								label="Max HP"
								value={
									player
										.stats
										.maxHp
								}
							/>
							<StatRow
								label="Regen"
								value={player.stats.hpRegeneration.toFixed(
									2,
								)}
							/>
							<StatRow
								label="Life Steal"
								value={player.stats.lifeSteal.toFixed(
									2,
								)}
							/>
							<StatRow
								label="Damage"
								value={player.stats.damage.toFixed(
									1,
								)}
							/>
							<StatRow
								label="Melee DMG"
								value={player.stats.meleeDamage.toFixed(
									1,
								)}
							/>
							<StatRow
								label="Ranged DMG"
								value={player.stats.rangedDamage.toFixed(
									1,
								)}
							/>
							<StatRow
								label="Elemental DMG"
								value={player.stats.elementalDamage.toFixed(
									1,
								)}
							/>
							<StatRow
								label="Atk Speed"
								value={player.stats.attackSpeed.toFixed(
									2,
								)}
							/>
							<StatRow
								label="Crit Chance"
								value={`${(player.stats.critChance * 100).toFixed(0)}%`}
							/>
							<StatRow
								label="Engineering"
								value={player.stats.engineering.toFixed(
									2,
								)}
							/>
							<StatRow
								label="Range"
								value={player.stats.range.toFixed(
									0,
								)}
							/>
							<StatRow
								label="Armor"
								value={player.stats.armor.toFixed(
									1,
								)}
							/>
							<StatRow
								label="Dodge"
								value={`${(player.stats.dodge * 100).toFixed(0)}%`}
							/>
							<StatRow
								label="Speed"
								value={player.stats.speed.toFixed(
									2,
								)}
							/>
							<StatRow
								label="Luck"
								value={player.stats.luck.toFixed(
									2,
								)}
							/>
							<StatRow
								label="Harvesting"
								value={player.stats.harvesting.toFixed(
									2,
								)}
							/>
							<StatRow
								label="Pickup Range"
								value={player.stats.pickupRange.toFixed(
									0,
								)}
							/>
							<StatRow
								label="Knockback"
								value={player.stats.knockback.toFixed(
									2,
								)}
							/>
						</div>
					</div>

					{/* Weapons */}
					{player
						.weapons
						.length >
						0 && (
						<div>
							<div className="text-xs font-semibold text-amber-300 mb-2">
								Weapons
							</div>
							<div className="space-y-1">
								{player.weapons.map(
									(
										weapon,
										idx,
									) => (
										<div
											key={
												idx
											}
											className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300"
										>
											•{" "}
											{
												weapon.name
											}
										</div>
									),
								)}
							</div>
						</div>
					)}

					{/* Position */}
					<div className="text-xs text-slate-400 pt-2 border-t border-slate-700">
						<div>
							Position:
							(
							{Math.round(
								player
									.position
									.x,
							)}
							,{" "}
							{Math.round(
								player
									.position
									.y,
							)}
							)
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

interface StatRowProps {
	label: string;
	value:
		| string
		| number;
}

function StatRow({
	label,
	value,
}: StatRowProps) {
	return (
		<div className="flex justify-between">
			<span className="text-slate-400">
				{
					label
				}
			</span>
			<span className="font-semibold text-amber-300">
				{
					value
				}
			</span>
		</div>
	);
}
