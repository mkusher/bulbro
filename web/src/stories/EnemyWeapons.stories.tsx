import { weapons as weaponSprites } from "../weapon/sprites/WeaponSprite";
import {
	WeaponDisplay,
	type WeaponRarity,
} from "../weapon/WeaponDisplay";
import { WeaponStats } from "../weapon/WeaponStats";
import { WeaponTitle } from "../weapon/WeaponTitle";
import { enemyWeapons } from "../weapons-definitions";

export default {
	title:
		"Weapons/Enemy Weapons",
};

export const EnemyWeaponGallery =
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
							Enemy
							Weapons
							(
							{
								enemyWeapons.length
							}{" "}
							total)
						</h2>
						<p
							style={{
								color:
									"#666",
								marginBottom:
									"10px",
							}}
						>
							These
							weapons
							are
							used
							by
							enemies
							and
							cannot
							be
							obtained
							by
							players.
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
							{enemyWeapons.map(
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

export const EnemyWeaponsByAvailability =
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

				const weaponsWithSprites =
					enemyWeapons.filter(
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
					enemyWeapons.filter(
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
						{weaponsWithSprites.length >
							0 && (
							<div>
								<h2>
									Enemy
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
						)}

						{weaponsWithoutSprites.length >
							0 && (
							<div>
								<h2>
									Enemy
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
									enemy
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
