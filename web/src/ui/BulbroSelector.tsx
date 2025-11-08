import type { Bulbro } from "../bulbro";
import { BulbroCard } from "../bulbro/BulbroDisplay";
import { BulbroStats } from "../bulbro/BulbroStats";
import { bulbros } from "../characters-definitions";
import { BulbroThumbnail } from "./BulbroThumbnail";
import { WithContainerWidth } from "./WithContainerWidth";

type BulbroSelectorProps =
	{
		selectedBulbro: Bulbro;
		onChange: (
			bulbro: Bulbro,
		) => void;
	};

export function BulbroSelector({
	selectedBulbro,
	onChange,
}: BulbroSelectorProps) {
	const displayedBulbro =
		selectedBulbro;

	return (
		<div className="flex flex-col lg:flex-row gap-4 w-full max-w-6xl mx-auto">
			{/* Thumbnail Grid */}
			<div className="flex flex-col">
				<h3 className="text-lg font-semibold mb-3 text-center lg:text-left">
					Select
					Character
				</h3>
				<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-3 xl:grid-cols-4 gap-2">
					{bulbros.map(
						(
							bulbro,
						) => (
							<BulbroThumbnailIcon
								key={
									bulbro.id
								}
								bulbro={
									bulbro
								}
								isSelected={
									bulbro.id ===
									selectedBulbro.id
								}
								onSelect={() =>
									onChange(
										bulbro,
									)
								}
							/>
						),
					)}
				</div>
			</div>

			{/* Detailed View */}
			<div className="flex-1 min-w-0">
				<h3 className="text-lg font-semibold mb-3 text-center lg:text-left">
					{
						displayedBulbro.name
					}
				</h3>
				<div className="flex flex-col md:flex-row gap-4">
					{/* Large Display */}
					<div className="flex-shrink-0">
						<WithContainerWidth>
							{({
								width,
								height,
							}) => (
								<BulbroCard
									bulbro={
										displayedBulbro
									}
									showDetails={
										false
									}
									displayWidth={Math.min(
										width,
										300,
									)}
									displayHeight={Math.max(
										height,
										200,
									)}
									className="ring-2 ring-primary shadow-lg"
								/>
							)}
						</WithContainerWidth>
					</div>

					{/* Stats and Info */}
					<div className="flex-1 space-y-4">
						<BulbroStats
							bulbro={
								displayedBulbro
							}
						/>

						{/* Weapons */}
						<div>
							<h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
								Default
								Weapons
							</h4>
							<div className="flex flex-wrap gap-2">
								{displayedBulbro.defaultWeapons.map(
									(
										weapon,
									) => (
										<span
											key={
												weapon.id
											}
											className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium"
										>
											{
												weapon.name
											}
										</span>
									),
								)}
							</div>
						</div>

						{/* Available Weapons */}
						{displayedBulbro
							.availableWeapons
							.length >
							displayedBulbro
								.defaultWeapons
								.length && (
							<div>
								<h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
									Available
									Weapons
								</h4>
								<div className="flex flex-wrap gap-1">
									{displayedBulbro.availableWeapons
										.filter(
											(
												weapon,
											) =>
												!displayedBulbro.defaultWeapons.some(
													(
														dw,
													) =>
														dw.id ===
														weapon.id,
												),
										)
										.map(
											(
												weapon,
											) => (
												<span
													key={
														weapon.id
													}
													className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs"
												>
													{
														weapon.name
													}
												</span>
											),
										)}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

type BulbroThumbnailIconProps =
	{
		bulbro: Bulbro;
		isSelected: boolean;
		onSelect: () => void;
	};

function BulbroThumbnailIcon({
	bulbro,
	isSelected,
	onSelect,
}: BulbroThumbnailIconProps) {
	const baseClasses =
		"relative w-16 h-16 sm:w-20 sm:h-20 cursor-pointer transition-all duration-200 rounded-lg overflow-hidden border-2";

	const stateClasses =
		isSelected
			? "border-blue-500 ring-2 ring-blue-300 shadow-lg scale-105"
			: "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500";

	return (
		<div
			className={`${baseClasses} ${stateClasses}`}
			onClick={
				onSelect
			}
			title={
				bulbro.name
			}
		>
			<BulbroThumbnail
				bulbro={
					bulbro
				}
				width={
					80
				}
				height={
					80
				}
				className="w-full h-full"
			/>

			{/* Selection Indicator */}
			{isSelected && (
				<div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-bl-lg">
					<div className="absolute top-0.5 right-0.5 w-2 h-2 bg-white rounded-full opacity-90"></div>
				</div>
			)}

			{/* Name Label */}
			<div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 truncate">
				{
					bulbro.name
				}
			</div>
		</div>
	);
}
