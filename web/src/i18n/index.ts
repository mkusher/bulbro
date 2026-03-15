import {
	type Messages,
	type Locale,
	staticLocales,
	dynamicLocales,
} from "./locales";
import {
	computed,
	effect,
	signal,
} from "@preact/signals";
import IntlMessageFormat from "intl-messageformat";
import bel from "./locales/bel";
import en from "./locales/en";
import { logger } from "@/logger";
import { userSettings } from "@/userSettings";

export { languageNames } from "./languages";
export type {
	Locale,
};

export const locale =
	computed(
		() =>
			userSettings
				.value
				.locale,
	);

effect(
	() => {
		if (
			locale.value
		) {
			loadLocale(
				locale.value,
			);
		}
	},
);

export const allLocales =
	[
		...staticLocales,
		...dynamicLocales,
	];

const dictionaries: Record<
	string,
	Messages
> =
	{
		en,
		bel,
	};

const cache =
	new Map<
		string,
		IntlMessageFormat
	>();

function getFormatter(
	key: string,
	loc: string,
): IntlMessageFormat | null {
	const cacheKey = `${loc}:${key}`;
	const cached =
		cache.get(
			cacheKey,
		);
	if (
		cached
	)
		return cached;

	const dict =
		dictionaries[
			loc
		] ??
		dictionaries[
			"en"
		] ??
		undefined;
	const source =
		dict
			? dict[
					key
				]
			: (
					dictionaries[
						"en"
					] as Messages
				)[
					key
				];
	if (
		!source
	)
		return null;

	const mf =
		new IntlMessageFormat(
			source,
			loc,
		);
	cache.set(
		cacheKey,
		mf,
	);
	return mf;
}

export type MessageKey =
	keyof typeof en;

export function t(
	key: MessageKey,
	values?: Record<
		string,
		| string
		| number
	>,
): string {
	const loc =
		locale.value ??
		"en";
	const formatter =
		getFormatter(
			key,
			loc,
		);
	if (
		!formatter
	)
		return key;
	return formatter.format(
		values,
	) as string;
}

export async function loadLocale(
	loc: Locale,
): Promise<void> {
	if (
		dictionaries[
			loc
		]
	)
		return;
	if (
		!dynamicLocales.includes(
			loc,
		)
	) {
		logger.warn(
			`Locale ${loc} is not available for dynamic loading`,
		);
		return;
	}

	const module =
		await import(
			`./locales/${loc}.ts`
		);
	dictionaries[
		loc
	] =
		module.default;

	for (const k of cache.keys()) {
		if (
			k.startsWith(
				`${loc}:`,
			)
		)
			cache.delete(
				k,
			);
	}
}

export function isStaticLocale(
	loc: Locale,
): boolean {
	return staticLocales.includes(
		loc,
	);
}
