import {
	describe,
	expect,
	it,
} from "bun:test";
import {
	circleIntersectsSector,
	createStrike,
	createSwingStrike,
	createThrustStrike,
	findStrikeHits,
	isStriking,
	normalizeAngle,
	type StrikeParams,
	type SwingStrike,
	strikeKnockbackDirection,
	swingAngleAt,
	type ThrustStrike,
	thrustExtensionAt,
} from "./MeleeStrike";

const pivot =
	{
		x: 0,
		y: 0,
	};

const params: StrikeParams =
	{
		now: 1000,
		pivot,
		target:
			{
				x: 100,
				y: 0,
			},
		targetId:
			"e1",
		reach: 100,
		damage: 10,
		knockback: 5,
		cooldown: 1000,
	};

function swing(
	overrides: Partial<SwingStrike> = {},
): SwingStrike {
	return {
		...createSwingStrike(
			{
				type: "swing",
				arc: 180,
				duration: 200,
			},
			params,
		),
		...overrides,
	};
}

function thrust(
	overrides: Partial<ThrustStrike> = {},
): ThrustStrike {
	return {
		...createThrustStrike(
			{
				type: "thrust",
				duration: 200,
			},
			params,
		),
		...overrides,
	};
}

const ids =
	(
		targets: {
			id: string;
		}[],
	) =>
		targets.map(
			(
				t,
			) =>
				t.id,
		);

describe("createStrike", () => {
	it("aims the strike at the target", () => {
		const s =
			createStrike(
				{
					type: "swing",
					arc: 90,
					duration: 200,
				},
				{
					...params,
					target:
						{
							x: 0,
							y: 50,
						},
				},
			);
		expect(
			s.type,
		).toBe(
			"swing",
		);
		expect(
			s.centerAngle,
		).toBeCloseTo(
			Math.PI /
				2,
		);
		expect(
			s.type ===
				"swing" &&
				s.arc,
		).toBeCloseTo(
			Math.PI /
				2,
		);
		expect(
			createStrike(
				{
					type: "thrust",
					duration: 200,
				},
				params,
			)
				.type,
		).toBe(
			"thrust",
		);
	});

	it("limits strike duration to a share of the cooldown", () => {
		const s =
			createStrike(
				{
					type: "thrust",
					duration: 500,
				},
				{
					...params,
					cooldown: 200,
				},
			);
		expect(
			s.duration,
		).toBe(
			160,
		);
	});

	it("alternates swing direction between consecutive swings", () => {
		const first =
			swing();
		const second =
			createSwingStrike(
				{
					type: "swing",
					arc: 90,
					duration: 200,
				},
				{
					...params,
					now: 2000,
					previous:
						first,
				},
			);
		expect(
			first.sweep,
		).toBe(
			1,
		);
		expect(
			second.sweep,
		).toBe(
			-1,
		);
	});
});

describe("swingAngleAt", () => {
	it("sweeps from one side of the target to the other", () => {
		const s =
			swing();
		expect(
			swingAngleAt(
				s,
				1000,
			),
		).toBeCloseTo(
			-Math.PI /
				2,
		);
		expect(
			swingAngleAt(
				s,
				1100,
			),
		).toBeCloseTo(
			0,
		);
		expect(
			swingAngleAt(
				s,
				1200,
			),
		).toBeCloseTo(
			Math.PI /
				2,
		);
		// Clamped after the end
		expect(
			swingAngleAt(
				s,
				5000,
			),
		).toBeCloseTo(
			Math.PI /
				2,
		);
	});

	it("eases in: the blade moves slower at the start than in the middle", () => {
		const s =
			swing();
		const startStep =
			swingAngleAt(
				s,
				1020,
			) -
			swingAngleAt(
				s,
				1000,
			);
		const middleStep =
			swingAngleAt(
				s,
				1110,
			) -
			swingAngleAt(
				s,
				1090,
			);
		expect(
			middleStep,
		).toBeGreaterThan(
			startStep,
		);
	});

	it("sweeps backwards for reversed swings", () => {
		const s =
			swing(
				{
					sweep:
						-1,
				},
			);
		expect(
			swingAngleAt(
				s,
				1000,
			),
		).toBeCloseTo(
			Math.PI /
				2,
		);
		expect(
			swingAngleAt(
				s,
				1200,
			),
		).toBeCloseTo(
			-Math.PI /
				2,
		);
	});
});

