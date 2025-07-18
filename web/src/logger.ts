import pino from "pino";

const level = "info";

/**
 * Default application logger.
 */
export const logger = pino({ level });

export { type Logger } from "pino";
