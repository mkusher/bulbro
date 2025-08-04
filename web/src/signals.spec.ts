import { signal } from "@preact/signals";
import { throttle } from "./signals";
import { it, expect } from "bun:test";
import { sleep } from "bun";

it("starts with the same value as source", async () => {
	const source = signal(0);
	const throttled = throttle(source, 5);
	expect(throttled.value).toEqual(0);
});

it("emits on source change", async () => {
	const source = signal(0);
	const throttled = throttle(source, 5);
	source.value = 1;
	expect(throttled.value).toEqual(0);
	await sleep(6);
	expect(throttled.value).toEqual(1);
});

it("skips source change if another happened during timeout", async () => {
	const source = signal(0);
	const throttled = throttle(source, 5);
	source.value = 1;
	expect(throttled.value).toEqual(0);
	await sleep(1);
	expect(throttled.value).toEqual(0);
	source.value = 2;
	await sleep(1);
	expect(throttled.value).toEqual(0);
	await sleep(4);
	expect(throttled.value).toEqual(2);
});