describe("thrustExtensionAt", () => {
	it("lunges out to the reach and pulls back to the handle", () => {
		const s =
			thrust();
		expect(
			thrustExtensionAt(
				s,
				1000,
			),
		).toBeCloseTo(
			s.innerRadius,
		);
		// Full extent at 40% of the duration
		expect(
			thrustExtensionAt(
				s,
				1080,
			),
		).toBeCloseTo(
			s.reach,
		);
		expect(
			thrustExtensionAt(
				s,
				1140,
			),
		).toBeLessThan(
			s.reach,
		);
		expect(
			thrustExtensionAt(
				s,
				1140,
			),
		).toBeGreaterThan(
			s.innerRadius,
		);
		expect(
			thrustExtensionAt(
				s,
				1200,
			),
		).toBeCloseTo(
			s.innerRadius,
		);
	});

	it("lunges faster than it pulls back", () => {
		const s =
			thrust();
		const lungeStep =
			thrustExtensionAt(
				s,
				1020,
			) -
			thrustExtensionAt(
				s,
				1000,
			);
		const pullStep =
			thrustExtensionAt(
				s,
				1100,
			) -
			thrustExtensionAt(
				s,
				1120,
			);
		expect(
			lungeStep,
		).toBeGreaterThan(
			pullStep,
		);
	});
});

describe("isStriking", () => {
	it("is active only during the strike", () => {
		const s =
			swing();
		expect(
			isStriking(
				s,
				999,
			),
		).toBe(
			false,
		);
		expect(
			isStriking(
				s,
				1100,
			),
		).toBe(
			true,
		);
		expect(
			isStriking(
				s,
				1200,
			),
		).toBe(
			false,
		);
		expect(
			isStriking(
				undefined,
				1100,
			),
		).toBe(
			false,
		);
	});
});

describe("normalizeAngle", () => {
	it("wraps angles into (-PI, PI]", () => {
		expect(
			normalizeAngle(
				3 *
					Math.PI,
			),
		).toBeCloseTo(
			Math.PI,
		);
		expect(
			normalizeAngle(
				-Math.PI /
					2 -
					2 *
						Math.PI,
			),
		).toBeCloseTo(
			-Math.PI /
				2,
		);
	});
});

describe("circleIntersectsSector", () => {
	it("hits circles inside the wedge", () => {
		expect(
			circleIntersectsSector(
				{
					x: 50,
					y: 0,
				},
				5,
				pivot,
				10,
				100,
				-0.2,
				0.2,
			),
		).toBe(
			true,
		);
	});

	it("misses circles beyond reach or inside the handle radius", () => {
		expect(
			circleIntersectsSector(
				{
					x: 120,
					y: 0,
				},
				5,
				pivot,
				10,
				100,
				-0.2,
				0.2,
			),
		).toBe(
			false,
		);
		expect(
			circleIntersectsSector(
				{
					x: 3,
					y: 0,
				},
				2,
				pivot,
				10,
				100,
				-0.2,
				0.2,
			),
		).toBe(
			false,
		);
	});

	it("hits circles whose edge overlaps the wedge", () => {
		// Center at 90° but radius reaches into a wedge around 60°
		expect(
			circleIntersectsSector(
				{
					x: 0,
					y: 50,
				},
				30,
				pivot,
				0,
				100,
				0,
				Math.PI /
					3,
			),
		).toBe(
			true,
		);
		expect(
			circleIntersectsSector(
				{
					x: 0,
					y: 50,
				},
				5,
				pivot,
				0,
				100,
				0,
				Math.PI /
					3,
			),
		).toBe(
			false,
		);
	});

	it("handles wedges crossing the -PI/PI seam", () => {
		expect(
			circleIntersectsSector(
				{
					x:
						-50,
					y: 0,
				},
				5,
				pivot,
				0,
				100,
				Math.PI -
					0.2,
				Math.PI +
					0.2,
			),
		).toBe(
			true,
		);
	});
});

