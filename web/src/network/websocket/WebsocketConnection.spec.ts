import {
	afterEach,
	expect,
	it,
} from "bun:test";
import type { Logger } from "pino";
import { WebsocketConnection } from "./WebsocketConnection";

const nativeWebSocket =
	globalThis.WebSocket;
afterEach(
	() => {
		globalThis.WebSocket =
			nativeWebSocket;
	},
);

it("reports a failed upgrade as a useful error", async () => {
	class FailingWebSocket extends EventTarget {
		static latest: FailingWebSocket;
		constructor(
			_url:
				| string
				| URL,
		) {
			super();
			FailingWebSocket.latest =
				this;
		}
		close() {}
		send(
			_message: string,
		) {}
	}
	globalThis.WebSocket =
		FailingWebSocket as unknown as typeof WebSocket;
	const logger =
		{
			error() {},
			info() {},
		} as unknown as Logger;
	const connection =
		new WebsocketConnection(
			"wss://bulbro.space/ws",
			logger,
		);
	const connected =
		connection.connect();
	FailingWebSocket.latest.dispatchEvent(
		new Event(
			"error",
		),
	);
	await expect(
		connected,
	).rejects.toThrow(
		"WebSocket connection failed at wss://bulbro.space/ws",
	);
});
