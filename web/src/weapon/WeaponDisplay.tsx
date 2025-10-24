import * as PIXI from "pixi.js";
import type { Weapon } from "../weapon";
import type { WeaponState } from "./WeaponState";
import { fromWeaponState } from "../weapon";
import { WeaponSprite } from "./sprites/WeaponSprite";
import { PixiApp } from "../ui/PixiApp";
import { isEqual, zeroPoint, type Direction } from "@/geometry";

export type WeaponRarity =
	| "common"
	| "uncommon"
	| "rare"
	| "exceptional"
	| "legendary";

const rarityBackgrounds: Record<WeaponRarity, number> = {
	common: 0x808080, // grey
	uncommon: 0x4a90e2, // blue
	rare: 0x7ed321, // green
	exceptional: 0xff8c00, // orange
	legendary: 0x9013fe, // violet
};

export type WeaponDisplayProps = {
	weapon: Weapon;
	rarity?: WeaponRarity;
	width?: number;
	height?: number;
	className?: string;
	showStats?: boolean;
	scale?: number;
	direction?: Direction;
};

export function WeaponDisplay({
	weapon,
	rarity = "common",
	width = 150,
	height = 100,
	className,
	showStats = false,
	scale = 0.5,
	direction,
}: WeaponDisplayProps) {
	const onInit = async (app: PIXI.Application, canvas: HTMLDivElement) => {
		// Get container dimensions
		const rect = canvas.getBoundingClientRect();
		const actualWidth = rect.width || width;
		const actualHeight = Math.max(
			rect.height || height,
			showStats ? 100 : height,
		);

		// Create weapon sprite
		const weaponSprite = new WeaponSprite(weapon.id);
		const sprite = new PIXI.Container();
		app.stage.addChild(sprite);
		await weaponSprite.init();
		weaponSprite.appendTo(sprite);

		if (direction && !isEqual(direction, zeroPoint())) {
			weaponSprite.aim(direction);
		}

		// Scale weapon to fit container while maintaining aspect ratio
		if (showStats) {
			sprite.scale = 0.8 * scale;
		} else {
			sprite.scale = scale;
		}

		// Position after scaling for proper centering, with slight adjustment to right and up
		sprite.x = actualWidth / 2;
		sprite.y = actualHeight / 2;
	};

	// Helper function to render stats summary
	const renderStatsSummary = () => {
		const stats = weapon.statsBonus;
		const statEntries = Object.entries(stats).filter(
			([_, value]) => value !== undefined && value !== 0,
		);

		return (
			<div className="flex flex-col justify-center p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex-1 min-w-0">
				<div className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100 truncate">
					{weapon.name}
				</div>
				{statEntries.length > 0 ? (
					<div className="space-y-1">
						{statEntries.slice(0, 4).map(([key, value]) => (
							<div key={key} className="flex justify-between text-xs">
								<span className="text-gray-600 dark:text-gray-300 capitalize truncate mr-2">
									{key.replace(/([A-Z])/g, " $1").trim()}:
								</span>
								<span
									className={`font-medium flex-shrink-0 ${
										(value as number) > 0
											? "text-green-600 dark:text-green-400"
											: "text-red-600 dark:text-red-400"
									}`}
								>
									{(value as number) > 0 ? "+" : ""}
									{value}
								</span>
							</div>
						))}
						{statEntries.length > 4 && (
							<div className="text-xs text-gray-500 dark:text-gray-400">
								+{statEntries.length - 4} more...
							</div>
						)}
					</div>
				) : (
					<div className="text-xs text-gray-500 dark:text-gray-400">
						No bonuses
					</div>
				)}
				<div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 text-xs">
					<div className="flex justify-between">
						<span className="text-gray-600 dark:text-gray-300">
							Shot Speed:
						</span>
						<span className="font-medium text-gray-900 dark:text-gray-100">
							{weapon.shotSpeed}
						</span>
					</div>
				</div>
			</div>
		);
	};

	if (showStats) {
		return (
			<div
				className={`flex rounded-lg overflow-hidden min-h-[100px] max-w-full ${className || ""}`}
				style={{
					border: `2px solid ${getRarityBorderColor(rarity)}`,
					boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
					maxWidth: Math.max(width * 2.5, 400), // Ensure reasonable max width
				}}
			>
				<div className="flex-shrink-0" style={{ width: Math.min(width, 150) }}>
					<PixiApp
						width={Math.min(width, 150)}
						height={Math.max(height, 100)}
						backgroundColor={rarityBackgrounds[rarity]}
						className="w-full h-full flex items-center justify-center"
						onInit={onInit}
						dependencies={[weapon.id, rarity, width, height, scale]}
					/>
				</div>
				{renderStatsSummary()}
			</div>
		);
	}

	return (
		<PixiApp
			width={width}
			height={height}
			backgroundColor={rarityBackgrounds[rarity]}
			className={`flex rounded-lg overflow-hidden ${className || ""}`}
			style={{
				border: `2px solid ${getRarityBorderColor(rarity)}`,
				boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
			}}
			onInit={onInit}
			dependencies={[weapon.id, rarity, width, height, scale]}
		/>
	);
}

export type WeaponStateDisplayProps = {
	weaponState: WeaponState;
	rarity?: WeaponRarity;
	width?: number;
	height?: number;
	className?: string;
	direction?: Direction;
};

export function WeaponStateDisplay({
	weaponState,
	rarity = "common",
	width = 150,
	height = 100,
	className,
	direction,
}: WeaponStateDisplayProps) {
	const weapon = fromWeaponState(weaponState);
	return (
		<WeaponDisplay
			weapon={weapon}
			rarity={rarity}
			width={width}
			height={height}
			className={className}
			direction={direction}
		/>
	);
}

function getRarityBorderColor(rarity: WeaponRarity): string {
	const colors: Record<WeaponRarity, string> = {
		common: "#666666",
		uncommon: "#3A7BC8",
		rare: "#5AA02C",
		exceptional: "#CC7A00",
		legendary: "#7B1FA2",
	};
	return colors[rarity];
}
