import { mkdirSync } from "node:fs";
import path from "node:path";
import pino from "pino";

const logPath =
	path.resolve(
		import.meta
			.dir,
		"../var/dev.log",
	);
mkdirSync(
	path.dirname(
		logPath,
	),
	{
		recursive: true,
	},
);

export const logger =
	pino(
		pino.transport(
			{
				targets:
					[
						{
							target:
								"pino/file",
							options:
								{
									destination:
										logPath,
								},
						},

						{
							target:
								"pino-pretty",
						},
					],
			},
		),
	);
