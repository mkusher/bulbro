import { useState } from "preact/hooks";
import { WeaponSelector } from "../ui/WeaponSelector";
import type { Weapon } from "../weapon";
import { weapons as weaponSprites } from "../weapon/sprites/WeaponSprite";
import {
	WeaponDisplay,
	type WeaponRarity,
} from "../weapon/WeaponDisplay";
import { WeaponStats } from "../weapon/WeaponStats";
import { WeaponTitle } from "../weapon/WeaponTitle";
import { weapons as weaponDefinitions } from "../weapons-definitions";

export default {
	title:
		"Weapons/Weapons",
};

export const WeaponGallery =
	{
		render:
			() => {
				const rarities: WeaponRarity[] =
					[
						"common",
						"uncommon",
						"rare",
						"exceptional",
						"legendary",
					];

				return (
					<div
						style={{
							padding:
								"20px",
							display:
								"flex",
							flexDirection:
								"column",
							gap: "20px",
						}}
					>
						<h2>
							All
							Weapons
							(
							{
								weaponDefinitions.length
							}{" "}
							total)
						</h2>
						<div
							style={{
								display:
									"grid",
								gridTemplateColumns:
									"repeat(auto-fit, minmax(300px, 1fr))",
								gap: "20px",
							}}
						>
							{weaponDefinitions.map(
								(
									weapon,
									index,
								) => {
									const rarity =
										rarities[
											index %
												rarities.length
										];
									return (
										<div
											key={
												weapon.id
											}
											style={{
												display:
													"flex",
												flexDirection:
													"column",
												gap: "10px",
											}}
										>
											<WeaponTitle
												weapon={
													weapon
												}
												rarity={
													rarity
												}
											/>
											<WeaponDisplay
												weapon={
													weapon
												}
												rarity={
													rarity
												}
												width={
													200
												}
												height={
													120
												}
											/>
											<WeaponStats
												weapon={
													weapon
												}
											/>
										</div>
									);
								},
							)}
						</div>
					</div>
				);
			},
	};

export const WeaponDisplayShowcase =
	{
		render:
			(
				args: any,
			) => {
				const weapon =
					weaponDefinitions.find(
						(
							w,
						) =>
							w.id ===
							args.weaponType,
					);
				const direction =
					{
						x: args.aimingDirectionX,
						y: args.aimingDirectionY,
					};
				if (
					!weapon
				)
					return (
						<div>
							Weapon
							not
							found
						</div>
					);

				const rarities: WeaponRarity[] =
					[
						"common",
						"uncommon",
						"rare",
						"exceptional",
						"legendary",
					];

				return (
					<div
						style={{
							padding:
								"20px",
							display:
								"flex",
							flexDirection:
								"column",
							gap: "20px",
						}}
					>
						<h2>
							Weapon
							Display
							Component
						</h2>
						<div
							style={{
								display:
									"flex",
								flexDirection:
									"column",
								gap: "10px",
								maxWidth:
									"400px",
							}}
						>
							{rarities.map(
								(
									rarity,
								) => (
									<div
										key={
											rarity
										}
										style={{
											display:
												"flex",
											flexDirection:
												"column",
											gap: "10px",
										}}
									>
										<WeaponTitle
											weapon={
												weapon
											}
											rarity={
												rarity
											}
										/>
										<WeaponDisplay
											weapon={
												weapon
											}
											rarity={
												rarity
											}
											width={
												200
											}
											height={
												120
											}
											direction={
												direction
											}
										/>
									</div>
								),
							)}
						</div>
					</div>
				);
			},
		args: {
			weaponType:
				"pistol",
			aimingDirectionX: 1,
			aimingDirectionY: 1,
		},
		argTypes:
			{
				weaponType:
					{
						options:
							weaponDefinitions.map(
								(
									w,
								) =>
									w.id,
							),
						control:
							{
								type: "select",
							},
					},
				aimingDirectionX:
					{
						control:
							{
								type: "number",
							},
					},
				aimingDirectionY:
					{
						control:
							{
								type: "number",
							},
					},
			},
	};

