import type { Logger } from "pino";

type NativeMessageHandler<
	T = any,
> =
	(
		e: MessageEvent<T>,
	) => void;

export class WebsocketConnection {
	#url:
		| string
		| URL;
	#logger: Logger;
	#ws!: WebSocket;
	#connectionEstablishmentResolvers!: Partial<
		PromiseWithResolvers<void>
	>;
	#listeners: Array<NativeMessageHandler> =
		[];
	constructor(
		url:
			| URL
			| string,
		logger: Logger,
	) {
		this.#logger =
			logger;
		this.#url =
			url;
		this.#initConnection();
	}

	async connect() {
		if (
			!this
				.#connectionEstablishmentResolvers
		) {
			this.#initConnection();
		}
		return this
			.#connectionEstablishmentResolvers
			.promise;
	}

	reconnect() {
		const p =
			this.connect();
		for (const l of this
			.#listeners) {
			this.#ws.addEventListener(
				"message",
				l,
			);
		}
		return p;
	}

	close() {
		this.#ws.close();
		this.#listeners =
			[];
	}

	onMessage<
		T = string,
	>(
		listener: NativeMessageHandler<T>,
	) {
		this.#listeners.push(
			listener,
		);
		this.#ws.addEventListener(
			"message",
			listener,
		);

		return () => {
			this.#ws.removeEventListener(
				"message",
				listener,
			);
		};
	}

	sendObject(
		message: object,
	) {
		return this.send(
			JSON.stringify(
				message,
			),
		);
	}
	send(
		message: string,
	) {
		if (
			this
				.#connectionEstablishmentResolvers
				.resolve
		) {
			this.#ws.addEventListener(
				"open",
				() => {
					this.#ws.send(
						message,
					);
				},
			);
			return;
		}
		this.#ws.send(
			message,
		);
	}

	#initConnection() {
		this.#connectionEstablishmentResolvers =
			Promise.withResolvers();
		// The socket is opened in the constructor, before callers can await connect().
		// Mark the promise handled even when a caller only queues a message.
		void this.#connectionEstablishmentResolvers.promise?.catch(
			() => {},
		);
		this.#ws =
			new WebSocket(
				this
					.#url,
			);
		this.#ws.addEventListener(
			"error",
			this
				.#onError,
		);
		this.#ws.addEventListener(
			"close",
			this
				.#onClose,
		);
		this.#ws.addEventListener(
			"open",
			this
				.#onOpen,
		);
	}

	#onOpen =
		() => {
			this.#connectionEstablishmentResolvers.resolve?.();
			this.#connectionEstablishmentResolvers.resolve =
				undefined;
			this.#connectionEstablishmentResolvers.reject =
				undefined;
		};

	#onClose =
		() => {
			this.#connectionEstablishmentResolvers.reject?.(
				new Error(
					`WebSocket closed before connecting to ${this.#url}`,
				),
			);
			this.#logger.info(
				"Websocket is getting closed",
			);
			for (const l of this
				.#listeners) {
				this.#ws.removeEventListener(
					"message",
					l,
				);
			}
		};

	#onError =
		(
			ev: Event,
		) => {
			this.#logger.error(
				{
					err: ev,
				},
				"Websocket connection errored",
			);
			if (
				this
					.#connectionEstablishmentResolvers
					.reject
			) {
				this.#connectionEstablishmentResolvers.reject(
					new Error(
						`WebSocket connection failed at ${this.#url}`,
					),
				);
			}
		};
}
