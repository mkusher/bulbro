import { EnemyDisplay } from "@/enemy/EnemyDisplay";
import { allEnemies } from "../enemies-definitions";

export default {
	title:
		"Enemies/EnemyGallery",
};

export const EnemyGallery =
	{
		render:
			() => {
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
							Enemies
							(
							{
								allEnemies.length
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
							{allEnemies.map(
								(
									enemy,
								) => (
									<div
										key={
											enemy.id
										}
										style={{
											display:
												"flex",
											flexDirection:
												"column",
											gap: "10px",
											background:
												"#1a1a1a",
											borderRadius:
												"8px",
											padding:
												"16px",
										}}
									>
										<h3
											style={{
												margin: 0,
												color:
													"#fff",
											}}
										>
											{
												enemy.name
											}
										</h3>
										<EnemyDisplay
											enemy={
												enemy
											}
											width={
												200
											}
											height={
												150
											}
										/>
										<div
											style={{
												color:
													"#ccc",
												fontSize:
													"13px",
												display:
													"flex",
												flexDirection:
													"column",
												gap: "4px",
											}}
										>
											<div>
												<strong>
													HP:
												</strong>{" "}
												{
													enemy
														.stats
														.maxHp
												}
											</div>
											<div>
												<strong>
													Speed:
												</strong>{" "}
												{
													enemy
														.stats
														.speed
												}
											</div>
											<div>
												<strong>
													Damage:
												</strong>{" "}
												{
													enemy
														.stats
														.damage
												}
											</div>
											<div>
												<strong>
													Range:
												</strong>{" "}
												{
													enemy
														.stats
														.range
												}
											</div>
											<div>
												<strong>
													Attack
													Speed:
												</strong>{" "}
												{
													enemy
														.stats
														.attackSpeed
												}
											</div>
											<div>
												<strong>
													Armor:
												</strong>{" "}
												{
													enemy
														.stats
														.armor
												}
											</div>
											{enemy.behaviors && (
												<div>
													<span
														style={{
															background:
																"#3b82f6",
															color:
																"#fff",
															padding:
																"2px 8px",
															borderRadius:
																"4px",
															fontSize:
																"12px",
														}}
													>
														{
															enemy.behaviors
														}
													</span>
												</div>
											)}
											<div>
												<strong>
													Weapons:
												</strong>{" "}
												{enemy.weapons
													.map(
														(
															w,
														) =>
															w.name,
													)
													.join(
														", ",
													)}
											</div>
										</div>
									</div>
								),
							)}
						</div>
					</div>
				);
			},
	};
