import type { Weapon } from "../weapon";
import { WeaponDisplay } from "../weapon/WeaponDisplay";
import { WeaponStats } from "../weapon/WeaponStats";
import { WeaponTitle } from "../weapon/WeaponTitle";
import type { Direction } from "@/geometry";

type WeaponSelectorProps = {
	availableWeapons: Weapon[];
	selectedWeapon: Weapon | null;
	onChange: (weapon: Weapon | null) => void;
	allowDeselect?: boolean;
};

export function WeaponSelector({
	availableWeapons,
	selectedWeapon,
	onChange,
	allowDeselect = true,
}: WeaponSelectorProps) {
	const displayedWeapon = selectedWeapon;

	const handleWeaponSelect = (weapon: Weapon) => {
		if (selectedWeapon?.id === weapon.id && allowDeselect) {
			onChange(null); // Deselect if clicking the same weapon and deselect is allowed
		} else {
			onChange(weapon);
		}
	};

	return (
		<div className="flex flex-col lg:flex-row gap-4 w-full max-w-6xl mx-auto">
			{/* Thumbnail Grid */}
			<div className="flex flex-col">
				<h3 className="text-lg font-semibold mb-3 text-center lg:text-left">
					Select Weapon
					{allowDeselect && (
						<span className="text-sm text-gray-500 ml-2">
							(click to deselect)
						</span>
					)}
				</h3>
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3 gap-2">
					{availableWeapons.map((weapon) => (
						<WeaponThumbnail
							key={weapon.id}
							weapon={weapon}
							isSelected={weapon.id === selectedWeapon?.id}
							onSelect={() => handleWeaponSelect(weapon)}
						/>
					))}
				</div>
			</div>

			{/* Detailed View */}
			{displayedWeapon && (
				<div className="flex-1 min-w-0">
					<div className="mb-3">
						<WeaponTitle weapon={displayedWeapon} rarity="common" />
					</div>

					<div className="flex flex-col xl:flex-row gap-4">
						{/* Large Display */}
						<div className="flex-shrink-0 w-32 h-24 mx-auto xl:mx-0">
							<WeaponDisplay
								weapon={displayedWeapon}
								rarity="common"
								width={128}
								height={96}
								className="ring-2 ring-primary shadow-lg w-full h-full object-contain"
							/>
						</div>

						{/* Stats and Info */}
						<div className="flex-1 min-w-0 space-y-4">
							<WeaponStats weapon={displayedWeapon} />

							{/* Weapon Classes */}
							<div>
								<h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
									Weapon Classes
								</h4>
								<div className="flex flex-wrap gap-2">
									{displayedWeapon.classes.map((weaponClass) => (
										<span
											key={weaponClass}
											className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs font-medium capitalize"
										>
											{weaponClass}
										</span>
									))}
								</div>
							</div>

							{/* Weapon Details */}
							<div>
								<h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
									Details
								</h4>
								<div className="space-y-1 text-sm">
									<div className="flex justify-between">
										<span className="text-gray-600 dark:text-gray-400">
											Shot Speed:
										</span>
										<span className="font-medium">
											{displayedWeapon.shotSpeed}ms
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600 dark:text-gray-400">
											Type:
										</span>
										<span className="font-medium capitalize">
											{displayedWeapon.id}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* No Selection State */}
			{!displayedWeapon && (
				<div className="flex-1 min-w-0 flex items-center justify-center">
					<div className="text-center text-gray-500">
						<div className="text-6xl mb-4">⚔️</div>
						<h3 className="text-lg font-semibold mb-2">No Weapon Selected</h3>
						<p className="text-sm">
							Choose a weapon from the grid to see details
						</p>
					</div>
				</div>
			)}
		</div>
	);
}

type WeaponThumbnailProps = {
	weapon: Weapon;
	isSelected: boolean;
	direction?: Direction;
	onSelect: () => void;
};

function WeaponThumbnail({
	weapon,
	isSelected,
	direction,
	onSelect,
}: WeaponThumbnailProps) {
	const baseClasses =
		"relative w-20 h-16 sm:w-24 sm:h-20 cursor-pointer transition-all duration-200 rounded-lg overflow-hidden border-2";

	const stateClasses = isSelected
		? "border-blue-500 ring-2 ring-blue-300 shadow-lg scale-105"
		: "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500";

	return (
		<div
			className={`${baseClasses} ${stateClasses}`}
			onClick={onSelect}
			title={weapon.name}
		>
			<WeaponDisplay
				weapon={weapon}
				rarity="common"
				width={96}
				height={80}
				className="w-full h-full"
				scale={0.25}
				direction={direction}
			/>

			{/* Selection Indicator */}
			{isSelected && (
				<div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-bl-lg">
					<div className="absolute top-0.5 right-0.5 w-2 h-2 bg-white rounded-full opacity-90"></div>
				</div>
			)}

			{/* Name Label */}
			<div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 truncate">
				{weapon.name}
			</div>
		</div>
	);
}
