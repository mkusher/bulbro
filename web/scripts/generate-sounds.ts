/**
 * Procedural sound effect generator.
 *
 * Every effect is built from layered, physically-motivated components
 * (transients, modal resonators, filtered noise, formant voices, room
 * reverb) and rendered deterministically from a fixed seed, so the
 * output is reproducible and free of licensing concerns.
 *
 * Usage (from `web/`):
 *   bun run sounds              # regenerate every effect
 *   bun run sounds gunshot kick # regenerate selected effects
 *
 * Requires `ffmpeg` with libmp3lame on PATH.
 */
import {
	mkdtemp,
	rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SR = 44100;
const TAU =
	Math.PI *
	2;

type Buffer =
	Float32Array;
type Curve =
	(
		t: number,
	) => number;

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

function createRandom(
	seed: number,
): () => number {
	let a =
		seed >>>
		0;
	return () => {
		a =
			(a +
				0x6d2b79f5) >>>
			0;
		let t =
			a;
		t =
			Math.imul(
				t ^
					(t >>>
						15),
				t |
					1,
			);
		t ^=
			t +
			Math.imul(
				t ^
					(t >>>
						7),
				t |
					61,
			);
		return (
			((t ^
				(t >>>
					14)) >>>
				0) /
			4294967296
		);
	};
}

let random =
	createRandom(
		1,
	);
const bipolar =
	() =>
		random() *
			2 -
		1;
const between =
	(
		min: number,
		max: number,
	) =>
		min +
		random() *
			(max -
				min);

const samples =
	(
		seconds: number,
	) =>
		Math.max(
			1,
			Math.round(
				seconds *
					SR,
			),
		);
const silence =
	(
		seconds: number,
	): Buffer =>
		new Float32Array(
			samples(
				seconds,
			),
		);

function render(
	seconds: number,
	fn: (
		t: number,
		i: number,
	) => number,
): Buffer {
	const out =
		silence(
			seconds,
		);
	for (
		let i = 0;
		i <
		out.length;
		i++
	)
		out[
			i
		] =
			fn(
				i /
					SR,
				i,
			);
	return out;
}

const noise =
	(
		seconds: number,
	) =>
		render(
			seconds,
			() =>
				bipolar(),
		);

/** Integrated white noise: deep, rumbling spectrum. */
function brownNoise(
	seconds: number,
): Buffer {
	let last = 0;
	return render(
		seconds,
		() => {
			last =
				(last +
					0.02 *
						bipolar()) *
				0.998;
			return (
				last *
				3.5
			);
		},
	);
}

/** Attack-then-exponential-decay envelope. */
const hit =
	(
		attack: number,
		decay: number,
	): Curve =>
	(
		t,
	) =>
		t <
		attack
			? t /
				attack
			: Math.exp(
					-(
						t -
						attack
					) /
						decay,
				);

/** Smooth rise and fall between `start` and `end`. */
const bell =
	(
		start: number,
		end: number,
	): Curve =>
	(
		t,
	) =>
		t <=
			start ||
		t >=
			end
			? 0
			: Math.sin(
					(Math.PI *
						(t -
							start)) /
						(end -
							start),
				) **
				2;

/** Applies an envelope, with a short fade so truncated layers don't click. */
function shape(
	input: Buffer,
	envelope: Curve,
): Buffer {
	const fade =
		Math.min(
			samples(
				0.008,
			),
			input.length,
		);
	return input.map(
		(
			v,
			i,
		) =>
			v *
			envelope(
				i /
					SR,
			) *
			Math.min(
				(input.length -
					i) /
					fade,
				1,
			),
	);
}

/** Sums layers into a buffer long enough for all of them. */
function mix(
	...layers: [
		Buffer,
		number?,
		number?,
	][]
): Buffer {
	const length =
		Math.max(
			...layers.map(
				([
					buffer,
					,
					at = 0,
				]) =>
					buffer.length +
					samples(
						at,
					),
			),
		);
	const out =
		new Float32Array(
			length,
		);
	for (const [
		buffer,
		level = 1,
		at = 0,
	] of layers) {
		const offset =
			samples(
				at,
			);
		for (
			let i = 0;
			i <
			buffer.length;
			i++
		)
			out[
				offset +
					i
			] +=
				buffer[
					i
				] *
				level;
	}
	return out;
}

/** Oscillator with a time-varying frequency. */
function oscillator(
	seconds: number,
	frequency: Curve,
	wave: (
		phase: number,
	) => number = Math.sin,
): Buffer {
	let phase = 0;
	return render(
		seconds,
		(
			t,
		) => {
			phase +=
				(TAU *
					frequency(
						t,
					)) /
				SR;
			return wave(
				phase,
			);
		},
	);
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

type FilterType =
	| "lowpass"
	| "highpass"
	| "bandpass"
	| "peak";

/** RBJ biquad; frequency may vary over time. */
function filter(
	input: Buffer,
	type: FilterType,
	frequency:
		| number
		| Curve,
	q = Math.SQRT1_2,
	gainDb = 0,
): Buffer {
	const out =
		new Float32Array(
			input.length,
		);
	const freqAt =
		typeof frequency ===
		"number"
			? () =>
					frequency
			: frequency;
	let x1 = 0;
	let x2 = 0;
	let y1 = 0;
	let y2 = 0;
	let b0 = 0;
	let b1 = 0;
	let b2 = 0;
	let a1 = 0;
	let a2 = 0;
	for (
		let i = 0;
		i <
		input.length;
		i++
	) {
		if (
			i %
				16 ===
			0
		) {
			const f =
				Math.min(
					Math.max(
						freqAt(
							i /
								SR,
						),
						10,
					),
					SR *
						0.45,
				);
			const w =
				(TAU *
					f) /
				SR;
			const cos =
				Math.cos(
					w,
				);
			const alpha =
				Math.sin(
					w,
				) /
				(2 *
					q);
			const a =
				10 **
				(gainDb /
					40);
			let a0 =
				1 +
				alpha;
			switch (
				type
			) {
				case "lowpass":
					b0 =
						b2 =
							(1 -
								cos) /
							2;
					b1 =
						1 -
						cos;
					a1 =
						-2 *
						cos;
					a2 =
						1 -
						alpha;
					break;
				case "highpass":
					b0 =
						b2 =
							(1 +
								cos) /
							2;
					b1 =
						-(
							1 +
							cos
						);
					a1 =
						-2 *
						cos;
					a2 =
						1 -
						alpha;
					break;
				case "bandpass":
					b0 =
						alpha;
					b1 = 0;
					b2 =
						-alpha;
					a1 =
						-2 *
						cos;
					a2 =
						1 -
						alpha;
					break;
				case "peak":
					a0 =
						1 +
						alpha /
							a;
					b0 =
						1 +
						alpha *
							a;
					b1 =
						-2 *
						cos;
					b2 =
						1 -
						alpha *
							a;
					a1 =
						-2 *
						cos;
					a2 =
						1 -
						alpha /
							a;
					break;
			}
			b0 /=
				a0;
			b1 /=
				a0;
			b2 /=
				a0;
			a1 /=
				a0;
			a2 /=
				a0;
		}
		const x =
			input[
				i
			];
		const y =
			b0 *
				x +
			b1 *
				x1 +
			b2 *
				x2 -
			a1 *
				y1 -
			a2 *
				y2;
		x2 =
			x1;
		x1 =
			x;
		y2 =
			y1;
		y1 =
			y;
		out[
			i
		] =
			y;
	}
	return out;
}

type Mode =
	{
		frequency: number;
		decay: number;
		level: number;
	};

/**
 * Bank of damped resonators: models the ringing of struck solid
 * objects (wood, metal) when excited by short impulses.
 */
function resonate(
	excitation: Buffer,
	modes: Mode[],
	tail = 0.3,
): Buffer {
	const out =
		new Float32Array(
			excitation.length +
				samples(
					tail,
				),
		);
	for (const {
		frequency,
		decay,
		level,
	} of modes) {
		const r =
			Math.exp(
				-1 /
					(decay *
						SR),
			);
		const c =
			2 *
			r *
			Math.cos(
				(TAU *
					frequency) /
					SR,
			);
		const norm =
			(1 -
				r) *
			level;
		let y1 = 0;
		let y2 = 0;
		for (
			let i = 0;
			i <
			out.length;
			i++
		) {
			const x =
				i <
				excitation.length
					? excitation[
							i
						]
					: 0;
			const y =
				x *
					norm +
				c *
					y1 -
				r *
					r *
					y2;
			y2 =
				y1;
			y1 =
				y;
			out[
				i
			] +=
				y;
		}
	}
	return out;
}

/** Sparse impulses; `rate` is impulses per second at time t. */
function impulses(
	seconds: number,
	rate: Curve,
	level: Curve = () =>
		1,
	jitter = 0.3,
): Buffer {
	const out =
		silence(
			seconds,
		);
	let t = 0;
	while (
		t <
		seconds
	) {
		const r =
			rate(
				t,
			);
		if (
			r <=
			0
		) {
			t += 0.005;
			continue;
		}
		const i =
			Math.floor(
				t *
					SR,
			);
		if (
			i <
			out.length
		)
			out[
				i
			] +=
				level(
					t,
				) *
				(0.6 +
					0.4 *
						random());
		t +=
			(1 /
				r) *
			(1 +
				jitter *
					bipolar());
	}
	return out;
}

/** Soft saturation, keeps unity gain for small signals. */
function saturate(
	input: Buffer,
	drive: number,
): Buffer {
	const norm =
		Math.tanh(
			drive,
		);
	return input.map(
		(
			v,
		) =>
			Math.tanh(
				v *
					drive,
			) /
			norm,
	);
}

/** Schroeder reverb with damped combs; returns dry + wet. */
function reverb(
	input: Buffer,
	{
		time,
		wet,
		damping = 0.4,
	}: {
		time: number;
		wet: number;
		damping?: number;
	},
): Buffer {
	const out =
		new Float32Array(
			input.length +
				samples(
					time,
				),
		);
	const wetSignal =
		new Float32Array(
			out.length,
		);
	for (const delayMs of [
		29.7,
		37.1,
		41.1,
		43.7,
		31.3,
		47.9,
	]) {
		const delay =
			samples(
				delayMs /
					1000,
			);
		const feedback =
			10 **
			((-3 *
				delayMs) /
				1000 /
				time);
		const line =
			new Float32Array(
				delay,
			);
		let lowpassed = 0;
		for (
			let i = 0;
			i <
			out.length;
			i++
		) {
			const x =
				i <
				input.length
					? input[
							i
						]
					: 0;
			const delayed =
				line[
					i %
						delay
				];
			lowpassed =
				delayed *
					(1 -
						damping) +
				lowpassed *
					damping;
			line[
				i %
					delay
			] =
				x +
				lowpassed *
					feedback;
			wetSignal[
				i
			] +=
				delayed /
				6;
		}
	}
	for (const [
		delayMs,
		g,
	] of [
		[
			5,
			0.7,
		],
		[
			1.7,
			0.7,
		],
	] as const) {
		const delay =
			samples(
				delayMs /
					1000,
			);
		const line =
			new Float32Array(
				delay,
			);
		for (
			let i = 0;
			i <
			out.length;
			i++
		) {
			const delayed =
				line[
					i %
						delay
				];
			const x =
				wetSignal[
					i
				];
			const y =
				-g *
					x +
				delayed;
			line[
				i %
					delay
			] =
				x +
				g *
					y;
			wetSignal[
				i
			] =
				y;
		}
	}
	for (
		let i = 0;
		i <
		out.length;
		i++
	)
		out[
			i
		] =
			(i <
			input.length
				? input[
						i
					]
				: 0) +
			wetSignal[
				i
			] *
				wet;
	return out;
}

/** Feedback echo, used for sci-fi effects. */
function echo(
	input: Buffer,
	delaySeconds: number,
	feedback: number,
	repeats = 5,
): Buffer {
	const delay =
		samples(
			delaySeconds,
		);
	const out =
		new Float32Array(
			input.length +
				delay *
					repeats,
		);
	out.set(
		input,
	);
	for (
		let i =
			delay;
		i <
		out.length;
		i++
	)
		out[
			i
		] +=
			out[
				i -
					delay
			] *
			feedback;
	return out;
}

/**
 * Removes DC, trims trailing silence, applies a short fade-out and
 * scales to the requested peak level.
 */
function master(
	input: Buffer,
	peakDb: number,
): Buffer {
	const cleaned =
		filter(
			input,
			"highpass",
			25,
		);
	let peak = 0;
	for (const v of cleaned)
		peak =
			Math.max(
				peak,
				Math.abs(
					v,
				),
			);
	const floor =
		peak *
		10 **
			(-60 /
				20);
	let end =
		cleaned.length;
	while (
		end >
			1 &&
		Math.abs(
			cleaned[
				end -
					1
			],
		) <
			floor
	)
		end--;
	const trimmed =
		cleaned.slice(
			0,
			end +
				samples(
					0.01,
				),
		);
	const fade =
		samples(
			0.015,
		);
	const scale =
		10 **
			(peakDb /
				20) /
		peak;
	return trimmed.map(
		(
			v,
			i,
		) => {
			const remaining =
				trimmed.length -
				i;
			return (
				v *
				scale *
				(remaining <
				fade
					? remaining /
						fade
					: 1)
			);
		},
	);
}

// ---------------------------------------------------------------------------
// Voice (formant synthesis)
// ---------------------------------------------------------------------------

type Formant =
	{
		frequency: Curve;
		bandwidth: number;
		level: number;
	};

/**
 * Source-filter vocal model: a glottal pulse train with jitter,
 * shimmer and period-doubling roughness, plus breath noise, shaped by
 * a parallel bank of formant filters.
 */
function voice(
	seconds: number,
	{
		pitch,
		formants,
		roughness,
		breath,
	}: {
		pitch: Curve;
		formants: Formant[];
		roughness: number;
		breath: number;
	},
): Buffer {
	let phase = 0;
	let period = 0;
	let jitter = 0;
	let shimmer = 1;
	let previous = 0;
	const drift =
		filter(
			noise(
				seconds,
			),
			"lowpass",
			12,
		);
	const breathNoise =
		filter(
			noise(
				seconds,
			),
			"highpass",
			1200,
		);
	const source =
		render(
			seconds,
			(
				t,
				i,
			) => {
				jitter =
					jitter *
						0.995 +
					bipolar() *
						0.004;
				const f0 =
					pitch(
						t,
					) *
					(1 +
						drift[
							i
						] *
							0.25 +
						jitter);
				phase +=
					f0 /
					SR;
				if (
					phase >=
					1
				) {
					phase -= 1;
					period++;
					shimmer =
						1 -
						roughness *
							(period %
								2) -
						0.15 *
							random();
				}
				// Rosenberg glottal flow: opening, closing, closed phase.
				const flow =
					phase <
					0.4
						? 0.5 *
							(1 -
								Math.cos(
									(Math.PI *
										phase) /
										0.4,
								))
						: phase <
								0.6
							? Math.cos(
									(Math.PI *
										(phase -
											0.4)) /
										0.4,
								)
							: 0;
				// Differentiate to model lip radiation.
				const derivative =
					(flow -
						previous) *
					30;
				previous =
					flow;
				return (
					derivative *
						shimmer +
					breathNoise[
						i
					] *
						breath *
						(0.4 +
							flow)
				);
			},
		);
	const layers =
		formants.map(
			({
				frequency,
				bandwidth,
				level,
			}) =>
				[
					filter(
						source,
						"bandpass",
						(
							t,
						) =>
							frequency(
								t,
							),
						frequency(
							0,
						) /
							bandwidth,
					),
					level,
				] as [
					Buffer,
					number,
				],
		);
	return mix(
		...layers,
	);
}

const glide =
	(
		from: number,
		to: number,
		start: number,
		end: number,
	): Curve =>
	(
		t,
	) => {
		const x =
			Math.min(
				Math.max(
					(t -
						start) /
						(end -
							start),
					0,
				),
				1,
			);
		return (
			from +
			(to -
				from) *
				(x *
					x *
					(3 -
						2 *
							x))
		);
	};

// ---------------------------------------------------------------------------
// Sound recipes
// ---------------------------------------------------------------------------

/** Firearm: supersonic crack, muzzle blast, low boom, action click, room tail. */
function gunshot(): Buffer {
	const crack =
		shape(
			filter(
				noise(
					0.01,
				),
				"highpass",
				2500,
			),
			hit(
				0.0002,
				0.0015,
			),
		);
	const blast =
		shape(
			filter(
				noise(
					0.2,
				),
				"lowpass",
				(
					t,
				) =>
					7000 *
						Math.exp(
							-t /
								0.03,
						) +
					700,
				0.9,
			),
			hit(
				0.0004,
				0.014,
			),
		);
	const boom =
		shape(
			oscillator(
				0.3,
				(
					t,
				) =>
					52 +
					110 *
						Math.exp(
							-t /
								0.025,
						),
			),
			hit(
				0.001,
				0.06,
			),
		);
	const tail =
		shape(
			filter(
				noise(
					0.6,
				),
				"lowpass",
				(
					t,
				) =>
					1600 *
						Math.exp(
							-t /
								0.2,
						) +
					250,
			),
			hit(
				0.004,
				0.13,
			),
		);
	const action =
		resonate(
			shape(
				noise(
					0.002,
				),
				hit(
					0.0001,
					0.0005,
				),
			),
			[
				{
					frequency: 3100,
					decay: 0.012,
					level: 1,
				},
				{
					frequency: 4700,
					decay: 0.008,
					level: 0.7,
				},
				{
					frequency: 6900,
					decay: 0.006,
					level: 0.5,
				},
			],
			0.05,
		);
	const body =
		saturate(
			mix(
				[
					crack,
					0.9,
				],
				[
					blast,
					1.1,
				],
				[
					boom,
					0.9,
				],
				[
					tail,
					0.22,
				],
				[
					action,
					0.25,
					0.07,
				],
			),
			2.6,
		);
	return master(
		filter(
			reverb(
				body,
				{
					time: 0.7,
					wet: 0.2,
					damping: 0.55,
				},
			),
			"peak",
			180,
			1,
			3,
		),
		-8,
	);
}

/** Punch / kick landing on a body: skin slap, flesh thump, cloth rustle. */
function kick(): Buffer {
	const slap =
		shape(
			filter(
				noise(
					0.04,
				),
				"bandpass",
				2300,
				0.7,
			),
			hit(
				0.0004,
				0.005,
			),
		);
	const thump =
		shape(
			oscillator(
				0.25,
				(
					t,
				) =>
					48 +
					120 *
						Math.exp(
							-t /
								0.018,
						),
			),
			hit(
				0.002,
				0.055,
			),
		);
	const flesh =
		shape(
			filter(
				noise(
					0.15,
				),
				"lowpass",
				(
					t,
				) =>
					900 *
						Math.exp(
							-t /
								0.03,
						) +
					180,
				1.2,
			),
			hit(
				0.001,
				0.03,
			),
		);
	const cloth =
		shape(
			filter(
				noise(
					0.12,
				),
				"bandpass",
				4200,
				0.6,
			),
			(
				t,
			) =>
				bell(
					0.005,
					0.1,
				)(
					t,
				) *
				(0.6 +
					0.4 *
						Math.sin(
							t *
								190,
						)),
		);
	const body =
		saturate(
			mix(
				[
					slap,
					0.9,
				],
				[
					thump,
					1,
				],
				[
					flesh,
					0.8,
				],
				[
					cloth,
					0.06,
				],
			),
			2.2,
		);
	return master(
		reverb(
			body,
			{
				time: 0.25,
				wet: 0.08,
				damping: 0.6,
			},
		),
		-9,
	);
}

/**
 * Alien death scream: two dissonant voices with an insect-like trill,
 * vowel morphing ee → aa → oo, ring modulation for a metallic timbre and
 * sample-rate reduction for digital grit, diving in pitch as it dies.
 */
function scream(): Buffer {
	const duration = 0.9;
	const contour: Curve =
		(
			t,
		) =>
			t <
			0.08
				? glide(
						380,
						720,
						0,
						0.08,
					)(
						t,
					)
				: t <
						0.42
					? glide(
							720,
							640,
							0.08,
							0.42,
						)(
							t,
						)
					: glide(
							640,
							140,
							0.42,
							duration,
						)(
							t,
						);
	const trill =
		(
			rate: number,
			phase: number,
		): Curve =>
		(
			t,
		) =>
			1 +
			0.08 *
				Math.sin(
					TAU *
						rate *
						t +
						phase,
				) *
				Math.min(
					t /
						0.1,
					1,
				);
	const morph =
		(
			ee: number,
			aa: number,
			oo: number,
		): Curve =>
		(
			t,
		) =>
			t <
			0.3
				? glide(
						ee,
						aa,
						0.02,
						0.3,
					)(
						t,
					)
				: glide(
						aa,
						oo,
						0.45,
						duration,
					)(
						t,
					);
	const formants: Formant[] =
		[
			{
				frequency:
					morph(
						320,
						850,
						420,
					),
				bandwidth: 90,
				level: 1,
			},
			{
				frequency:
					morph(
						2300,
						1250,
						800,
					),
				bandwidth: 120,
				level: 0.8,
			},
			{
				frequency:
					() =>
						3400,
				bandwidth: 150,
				level: 0.45,
			},
		];
	const lead =
		voice(
			duration,
			{
				pitch:
					(
						t,
					) =>
						contour(
							t,
						) *
						trill(
							17,
							0,
						)(
							t,
						),
				roughness: 0.25,
				breath: 0.08,
				formants,
			},
		);
	const harmony =
		voice(
			duration,
			{
				pitch:
					(
						t,
					) =>
						contour(
							t,
						) *
						1.41 *
						trill(
							13,
							1.3,
						)(
							t,
						),
				roughness: 0.4,
				breath: 0.05,
				formants,
			},
		);
	const voices =
		mix(
			[
				lead,
				1,
			],
			[
				harmony,
				0.55,
			],
		);
	const carrier =
		oscillator(
			duration,
			glide(
				230,
				85,
				0,
				duration,
			),
		);
	const metallic =
		voices.map(
			(
				v,
				i,
			) =>
				v *
				(0.4 +
					0.6 *
						(carrier[
							i
						] ??
							0)),
		);
	let held = 0;
	const crushed =
		metallic.map(
			(
				v,
				i,
			) => {
				if (
					i %
						3 ===
					0
				)
					held =
						Math.round(
							v *
								24,
						) /
						24;
				return (
					v *
						0.7 +
					held *
						0.3
				);
			},
		);
	const envelope: Curve =
		(
			t,
		) =>
			Math.min(
				t /
					0.025,
				1,
			) *
			(t <
			0.55
				? 1
				: (Math.max(
						duration -
							t,
						0,
					) /
						(duration -
							0.55)) **
					1.4);
	const body =
		saturate(
			echo(
				shape(
					crushed,
					envelope,
				),
				0.021,
				0.3,
				3,
			),
			2.2,
		);
	return master(
		reverb(
			body,
			{
				time: 0.5,
				wet: 0.18,
				damping: 0.45,
			},
		),
		-11,
	);
}

/** Energy weapon: descending resonant zap with a ring-modulated shimmer. */
function laser(): Buffer {
	const sweep: Curve =
		(
			t,
		) =>
			320 +
			2600 *
				Math.exp(
					-t /
						0.045,
				);
	const core =
		oscillator(
			0.3,
			sweep,
			(
				p,
			) =>
				Math.tanh(
					3 *
						Math.sin(
							p,
						),
				),
		);
	const ring =
		oscillator(
			0.3,
			(
				t,
			) =>
				sweep(
					t,
				) *
				1.49,
		);
	const zap =
		filter(
			noise(
				0.3,
			),
			"bandpass",
			(
				t,
			) =>
				sweep(
					t,
				) *
				2,
			4,
		);
	const body =
		shape(
			mix(
				[
					core.map(
						(
							v,
							i,
						) =>
							v *
							(0.7 +
								0.3 *
									ring[
										i
									]),
					),
					1,
				],
				[
					zap,
					0.5,
				],
			),
			hit(
				0.001,
				0.07,
			),
		);
	const filtered =
		filter(
			body,
			"lowpass",
			7000,
		);
	return master(
		reverb(
			echo(
				filtered,
				0.055,
				0.3,
				4,
			),
			{
				time: 0.3,
				wet: 0.1,
			},
		),
		-8,
	);
}

/** Enemy projectile launch: wet, low "thwop" rather than a firearm. */
function enemyShot(): Buffer {
	const pop =
		shape(
			oscillator(
				0.15,
				(
					t,
				) =>
					140 +
					380 *
						Math.exp(
							-t /
								0.02,
						),
			),
			hit(
				0.002,
				0.035,
			),
		);
	const puff =
		shape(
			filter(
				noise(
					0.1,
				),
				"bandpass",
				(
					t,
				) =>
					1800 *
						Math.exp(
							-t /
								0.03,
						) +
					400,
				1.5,
			),
			hit(
				0.001,
				0.02,
			),
		);
	const body =
		saturate(
			mix(
				[
					pop,
					1,
				],
				[
					puff,
					0.6,
				],
			),
			1.5,
		);
	return master(
		reverb(
			body,
			{
				time: 0.25,
				wet: 0.1,
			},
		),
		-13,
	);
}

/** Explosion: shock crack, broadband blast, sub boom, rumble and debris. */
function explosion(): Buffer {
	const duration = 2.2;
	const crack =
		shape(
			filter(
				noise(
					0.02,
				),
				"highpass",
				1200,
			),
			hit(
				0.0003,
				0.004,
			),
		);
	const blast =
		shape(
			filter(
				noise(
					duration,
				),
				"lowpass",
				(
					t,
				) =>
					6000 *
						Math.exp(
							-t /
								0.09,
						) +
					160,
				0.8,
			),
			(
				t,
			) =>
				hit(
					0.003,
					0.22,
				)(
					t,
				) +
				0.35 *
					hit(
						0.02,
						0.7,
					)(
						t,
					),
		);
	const boom =
		shape(
			oscillator(
				duration,
				(
					t,
				) =>
					38 +
					70 *
						Math.exp(
							-t /
								0.07,
						),
			),
			hit(
				0.004,
				0.45,
			),
		);
	const rumble =
		shape(
			filter(
				brownNoise(
					duration,
				),
				"lowpass",
				140,
			),
			hit(
				0.03,
				0.7,
			),
		);
	const debris =
		resonate(
			impulses(
				1.6,
				(
					t,
				) =>
					t <
					0.08
						? 0
						: 60 *
							Math.exp(
								-t /
									0.4,
							),
				(
					t,
				) =>
					Math.exp(
						-t /
							0.6,
					),
				0.9,
			),
			[
				{
					frequency: 1900,
					decay: 0.01,
					level: 1,
				},
				{
					frequency: 3400,
					decay: 0.006,
					level: 0.7,
				},
				{
					frequency: 700,
					decay: 0.02,
					level: 0.8,
				},
			],
			0.1,
		);
	const body =
		saturate(
			mix(
				[
					crack,
					0.8,
				],
				[
					blast,
					1.1,
				],
				[
					boom,
					1.2,
				],
				[
					rumble,
					0.9,
				],
				[
					debris,
					0.35,
				],
			),
			2.4,
		);
	return master(
		reverb(
			body,
			{
				time: 1.3,
				wet: 0.25,
				damping: 0.6,
			},
		),
		-1,
	);
}

const woodModes =
	(
		scale = 1,
	): Mode[] => [
		{
			frequency:
				190 *
				scale,
			decay: 0.06,
			level: 1,
		},
		{
			frequency:
				420 *
				scale,
			decay: 0.045,
			level: 0.8,
		},
		{
			frequency:
				760 *
				scale,
			decay: 0.03,
			level: 0.6,
		},
		{
			frequency:
				1180 *
				scale,
			decay: 0.022,
			level: 0.45,
		},
		{
			frequency:
				1720 *
				scale,
			decay: 0.015,
			level: 0.3,
		},
	];

/** Tree snapping: trunk crack, splintering fibres, creak, fall and leaves. */
function treeBreak(): Buffer {
	const snap =
		resonate(
			mix(
				...Array.from(
					{
						length: 7,
					},
					(
						_,
						k,
					) =>
						[
							filter(
								noise(
									0.002,
								),
								"bandpass",
								between(
									2500,
									4500,
								),
								1.2,
							),
							1 -
								k *
									0.1,
							k *
								between(
									0.003,
									0.006,
								),
						] as [
							Buffer,
							number,
							number,
						],
				),
			),
			woodModes(
				1.1,
			),
			0.2,
		);
	const splinter =
		filter(
			resonate(
				impulses(
					0.45,
					(
						t,
					) =>
						400 *
						Math.exp(
							-t /
								0.12,
						),
					(
						t,
					) =>
						Math.exp(
							-t /
								0.2,
						),
					0.95,
				),
				woodModes(
					1.6,
				),
				0.1,
			),
			"highpass",
			600,
		);
	const crackle =
		filter(
			impulses(
				0.4,
				(
					t,
				) =>
					900 *
					Math.exp(
						-t /
							0.08,
					),
				(
					t,
				) =>
					Math.exp(
						-t /
							0.12,
					),
				0.95,
			),
			"bandpass",
			3200,
			0.8,
		);
	const creak =
		resonate(
			impulses(
				0.5,
				(
					t,
				) =>
					70 -
					80 *
						t,
				bell(
					0,
					0.5,
				),
				0.15,
			),
			[
				{
					frequency: 330,
					decay: 0.03,
					level: 1,
				},
				{
					frequency: 790,
					decay: 0.025,
					level: 0.7,
				},
				{
					frequency: 1450,
					decay: 0.015,
					level: 0.4,
				},
			],
			0.1,
		);
	const thud =
		mix(
			[
				shape(
					oscillator(
						0.3,
						(
							t,
						) =>
							42 +
							50 *
								Math.exp(
									-t /
										0.04,
								),
					),
					hit(
						0.004,
						0.06,
					),
				),
				1,
			],
			[
				shape(
					filter(
						noise(
							0.2,
						),
						"lowpass",
						500,
					),
					hit(
						0.002,
						0.04,
					),
				),
				0.6,
			],
		);
	const leaves =
		shape(
			filter(
				noise(
					0.9,
				),
				"bandpass",
				5200,
				0.6,
			),
			(
				t,
			) =>
				bell(
					0,
					0.9,
				)(
					t,
				) *
				Math.abs(
					Math.sin(
						t *
							37,
					) *
						Math.sin(
							t *
								23 +
								1,
						) +
						0.3 *
							bipolar(),
				),
		);
	const body =
		saturate(
			mix(
				[
					snap,
					2.5,
				],
				[
					splinter,
					1.6,
					0.01,
				],
				[
					crackle,
					0.9,
					0.005,
				],
				[
					creak,
					0.5,
					0.12,
				],
				[
					thud,
					0.55,
					0.58,
				],
				[
					leaves,
					0.18,
					0.5,
				],
			),
			1.6,
		);
	return master(
		reverb(
			body,
			{
				time: 0.5,
				wet: 0.1,
				damping: 0.6,
			},
		),
		-3,
	);
}

/** Wooden chest: metal latch, creaking hinge, lid knocking open. */
function chestOpen(): Buffer {
	const metal: Mode[] =
		[
			{
				frequency: 2350,
				decay: 0.03,
				level: 1,
			},
			{
				frequency: 3720,
				decay: 0.022,
				level: 0.7,
			},
			{
				frequency: 5180,
				decay: 0.015,
				level: 0.5,
			},
			{
				frequency: 6950,
				decay: 0.01,
				level: 0.3,
			},
		];
	const click =
		shape(
			noise(
				0.0015,
			),
			hit(
				0.0001,
				0.0004,
			),
		);
	const latch =
		resonate(
			mix(
				[
					click,
					1,
				],
				[
					click,
					0.5,
					0.028,
				],
			),
			metal,
			0.1,
		);
	const hinge =
		resonate(
			impulses(
				0.62,
				(
					t,
				) =>
					32 +
					55 *
						Math.sin(
							(Math.PI *
								t) /
								0.62,
						) +
					10 *
						Math.sin(
							t *
								17,
						),
				bell(
					0,
					0.62,
				),
				0.12,
			),
			[
				{
					frequency: 640,
					decay: 0.022,
					level: 1,
				},
				{
					frequency: 1270,
					decay: 0.018,
					level: 0.8,
				},
				{
					frequency: 1930,
					decay: 0.012,
					level: 0.5,
				},
				{
					frequency: 3150,
					decay: 0.03,
					level: 0.2,
				},
			],
			0.1,
		);
	const knock =
		resonate(
			shape(
				filter(
					noise(
						0.004,
					),
					"lowpass",
					2500,
				),
				hit(
					0.0003,
					0.001,
				),
			),
			woodModes(
				0.8,
			),
			0.25,
		);
	const body =
		saturate(
			mix(
				[
					latch,
					1,
				],
				[
					hinge,
					0.45,
					0.08,
				],
				[
					knock,
					1.3,
					0.72,
				],
			),
			1.4,
		);
	return master(
		reverb(
			body,
			{
				time: 0.4,
				wet: 0.14,
				damping: 0.5,
			},
		),
		-5,
	);
}

const recipes: Record<
	string,
	() => Buffer
> =
	{
		gunshot,
		kick,
		scream,
		laser,
		"enemy-shot":
			enemyShot,
		explosion,
		"tree-break":
			treeBreak,
		"chest-open":
			chestOpen,
	};

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

function toWav(
	data: Buffer,
): Uint8Array {
	const bytes =
		new Uint8Array(
			44 +
				data.length *
					2,
		);
	const view =
		new DataView(
			bytes.buffer,
		);
	const text =
		(
			offset: number,
			value: string,
		) => {
			for (
				let i = 0;
				i <
				value.length;
				i++
			)
				view.setUint8(
					offset +
						i,
					value.charCodeAt(
						i,
					),
				);
		};
	text(
		0,
		"RIFF",
	);
	view.setUint32(
		4,
		36 +
			data.length *
				2,
		true,
	);
	text(
		8,
		"WAVE",
	);
	text(
		12,
		"fmt ",
	);
	view.setUint32(
		16,
		16,
		true,
	);
	view.setUint16(
		20,
		1,
		true,
	);
	view.setUint16(
		22,
		1,
		true,
	);
	view.setUint32(
		24,
		SR,
		true,
	);
	view.setUint32(
		28,
		SR *
			2,
		true,
	);
	view.setUint16(
		32,
		2,
		true,
	);
	view.setUint16(
		34,
		16,
		true,
	);
	text(
		36,
		"data",
	);
	view.setUint32(
		40,
		data.length *
			2,
		true,
	);
	data.forEach(
		(
			v,
			i,
		) => {
			view.setInt16(
				44 +
					i *
						2,
				Math.max(
					-1,
					Math.min(
						1,
						v,
					),
				) *
					32767,
				true,
			);
		},
	);
	return bytes;
}

const requested =
	process.argv.slice(
		2,
	);
const names =
	requested.length >
	0
		? requested
		: Object.keys(
				recipes,
			);
const outputDir =
	join(
		import.meta
			.dir,
		"..",
		"sounds",
	);
const workDir =
	await mkdtemp(
		join(
			tmpdir(),
			"bulbro-sounds-",
		),
	);

try {
	for (const name of names) {
		const recipe =
			recipes[
				name
			];
		if (
			!recipe
		) {
			throw new Error(
				`Unknown sound "${name}". Available: ${Object.keys(recipes).join(", ")}`,
			);
		}
		random =
			createRandom(
				[
					...name,
				].reduce(
					(
						hash,
						c,
					) =>
						Math.imul(
							hash ^
								c.charCodeAt(
									0,
								),
							16777619,
						),
					2166136261,
				),
			);
		const wavPath =
			join(
				workDir,
				`${name}.wav`,
			);
		await Bun.write(
			wavPath,
			toWav(
				recipe(),
			),
		);
		const target =
			join(
				outputDir,
				`${name}.mp3`,
			);
		const ffmpeg =
			Bun.spawnSync(
				[
					"ffmpeg",
					"-y",
					"-loglevel",
					"error",
					"-i",
					wavPath,
					"-ac",
					"1",
					"-ar",
					String(
						SR,
					),
					"-codec:a",
					"libmp3lame",
					"-b:a",
					"160k",
					target,
				],
			);
		if (
			ffmpeg.exitCode !==
			0
		) {
			throw new Error(
				`ffmpeg failed for ${name}: ${ffmpeg.stderr.toString()}`,
			);
		}
		console.log(
			`generated sounds/${name}.mp3`,
		);
	}
} finally {
	await rm(
		workDir,
		{
			recursive: true,
			force: true,
		},
	);
}