export const WeaponStatsShowcase =
	{
		render:
			(
				args: any,
			) => {
				const weapon =
					weaponDefinitions.find(
						(
							w,
						) =>
							w.id ===
							args.weaponType,
					);
				if (
					!weapon
				)
					return (
						<div>
							Weapon
							not
							found
						</div>
					);

				return (
					<div
						style={{
							padding:
								"20px",
							display:
								"flex",
							flexDirection:
								"column",
							gap: "20px",
						}}
					>
						<h2>
							Weapon
							Stats
							Component
						</h2>
						<div
							style={{
								display:
									"flex",
								flexDirection:
									"column",
								gap: "20px",
							}}
						>
							<WeaponTitle
								weapon={
									weapon
								}
								rarity={
									args.rarity
								}
							/>
							<div
								style={{
									display:
										"flex",
									gap: "20px",
								}}
							>
								<div
									style={{
										flex: 1,
									}}
								>
									<WeaponDisplay
										weapon={
											weapon
										}
										rarity={
											args.rarity
										}
										width={
											250
										}
										height={
											150
										}
									/>
								</div>
								<div
									style={{
										flex: 1,
									}}
								>
									<WeaponStats
										weapon={
											weapon
										}
									/>
								</div>
							</div>
						</div>
					</div>
				);
			},
		args: {
			weaponType:
				"pistol",
			rarity:
				"rare",
		},
		argTypes:
			{
				weaponType:
					{
						options:
							weaponDefinitions.map(
								(
									w,
								) =>
									w.id,
							),
						control:
							{
								type: "select",
							},
					},
				rarity:
					{
						options:
							[
								"common",
								"uncommon",
								"rare",
								"exceptional",
								"legendary",
							],
						control:
							{
								type: "select",
							},
					},
			},
	};

export const WeaponsByAvailability =
	{
		render:
			() => {
				const rarities: WeaponRarity[] =
					[
						"common",
						"uncommon",
						"rare",
						"exceptional",
						"legendary",
					];

				// Separate weapons into those with sprites vs those without
				const weaponsWithSprites =
					weaponDefinitions.filter(
						(
							weapon,
						) => {
							const spriteConfig =
								weaponSprites[
									weapon
										.id
								];
							return (
								spriteConfig &&
								spriteConfig
									.size
									.width >
									0
							);
						},
					);

				const weaponsWithoutSprites =
					weaponDefinitions.filter(
						(
							weapon,
						) => {
							const spriteConfig =
								weaponSprites[
									weapon
										.id
								];
							return (
								!spriteConfig ||
								spriteConfig
									.size
									.width ===
									0
							);
						},
					);

				return (
					<div
						style={{
							padding:
								"20px",
							display:
								"flex",
							flexDirection:
								"column",
							gap: "30px",
						}}
					>
						<div>
							<h2>
								Weapons
								with
								Visual
								Sprites
								(
								{
									weaponsWithSprites.length
								}
								)
							</h2>
							<div
								style={{
									display:
										"grid",
									gridTemplateColumns:
										"repeat(auto-fit, minmax(300px, 1fr))",
									gap: "20px",
									marginTop:
										"20px",
								}}
							>
								{weaponsWithSprites.map(
									(
										weapon,
										index,
									) => {
										const rarity =
											rarities[
												index %
													rarities.length
											];
										return (
											<div
												key={
													weapon.id
												}
												style={{
													display:
														"flex",
													flexDirection:
														"column",
													gap: "10px",
												}}
											>
												<WeaponTitle
													weapon={
														weapon
													}
													rarity={
														rarity
													}
												/>
												<WeaponDisplay
													weapon={
														weapon
													}
													rarity={
														rarity
													}
													width={
														200
													}
													height={
														120
													}
												/>
												<WeaponStats
													weapon={
														weapon
													}
												/>
											</div>
										);
									},
								)}
							</div>
						</div>

						{weaponsWithoutSprites.length >
							0 && (
							<div>
								<h2>
									Weapons
									without
									Visual
									Sprites
									(
									{
										weaponsWithoutSprites.length
									}
									)
								</h2>
								<p
									style={{
										color:
											"#666",
										marginBottom:
											"20px",
									}}
								>
									These
									weapons
									are
									defined
									but
									don't
									have
									visual
									sprites
									yet.
								</p>
								<div
									style={{
										display:
											"grid",
										gridTemplateColumns:
											"repeat(auto-fit, minmax(300px, 1fr))",
										gap: "20px",
									}}
								>
									{weaponsWithoutSprites.map(
										(
											weapon,
											index,
										) => {
											const rarity =
												rarities[
													index %
														rarities.length
												];
											return (
												<div
													key={
														weapon.id
													}
													style={{
														display:
															"flex",
														flexDirection:
															"column",
														gap: "10px",
													}}
												>
													<WeaponTitle
														weapon={
															weapon
														}
														rarity={
															rarity
														}
													/>
													<div
														style={{
															width:
																"200px",
															height:
																"120px",
															border:
																"2px dashed #666",
															borderRadius:
																"8px",
															display:
																"flex",
															alignItems:
																"center",
															justifyContent:
																"center",
															color:
																"#666",
															fontSize:
																"14px",
														}}
													>
														No
														Sprite
														Available
													</div>
													<WeaponStats
														weapon={
															weapon
														}
													/>
												</div>
											);
										},
									)}
								</div>
							</div>
						)}
					</div>
				);
			},
	};

