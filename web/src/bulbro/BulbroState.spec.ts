import {
	describe,
	expect,
	it,
} from "bun:test";
import { zeroPoint } from "@/geometry";
import { wellRoundedBulbro } from "../characters-definitions/";
import {
	BulbroState,
	spawnBulbro,
} from "./BulbroState";

describe("BulbroState", () => {
	it("should instantiate without errors", () => {
		const state =
			spawnBulbro(
				"test",
				"normal",
				zeroPoint(),
				0,
				0,
				wellRoundedBulbro,
			);
		expect(
			state,
		).toBeInstanceOf(
			BulbroState,
		);
	});
});
