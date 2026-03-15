export type Messages =
	Record<
		string,
		string
	>;

export type Locale =
	| "en"
	| "bel"
	| "pol"
	| "ukr";

export const staticLocales: Locale[] =
	[
		"bel",
		"en",
	];
export const dynamicLocales: Locale[] =
	[
		"pol",
		"ukr",
	];
