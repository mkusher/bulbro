import path from "path";
import pino from "pino";

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
										path.resolve(
											import.meta
												.dir,
											"../var/dev.log",
										),
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
