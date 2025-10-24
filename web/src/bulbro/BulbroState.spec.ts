import { describe, it, expect } from "bun:test";
import { BulbroState, spawnBulbro } from "./BulbroState";
import { wellRoundedBulbro } from "../characters-definitions/";
import { zeroPoint } from "@/geometry";

describe("BulbroState", () => {
	it("should instantiate without errors", () => {
		const state = spawnBulbro(
			"test",
			"normal",
			zeroPoint(),
			0,
			0,
			wellRoundedBulbro,
		);
		expect(state).toBeInstanceOf(BulbroState);
	});
});
