import pino from "pino";

const minLevel =
	localStorage.getItem(
		"min_log_level",
	) ??
	"info";

type LogRecord =
	{
		level: number;
		msg: string;
		time: number;
	};
const levels: Record<
	number,
	| string
	| undefined
> =
	{
		10: "trace",
		20: "debug",
		30: "info",
		40: "warn",
		50: "error",
		60: "fatal",
	};
/**
 * Default application logger.
 */
export const logger =
	pino(
		{
			level:
				minLevel,
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
							const levelName =
								levels[
									level
								] ??
								level;
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
								`${logTime.toISOString()} ${levelName} ${msg}${formatted}`,
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
