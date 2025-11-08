import pino from "pino";

const level =
	"info";

type LogRecord =
	{
		level: number;
		msg: string;
		time: number;
	};
const levels =
	{
		30: "log",
	};
/**
 * Default application logger.
 */
export const logger =
	pino(
		{
			level,
			browser:
				{
					write(
						o,
					) {
						try {
							const {
								level,
								msg,
								time,
								...rest
							} =
								o as LogRecord;
							const logTime =
								new Date();
							logTime.setTime(
								time,
							);
							let formatted =
								Object.keys(
									rest,
								)
									.map(
										(
											key,
										) =>
											`${String(key)}=${safeStringify(rest[key as keyof typeof rest])}`,
									)
									.join(
										", ",
									);
							if (
								formatted
							) {
								formatted = ` <${formatted}>`;
							}
							console.log(
								`${logTime.toISOString()} ${level} ${msg}${formatted}`,
								{
									params:
										rest,
								},
							);
						} catch (error) {
							console.error(
								"Failed to write log",
								error,
							);
						}
					},
				},
		},
	);

export type { Logger } from "pino";

function safeStringify(
	value: unknown,
) {
	try {
		return JSON.stringify(
			value,
		);
	} catch (e) {
		return "[Non-serializible value]";
	}
}
