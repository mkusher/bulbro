import {
	afterEach,
	beforeEach,
	expect,
	it,
	mock,
} from "bun:test";
import {
	h,
	render,
} from "preact";
import { getTotalExperienceForLevel } from "@/bulbro/Levels";
import { wellRoundedBulbro } from "@/characters-definitions";
import { classicMapSize } from "@/game-canvas";
import {
	createInitialState,
	waveState,
} from "@/waveState";

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
		0,
	);
	expect(
		root.textContent,
	).toContain(
		"Prepare",
	);
});
