import { MainKeyboardControl } from "./MainKeyboardControl";
import { MultipleControl } from "./MultipleControl";
import { SecondaryKeyboardControl } from "./SecondaryKeyboardControl";
import { touchscreenControl } from "./TouchscreenJoystick";

export { MainKeyboardControl } from "./MainKeyboardControl";
export { MultipleControl } from "./MultipleControl";
export type { PlayerControl } from "./PlayerControl";
export { SecondaryKeyboardControl } from "./SecondaryKeyboardControl";
export { TouchscreenControl } from "./TouchscreenControl";
export {
	TouchscreenJoystick,
	touchscreenControl,
} from "./TouchscreenJoystick";

export const createMainControls =
	({
		wasd = true,
	}: {
		wasd?: boolean;
	} = {}) =>
		new MultipleControl(
			[
				new MainKeyboardControl(),
				...(wasd
					? [
							new SecondaryKeyboardControl(),
						]
					: []),
				touchscreenControl,
			],
		);
