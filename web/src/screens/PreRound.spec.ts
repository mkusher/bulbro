import {
	afterEach,
	beforeEach,
	expect,
	it,
	mock,
	spyOn,
} from "bun:test";
import { signal } from "@preact/signals";
import {
	h,
	render,
} from "preact";
import { BulbroState } from "@/bulbro/BulbroState";
import { getTotalExperienceForLevel } from "@/bulbro/Levels";
import { wellRoundedBulbro } from "@/characters-definitions";
import { classicMapSize } from "@/game-canvas";
import {
	currentLobby,
	currentNetworkGame,
} from "@/network/currentLobby";
import { currentUser } from "@/network/currentUser";
import { isItemShopItem } from "@/shop/Shop";
import { generateShopItems } from "@/shop/ShopItemsGenerator";
import {
	createInitialState,
	waveState,
} from "@/waveState";
import { getWeaponByType } from "@/weapon";
import {
	toWeaponStateAtTier,
	weaponStatsForTier,
} from "@/weapon/WeaponTiers";

// happy-dom has neither WebAudio nor WebGL
mock.module(
	"@/audio/useStartBgm",
	() => ({
		useStartBgm:
			() => {},
	}),
);
mock.module(
	"@/ui/PixiApp",
	() => ({
		PixiApp:
			() =>
				null,
	}),
);

const {
	PreRound,
} =
	await import(
		"./PreRound"
	);

let root: HTMLElement;

function startPreRound(
	levelsGained: number,
	playersCount = 1,
) {
	const state =
		createInitialState(
			Array.from(
				{
					length:
						playersCount,
				},
				(
					_,
					i,
				) => ({
					id: `player-${i + 1}`,
					bulbro:
						wellRoundedBulbro,
				}),
			) as Parameters<
				typeof createInitialState
			>[0],
			classicMapSize,
			0,
		);
	waveState.value =
		{
			...state,
			players:
				state.players.map(
					(
						p,
					) =>
						p.gainMaterials(
							getTotalExperienceForLevel(
								levelsGained,
							),
						),
				),
			round:
				{
					...state.round,
					isRunning: false,
				},
		};
	render(
		h(
			PreRound,
			{},
		),
		root,
	);
}

function upgradeButtons() {
	return [
		...root.querySelectorAll(
			"button",
		),
	].filter(
		(
			b,
		) =>
			b.textContent ===
			"Choose",
	);
}

async function flush() {
	await new Promise(
		(
			resolve,
		) =>
			setTimeout(
				resolve,
				0,
			),
	);
}

beforeEach(
	() => {
		root =
			document.createElement(
				"div",
			);
		document.body.appendChild(
			root,
		);
	},
);

afterEach(
	() => {
		render(
			null,
			root,
		);
		root.remove();
	},
);

it("shows the shop without level-ups", () => {
	startPreRound(
		0,
	);
	expect(
		root.textContent,
	).toContain(
		"Prepare",
	);
	expect(
		upgradeButtons(),
	).toHaveLength(
		0,
	);
});

it("shows level-ups one at a time before the shop", async () => {
	startPreRound(
		2,
	);
	expect(
		root.textContent,
	).toContain(
		"Level 1!",
	);
	expect(
		root.textContent,
	).not.toContain(
		"Prepare",
	);
	expect(
		upgradeButtons(),
	).toHaveLength(
		4,
	);

	upgradeButtons()[0]!.click();
	await flush();
	expect(
		root.textContent,
	).toContain(
		"Level 2!",
	);
	expect(
		upgradeButtons(),
	).toHaveLength(
		4,
	);
	expect(
		waveState
			.value
			.players[0]!
			.pendingLevelUps,
	).toBe(
		1,
	);

	upgradeButtons()[0]!.click();
	await flush();
	expect(
		upgradeButtons(),
	).toHaveLength(
		0,
	);
	expect(
		root.textContent,
	).toContain(
		"Prepare",
	);
	expect(
		waveState.value.players[0]!.statSources.filter(
			(
				s,
			) =>
				s.kind ===
				"upgrade",
		),
	).toHaveLength(
		2,
	);
});

