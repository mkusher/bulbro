import {
	afterAll,
	expect,
	it,
	mock,
} from "bun:test";
import { audioEngine } from "./AudioEngine";

const originalAudioContext =
	Object.getOwnPropertyDescriptor(
		globalThis,
		"AudioContext",
	);
const originalFetch =
	globalThis.fetch;
let state =
	"suspended";
const resume =
	mock(
		async () => {
			state =
				"running";
		},
	);
const suspend =
	mock(
		async () => {
			state =
				"suspended";
		},
	);
const silentBuffer =
	{};
const start =
	mock(
		() => {},
	);
const disconnect =
	mock(
		() => {},
	);
const connect =
	mock(
		(
			_destination: unknown,
		) => {},
	);
const sources: {
	buffer: unknown;
	connect: typeof connect;
	start: typeof start;
	disconnect: typeof disconnect;
	onended:
		| (() => void)
		| null;
}[] =
	[];
const createBuffer =
	mock(
		(
			_channels: number,
			_length: number,
			_sampleRate: number,
		) =>
			silentBuffer,
	);
let finishDecoding!: () => void;
const decoding =
	new Promise<void>(
		(
			resolve,
		) => {
			finishDecoding =
				resolve;
		},
	);
const context =
	{
		get state() {
			return state;
		},
		resume,
		suspend,
		sampleRate: 48000,
		createBuffer,
		createBufferSource:
			() => {
				const source =
					{
						buffer:
							null as unknown,
						connect,
						start,
						disconnect,
						onended:
							null as
								| (() => void)
								| null,
					};
				sources.push(
					source,
				);
				return source;
			},
		destination:
			{},
		createGain:
			() => ({
				gain: {
					value: 1,
				},
				connect() {},
			}),
		decodeAudioData:
			async () => {
				await decoding;
				return {
					duration: 10,
				};
			},
	};

afterAll(
	() => {
		globalThis.fetch =
			originalFetch;
		if (
			originalAudioContext
		) {
			Object.defineProperty(
				globalThis,
				"AudioContext",
				originalAudioContext,
			);
		} else {
			Reflect.deleteProperty(
				globalThis,
				"AudioContext",
			);
		}
	},
);

it("unlocks audio synchronously from a tap while audio is still preloading", async () => {
	const createContext =
		mock(
			() =>
				context,
		);
	Object.defineProperty(
		globalThis,
		"AudioContext",
		{
			configurable: true,
			value:
				createContext,
		},
	);
	globalThis.fetch =
		mock(
			async () =>
				new Response(
					new ArrayBuffer(
						1,
					),
				),
		) as unknown as typeof fetch;
	const firstInit =
		audioEngine.init();
	const secondInit =
		audioEngine.init();
	document.dispatchEvent(
		new Event(
			"touchend",
			{
				bubbles: true,
			},
		),
	);
	expect(
		resume,
	).toHaveBeenCalledTimes(
		1,
	);
	expect(
		createContext,
	).toHaveBeenCalledTimes(
		1,
	);
	expect(
		createBuffer,
	).toHaveBeenCalledWith(
		1,
		1,
		48000,
	);
	expect(
		sources[0]
			?.buffer,
	).toBe(
		silentBuffer,
	);
	expect(
		connect,
	).toHaveBeenCalledWith(
		context.destination,
	);
	expect(
		start,
	).toHaveBeenCalledWith(
		0,
	);
	expect(
		disconnect,
	).not.toHaveBeenCalled();
	sources[0]?.onended?.();
	expect(
		disconnect,
	).toHaveBeenCalledTimes(
		1,
	);
	finishDecoding();
	await Promise.all(
		[
			firstInit,
			secondInit,
		],
	);
	globalThis.fetch =
		originalFetch;
});

it("recovers from Safari interruptions on subsequent gestures", async () => {
	resume.mockClear();
	suspend.mockClear();
	start.mockClear();
	state =
		"interrupted";
	document.dispatchEvent(
		new Event(
			"click",
			{
				bubbles: true,
			},
		),
	);
	await audioEngine.resume();
	state =
		"interrupted";
	document.dispatchEvent(
		new Event(
			"touchend",
			{
				bubbles: true,
			},
		),
	);
	await audioEngine.resume();
	expect(
		suspend,
	).toHaveBeenCalledTimes(
		2,
	);
	expect(
		start,
	).toHaveBeenCalledTimes(
		2,
	);
});

