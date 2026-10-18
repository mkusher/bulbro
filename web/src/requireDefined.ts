/** Return a required value, failing immediately when a state invariant is broken. */
export function requireDefined<
	T,
>(
	value:
		| T
		| null
		| undefined,
): T {
	if (
		value ===
			null ||
		value ===
			undefined
	) {
		throw new Error(
			"Expected a defined value",
		);
	}
	return value;
}
