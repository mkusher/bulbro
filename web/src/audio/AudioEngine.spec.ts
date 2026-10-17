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
		async () => {},
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

it("recovers from Safari interruptions on subsequent gestures", () => {
	resume.mockClear();
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
	state =
		"interrupted";
	await audioEngine.resume();
	expect(
		resume,
	).toHaveBeenCalledTimes(
		1,
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
