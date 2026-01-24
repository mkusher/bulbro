import { BulbroCard } from "@/bulbro/BulbroCard";
import type { Bulbro } from "@/bulbro/BulbroCharacter";
import {
	PrevWaveStats,
	type WaveStats,
} from "@/shop/PrevWaveStats";
import {
	Shop,
	type ShopItem,
} from "@/shop/Shop";
import { WeaponSlots } from "@/shop/WeaponSlots";
import { Button } from "@/ui/shadcn/button";
import type { Weapon } from "@/weapon";

/**
 * Props for a single player section in the layout.
 */
export interface PreRoundPlayerProps {
	bulbro: Bulbro;
	weapons: Weapon[];
	materials: number;
	maxWeaponSlots?: number;
	onWeaponClick?: (
		weapon: Weapon,
		index: number,
	) => void;
}

/**
 * Props for the PreRoundLayout component.
 * This is a pure presentation component with no internal state.
 */
export interface PreRoundLayoutProps {
	/** Current wave number (next wave will be this + 1) */
	currentWave: number;
	/** Player data to display */
	player: PreRoundPlayerProps;
	/** Shop items available for purchase */
	shopItems: ShopItem[];
	/** Stats from the previous wave */
	prevWaveStats?: WaveStats;
	/** Callback when a shop item is purchased */
	onPurchase?: (
		item: ShopItem,
	) => void;
	/** Callback when the start wave button is clicked */
	onStartWave?: () => void;
}

/**
 * Pure layout component for the pre-round screen.
 * Contains no internal state - all data and callbacks are passed via props.
 * Use this component in Storybook to preview the full shop layout.
 */
export function PreRoundLayout({
	currentWave,
	player,
	shopItems,
	prevWaveStats,
	onPurchase,
	onStartWave,
}: PreRoundLayoutProps) {
	const nextWave =
		currentWave +
		1;

	return (
		<div className="p-4 max-w-6xl mx-auto">
			<div className="flex flex-col gap-3">
				{/* Header */}
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-1">
						Prepare
						for
						Wave{" "}
						{
							nextWave
						}
					</h1>
					<p className="text-sm text-muted-foreground">
						Materials:{" "}
						{
							player.materials
						}
					</p>
				</div>

				{/* Previous Wave Stats */}
				{prevWaveStats && (
					<PrevWaveStats
						stats={
							prevWaveStats
						}
					/>
				)}

				{/* Two column layout for Bulbro and Weapon Slots */}
				<div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-3">
					{/* Bulbro Description */}
					<div className="overflow-visible">
						<BulbroCard
							bulbro={
								player.bulbro
							}
							showDetails={
								true
							}
							displayWidth={
								80
							}
							displayHeight={
								80
							}
							responsive={
								false
							}
						/>
					</div>

					{/* Weapon Slots */}
					<div>
						<WeaponSlots
							weapons={
								player.weapons
							}
							maxSlots={
								player.maxWeaponSlots ??
								6
							}
							onWeaponClick={
								player.onWeaponClick
							}
						/>
					</div>
				</div>

				{/* Shop */}
				<Shop
					items={
						shopItems
					}
					availableMaterials={
						player.materials
					}
					onPurchase={
						onPurchase
					}
				/>

				{/* Start Wave Button */}
				<div className="flex justify-center">
					<Button
						className="w-full max-w-md"
						onClick={
							onStartWave
						}
					>
						Start
						Wave{" "}
						{
							nextWave
						}
					</Button>
				</div>
			</div>
		</div>
	);
}