export const WeaponSelectorShowcase =
	{
		render:
			(
				args: any,
			) => {
				const [
					selectedWeapon,
					setSelectedWeapon,
				] =
					useState<Weapon | null>(
						null,
					);

				// Filter weapons based on args
				let availableWeapons: Weapon[] =
					[
						...weaponDefinitions,
					];

				if (
					args.onlyWithSprites
				) {
					availableWeapons =
						weaponDefinitions.filter(
							(
								weapon,
							) => {
								const spriteConfig =
									weaponSprites[
										weapon
											.id
									];
								return (
									spriteConfig &&
									spriteConfig
										.size
										.width >
										0
								);
							},
						);
				}

				if (
					args.maxWeapons &&
					args.maxWeapons <
						availableWeapons.length
				) {
					availableWeapons =
						availableWeapons.slice(
							0,
							args.maxWeapons,
						);
				}

				return (
					<div
						style={{
							padding:
								"20px",
							minHeight:
								"600px",
							background:
								args.darkMode
									? "#1a1a1a"
									: "#f5f5f5",
							borderRadius:
								"8px",
						}}
					>
						<h2
							style={{
								color:
									args.darkMode
										? "#fff"
										: "#000",
							}}
						>
							Weapon
							Selector
							Component
						</h2>
						<p
							style={{
								color:
									args.darkMode
										? "#ccc"
										: "#666",
								marginBottom:
									"20px",
								fontSize:
									"14px",
							}}
						>
							Selected:{" "}
							{selectedWeapon?.name ||
								"None"}{" "}
							|
							Available:{" "}
							{
								availableWeapons.length
							}{" "}
							weapons
						</p>

						<WeaponSelector
							availableWeapons={
								availableWeapons
							}
							selectedWeapon={
								selectedWeapon
							}
							onChange={
								setSelectedWeapon
							}
							allowDeselect={
								args.allowDeselect
							}
						/>
					</div>
				);
			},
		args: {
			allowDeselect: true,
			onlyWithSprites: true,
			maxWeapons: 12,
			darkMode: false,
		},
		argTypes:
			{
				allowDeselect:
					{
						control:
							{
								type: "boolean",
							},
						description:
							"Allow deselecting the current weapon by clicking it again",
					},
				onlyWithSprites:
					{
						control:
							{
								type: "boolean",
							},
						description:
							"Only show weapons that have visual sprites",
					},
				maxWeapons:
					{
						control:
							{
								type: "number",
								min: 1,
								max: weaponDefinitions.length,
							},
						description:
							"Maximum number of weapons to show",
					},
				darkMode:
					{
						control:
							{
								type: "boolean",
							},
						description:
							"Toggle dark mode background",
					},
			},
	};

export const WeaponSelectorCompact =
	{
		render:
			() => {
				const [
					selectedWeapon,
					setSelectedWeapon,
				] =
					useState<Weapon | null>(
						null,
					);

				// Show only first 6 weapons with sprites for compact demo
				const compactWeapons =
					weaponDefinitions
						.filter(
							(
								weapon,
							) => {
								const spriteConfig =
									weaponSprites[
										weapon
											.id
									];
								return (
									spriteConfig &&
									spriteConfig
										.size
										.width >
										0
								);
							},
						)
						.slice(
							0,
							6,
						);

				return (
					<div
						style={{
							padding:
								"20px",
							maxWidth:
								"800px",
							margin:
								"0 auto",
						}}
					>
						<h2>
							Compact
							Weapon
							Selector
						</h2>
						<p
							style={{
								color:
									"#666",
								marginBottom:
									"20px",
								fontSize:
									"14px",
							}}
						>
							Showing{" "}
							{
								compactWeapons.length
							}{" "}
							weapons
							in
							a
							compact
							layout
						</p>

						<WeaponSelector
							availableWeapons={
								compactWeapons
							}
							selectedWeapon={
								selectedWeapon
							}
							onChange={
								setSelectedWeapon
							}
							allowDeselect={
								false
							}
						/>
					</div>
				);
			},
	};