it("lets every local co-op player pick their level-ups", async () => {
	startPreRound(
		1,
		2,
	);
	expect(
		root.textContent,
	).toContain(
		"P1:",
	);

	upgradeButtons()[0]!.click();
	await flush();
	expect(
		root.textContent,
	).toContain(
		"P2:",
	);

	upgradeButtons()[0]!.click();
	await flush();
	expect(
		root.textContent,
	).toContain(
		"Prepare",
	);
	expect(
		waveState.value.players.every(
			(
				p,
			) =>
				p.pendingLevelUps ===
				0,
		),
	).toBe(
		true,
	);
});

it("re-rolls the offered upgrades for materials", async () => {
	startPreRound(
		1,
	);
	const offered =
		() =>
			[
				...root.querySelectorAll(
					"p.font-bold",
				),
			]
				.map(
					(
						p,
					) =>
						p.textContent,
				)
				.join();
	const before =
		offered();
	const rerollButton =
		() =>
			[
				...root.querySelectorAll(
					"button",
				),
			].find(
				(
					b,
				) =>
					b.textContent?.startsWith(
						"Re-roll",
					),
			);
	expect(
		rerollButton()
			?.textContent,
	).toBe(
		"Re-roll $1",
	);

	rerollButton()!.click();
	await flush();
	const player =
		waveState
			.value
			.players[0]!;
	expect(
		player.materialsAvailable,
	).toBe(
		getTotalExperienceForLevel(
			1,
		) -
			1,
	);
	expect(
		player.upgradeRerollCount,
	).toBe(
		1,
	);
	expect(
		offered(),
	).not.toBe(
		before,
	);
	expect(
		rerollButton()
			?.textContent,
	).toBe(
		"Re-roll $2",
	);

	upgradeButtons()[0]!.click();
	await flush();
	expect(
		waveState
			.value
			.players[0]!
			.upgradeRerollCount,
	).toBe(
		1,
	);
	expect(
		root.textContent,
	).toContain(
		"Prepare",
	);
});

it("shows only the local player's level-ups with the players panel online", async () => {
	const user =
		currentUser.value;
	currentUser.value =
		{
			id: "player-2",
			username:
				"Bob",
			isGuest: false,
		} as typeof user;
	currentLobby.value =
		{
			players:
				[
					{
						id: "player-1",
						username:
							"Alice",
						status:
							"connected",
					},
					{
						id: "player-2",
						username:
							"Bob",
						status:
							"connected",
					},
				],
		} as never;
	currentNetworkGame.value =
		{
			readyForNextWave:
				signal(
					[
						"player-1",
					],
				),
			markNotReadyForNextWave:
				() => {},
		} as never;
	try {
		startPreRound(
			1,
			2,
		);
		expect(
			root.textContent,
		).toContain(
			"Level 1!",
		);
		expect(
			root.textContent,
		).toContain(
			"Bob (you)",
		);
		expect(
			root.textContent,
		).toContain(
			"Well Rounded · Lv. 1",
		);
		expect(
			root.querySelector(
				'[data-player-id="player-1"]',
			)
				?.textContent,
		).toContain(
			"Ready",
		);

		upgradeButtons()[0]!.click();
		await flush();
		const [
			remote,
			local,
		] =
			waveState
				.value
				.players;
		expect(
			local!
				.pendingLevelUps,
		).toBe(
			0,
		);
		expect(
			remote!
				.pendingLevelUps,
		).toBe(
			1,
		);
		expect(
			root.textContent,
		).toContain(
			"Prepare",
		);
	} finally {
		currentNetworkGame.value =
			null;
		currentLobby.value =
			null;
		currentUser.value =
			user;
	}
});

