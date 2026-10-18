import {
	expect,
	test,
} from "bun:test";
import { requireDefined } from "./requireDefined";

test("required values preserve falsy values and object identity", () => {
	const value =
		{};
	expect(
		requireDefined(
			value,
		),
	).toBe(
		value,
	);
	expect(
		requireDefined(
			0,
		),
	).toBe(
		0,
	);
	expect(
		requireDefined(
			false,
		),
	).toBe(
		false,
	);
	expect(
		requireDefined(
			"",
		),
	).toBe(
		"",
	);
});

test("missing required values fail immediately", () => {
	expect(
		() =>
			requireDefined(
				undefined,
			),
	).toThrow(
		"Expected a defined value",
	);
	expect(
		() =>
			requireDefined(
				null,
			),
	).toThrow(
		"Expected a defined value",
	);
});
