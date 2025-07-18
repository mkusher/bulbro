import pino from "pino";
import path from "path";

export const logger = pino(
	pino.transport({
		targets: [
			{
				target: "pino-pretty",
			},
		],
	}),
);