for (const [
	wave,
	tier,
	full,
] of [
	[
		8,
		4,
		false,
	],
	[
		2,
		2,
		true,
	],
] as const) {
	it(`buys a tier ${tier} weapon${full ? " and combines it at capacity" : ""}`, async () => {
		const random =
			spyOn(
				Math,
				"random",
			).mockReturnValue(
				0,
			);
		try {
			const offer =
				generateShopItems(
					wellRoundedBulbro,
					{
						wave,
						random:
							() =>
								0,
					},
				).find(
					(
						i,
					) =>
						!isItemShopItem(
							i,
						),
				)!;
			if (
				isItemShopItem(
					offer,
				)
			)
				throw new Error(
					"Expected a weapon",
				);
			const definition =
				getWeaponByType(
					offer
						.weapon
						.id,
				);
			const state =
				createInitialState(
					[
						{
							id: "player-1",
							bulbro:
								wellRoundedBulbro,
						},
					],
					classicMapSize,
					0,
				);
			const player =
				new BulbroState(
					{
						...state.players[0]!.toJSON(),
						materialsAvailable: 1000,
					},
				);
			waveState.value =
				{
					...state,
					round:
						{
							...state.round,
							wave,
							isRunning: false,
						},
					players:
						[
							player
								.withStatSource(
									{
										id: "test-capacity",
										kind: "item",
										bonuses:
											{
												maxWeapons:
													full
														? -5
														: 0,
											},
									},
								)
								.useWeapons(
									[
										toWeaponStateAtTier(
											definition,
											tier,
										),
									],
								),
						],
				};
			render(
				h(
					PreRound,
					{},
				),
				root,
			);
			const buy =
				[
					...root.querySelectorAll(
						"button",
					),
				].find(
					(
						b,
					) =>
						b.textContent ===
						"$" +
							offer.price,
				);
			expect(
				buy,
			).toBeDefined();
			expect(
				buy!
					.disabled,
			).toBe(
				false,
			);
			buy!.click();
			await flush();
			const updated =
				waveState
					.value
					.players[0]!;
			expect(
				updated.materialsAvailable,
			).toBe(
				1000 -
					offer.price,
			);
			expect(
				updated.weapons,
			).toHaveLength(
				full
					? 1
					: 2,
			);
			const purchased =
				updated.weapons.at(
					-1,
				)!;
			expect(
				purchased.tier,
			).toBe(
				full
					? 3
					: 4,
			);
			expect(
				purchased.statsBonus,
			).toEqual(
				weaponStatsForTier(
					definition,
					full
						? 3
						: 4,
				),
			);
		} finally {
			random.mockRestore();
		}
	});
}

it("keeps upgrade reroll prices across level-ups, separate from the shop", async () => {
	startPreRound(
		2,
	);
	const reroll =
		() =>
			[
				...root.querySelectorAll(
					"button",
				),
			].find(
				(
					button,
				) =>
					button.textContent?.startsWith(
						"Re-roll",
					),
			)!;
	reroll().click();
	await flush();
	upgradeButtons()[0]!.click();
	await flush();
	expect(
		reroll()
			.textContent,
	).toBe(
		"Re-roll $2",
	);
	upgradeButtons()[0]!.click();
	await flush();
	expect(
		reroll()
			.textContent,
	).toBe(
		"Re-roll $1",
	);
});