it("resumes interrupted audio through the public API", async () => {
	resume.mockClear();
	suspend.mockClear();
	state =
		"interrupted";
	await audioEngine.resume();
	expect(
		suspend,
	).toHaveBeenCalledTimes(
		1,
	);
	expect(
		resume,
	).toHaveBeenCalledTimes(
		1,
	);
});

it("cycles a context still reporting running after screen lock without replacing it", async () => {
	const originalVisibility =
		Object.getOwnPropertyDescriptor(
			document,
			"visibilityState",
		);
	const originalContext =
		audioEngine.getContext();
	let visibility =
		"hidden";
	Object.defineProperty(
		document,
		"visibilityState",
		{
			configurable: true,
			get: () =>
				visibility,
		},
	);
	try {
		state =
			"running";
		resume.mockClear();
		suspend.mockClear();
		document.dispatchEvent(
			new Event(
				"visibilitychange",
			),
		);
		await audioEngine.resume();
		expect(
			resume,
		).not.toHaveBeenCalled();
		expect(
			suspend,
		).not.toHaveBeenCalled();
		visibility =
			"visible";
		document.dispatchEvent(
			new Event(
				"visibilitychange",
			),
		);
		await audioEngine.resume();
		expect(
			suspend,
		).toHaveBeenCalledTimes(
			1,
		);
		expect(
			resume,
		).toHaveBeenCalled();
		expect(
			audioEngine.getContext(),
		).toBe(
			originalContext,
		);
		window.dispatchEvent(
			new Event(
				"focus",
			),
		);
		window.dispatchEvent(
			new Event(
				"pageshow",
			),
		);
		await audioEngine.resume();
		expect(
			suspend,
		).toHaveBeenCalledTimes(
			1,
		);
		start.mockClear();
		document.dispatchEvent(
			new Event(
				"touchend",
			),
		);
		expect(
			start,
		).toHaveBeenCalledTimes(
			1,
		);
		sources
			.at(
				-1,
			)
			?.onended?.();
	} finally {
		if (
			originalVisibility
		)
			Object.defineProperty(
				document,
				"visibilityState",
				originalVisibility,
			);
		else
			Reflect.deleteProperty(
				document,
				"visibilityState",
			);
	}
});

it("retries recovery if suspension fails", async () => {
	state =
		"interrupted";
	suspend.mockRejectedValueOnce(
		new Error(
			"Audio device unavailable",
		),
	);
	await expect(
		audioEngine.resume(),
	).rejects.toThrow(
		"Audio device unavailable",
	);
	await audioEngine.resume();
	expect(
		state,
	).toBe(
		"running",
	);
});

it("keeps gesture resume synchronous while a single recovery is pending", async () => {
	state =
		"interrupted";
	resume.mockClear();
	suspend.mockClear();
	let finishSuspending!: () => void;
	suspend.mockImplementationOnce(
		() =>
			new Promise<void>(
				(
					resolve,
				) => {
					finishSuspending =
						() => {
							state =
								"suspended";
							resolve();
						};
				},
			),
	);
	const recovery =
		audioEngine.resume();
	const gesture =
		audioEngine.resume();
	expect(
		suspend,
	).toHaveBeenCalledTimes(
		1,
	);
	expect(
		resume,
	).toHaveBeenCalledTimes(
		1,
	);
	finishSuspending();
	await Promise.all(
		[
			recovery,
			gesture,
		],
	);
	expect(
		suspend,
	).toHaveBeenCalledTimes(
		1,
	);
	expect(
		state,
	).toBe(
		"running",
	);
});

it("does not resume running or closed contexts", async () => {
	resume.mockClear();
	start.mockClear();
	for (const nextState of [
		"running",
		"closed",
	]) {
		state =
			nextState;
		await audioEngine.resume();
		document.dispatchEvent(
			new Event(
				"keydown",
				{
					bubbles: true,
				},
			),
		);
	}
	expect(
		resume,
	).not.toHaveBeenCalled();
	expect(
		start,
	).not.toHaveBeenCalled();
});
