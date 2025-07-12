import type { PlayerControl } from "@/controls";
import { zeroPoint } from "@/geometry";

export class RemoteRepeatLastKnownDirectionControl implements PlayerControl {
	constructor() {}

	async start() {}

	async stop() {}

	getDirection() {
		return zeroPoint();
	}
}