it("locks unaffordable offers through rerolls and waves at their original price", async () => {
	startPreRound(
		0,
	);
	const player =
		waveState
			.value
			.players[0]!;
	waveState.value =
		{
			...waveState.value,
			players:
				[
					new BulbroState(
						{
							...player.toJSON(),
							materialsAvailable: 100,
						},
					),
				],
		};
	await flush();
	const lock =
		() =>
			[
				...root.querySelectorAll(
					"button",
				),
			].find(
				(
					button,
				) =>
					button.textContent ===
					"Lock",
			)!;
	lock().click();
	await flush();
	const saved =
		waveState
			.value
			.players[0]!
			.lockedShopOffers;
	expect(
		saved,
	).toHaveLength(
		1,
	);
	const reroll =
		[
			...root.querySelectorAll(
				"button",
			),
		].find(
			(
				button,
			) =>
				button.textContent?.startsWith(
					"Re-roll",
				),
		)!;
	reroll.click();
	await flush();
	expect(
		root.querySelectorAll(
			'[aria-pressed="true"]',
		),
	).toHaveLength(
		1,
	);
	expect(
		waveState
			.value
			.players[0]!
			.lockedShopOffers,
	).toEqual(
		saved,
	);
	render(
		null,
		root,
	);
	const current =
		waveState.value;
	waveState.value =
		{
			...current,
			round:
				{
					...current.round,
					wave: 5,
				},
			players:
				[
					new BulbroState(
						JSON.parse(
							JSON.stringify(
								current.players[0]!.toJSON(),
							),
						),
					),
				],
		};
	render(
		h(
			PreRound,
			{},
		),
		root,
	);
	await flush();
	expect(
		root.querySelectorAll(
			'[aria-pressed="true"]',
		),
	).toHaveLength(
		1,
	);
	const unlock =
		[
			...root.querySelectorAll(
				"button",
			),
		].find(
			(
				button,
			) =>
				button.textContent ===
				"Unlock",
		)!;
	expect(
		unlock.parentElement!
			.textContent,
	).toContain(
		"$" +
			saved[0]!
				.price,
	);
	unlock.click();
	await flush();
	expect(
		waveState
			.value
			.players[0]!
			.lockedShopOffers,
	).toHaveLength(
		0,
	);
});

it("removes a purchased offer from saved locks", async () => {
	startPreRound(
		0,
	);
	const player =
		waveState
			.value
			.players[0]!;
	waveState.value =
		{
			...waveState.value,
			players:
				[
					new BulbroState(
						{
							...player.toJSON(),
							materialsAvailable: 1000,
						},
					),
				],
		};
	await flush();
	[
		...root.querySelectorAll(
			"button",
		),
	]
		.find(
			(
				button,
			) =>
				button.textContent ===
				"Lock",
		)!
		.click();
	await flush();
	const locked =
		root.querySelector<HTMLButtonElement>(
			'[aria-pressed="true"]',
		)!;
	const buy =
		[
			...locked.parentElement!.querySelectorAll(
				"button",
			),
		].find(
			(
				button,
			) =>
				button !==
				locked,
		)!;
	expect(
		buy.disabled,
	).toBe(
		false,
	);
	buy.click();
	await flush();
	expect(
		waveState
			.value
			.players[0]!
			.lockedShopOffers,
	).toHaveLength(
		0,
	);
	expect(
		root.querySelectorAll(
			'[aria-pressed="true"]',
		),
	).toHaveLength(
		0,
	);
});

it("returns from settings to the same shop without changing offers or player state", async () => {
	startPreRound(
		0,
	);
	const shopText =
		root.textContent;
	const state =
		waveState.value;
	const settings =
		[
			...root.querySelectorAll(
				"button",
			),
		].find(
			(
				button,
			) =>
				button.textContent ===
				"Settings",
		);
	expect(
		settings,
	).toBeDefined();
	settings!.click();
	await flush();
	expect(
		root.querySelector(
			"h2",
		)
			?.textContent,
	).toBe(
		"Settings",
	);
	expect(
		root.querySelector(
			"#language",
		),
	).not.toBeNull();
	const back =
		[
			...root.querySelectorAll(
				"button",
			),
		].find(
			(
				button,
			) =>
				button.textContent ===
				"Back to shop",
		);
	expect(
		back,
	).toBeDefined();
	back!.click();
	await flush();
	expect(
		root.textContent,
	).toBe(
		shopText,
	);
	expect(
		waveState.value,
	).toBe(
		state,
	);
});