describe("findStrikeHits", () => {
	const targets =
		[
			{
				id: "above",
				position:
					{
						x: 0,
						y:
							-60,
					},
			},
			{
				id: "ahead",
				position:
					{
						x: 60,
						y: 0,
					},
			},
			{
				id: "below",
				position:
					{
						x: 0,
						y: 60,
					},
			},
			{
				id: "behind",
				position:
					{
						x:
							-60,
						y: 0,
					},
			},
			{
				id: "far",
				position:
					{
						x: 300,
						y: 0,
					},
			},
		];

	it("swing hits only targets the blade passed during the time window", () => {
		const s =
			swing();
		expect(
			ids(
				findStrikeHits(
					s,
					pivot,
					targets,
					5,
					1000,
					1090,
				),
			),
		).toEqual(
			[
				"above",
			],
		);
		expect(
			ids(
				findStrikeHits(
					s,
					pivot,
					targets,
					5,
					1090,
					1200,
				),
			),
		).toEqual(
			[
				"ahead",
				"below",
			],
		);
	});

	it("thrust hits only targets on the line to the target", () => {
		expect(
			ids(
				findStrikeHits(
					thrust(),
					pivot,
					targets,
					5,
					1000,
					1200,
				),
			),
		).toEqual(
			[
				"ahead",
			],
		);
	});

	it("thrust reaches farther targets only once extended", () => {
		const s =
			thrust();
		const tipTarget =
			[
				{
					id: "tip",
					position:
						{
							x: 98,
							y: 0,
						},
				},
			];
		expect(
			findStrikeHits(
				s,
				pivot,
				tipTarget,
				1,
				1000,
				1010,
			),
		).toHaveLength(
			0,
		);
		// Window containing the full extent
		expect(
			findStrikeHits(
				s,
				pivot,
				tipTarget,
				1,
				1060,
				1100,
			),
		).toHaveLength(
			1,
		);
	});

	it("skips targets already hit by the strike", () => {
		const s =
			swing(
				{
					hitTargetIds:
						[
							"ahead",
						],
				},
			);
		expect(
			ids(
				findStrikeHits(
					s,
					pivot,
					targets,
					5,
					1000,
					1200,
				),
			),
		).toEqual(
			[
				"above",
				"below",
			],
		);
	});

	it("hits nothing after the strike ended", () => {
		expect(
			findStrikeHits(
				swing(),
				pivot,
				targets,
				5,
				1300,
				1400,
			),
		).toHaveLength(
			0,
		);
		expect(
			findStrikeHits(
				thrust(),
				pivot,
				targets,
				5,
				1300,
				1400,
			),
		).toHaveLength(
			0,
		);
	});
});

describe("strikeKnockbackDirection", () => {
	it("swing pushes away from the pivot and along the blade movement", () => {
		const dir =
			strikeKnockbackDirection(
				swing(),
				pivot,
				{
					x: 60,
					y: 0,
				},
				1100,
			);
		// Radial is +x, blade moves towards +y (clockwise on screen)
		expect(
			dir.x,
		).toBeGreaterThan(
			0,
		);
		expect(
			dir.y,
		).toBeGreaterThan(
			0,
		);
		expect(
			dir.x,
		).toBeGreaterThan(
			dir.y,
		);
		expect(
			Math.hypot(
				dir.x,
				dir.y,
			),
		).toBeCloseTo(
			1,
		);
	});

	it("thrust pushes along the lunge", () => {
		const dir =
			strikeKnockbackDirection(
				thrust(),
				pivot,
				{
					x: 60,
					y: 10,
				},
				1050,
			);
		expect(
			dir.x,
		).toBeCloseTo(
			1,
		);
		expect(
			dir.y,
		).toBeCloseTo(
			0,
		);
	});
});

describe("combo strikes", () => {
	const combo =
		{
			type: "combo" as const,
			strikes:
				[
					{
						type: "swing" as const,
						arc: 140,
						duration: 260,
					},
					{
						type: "thrust" as const,
						duration: 220,
					},
				],
		};

	it("cycles through the combo strikes", () => {
		const first =
			createStrike(
				combo,
				params,
			);
		const second =
			createStrike(
				combo,
				{
					...params,
					previous:
						first,
				},
			);
		const third =
			createStrike(
				combo,
				{
					...params,
					previous:
						second,
				},
			);
		expect(
			[
				first,
				second,
				third,
			].map(
				(
					s,
				) =>
					s.type,
			),
		).toEqual(
			[
				"swing",
				"thrust",
				"swing",
			],
		);
		expect(
			[
				first,
				second,
				third,
			].map(
				(
					s,
				) =>
					s.comboStep,
			),
		).toEqual(
			[
				0,
				1,
				0,
			],
		);
		expect(
			second.duration,
		).toBe(
			220,
		);
	});

	it("starts the combo over when the previous strike was not part of it", () => {
		const unrelated =
			createStrike(
				{
					type: "thrust",
					duration: 200,
				},
				params,
			);
		expect(
			createStrike(
				combo,
				{
					...params,
					previous:
						unrelated,
				},
			)
				.type,
		).toBe(
			"swing",
		);
	});
});
