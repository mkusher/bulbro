import { MainKeyboardControl } from "./MainKeyboardControl";
import { touchscreenControl } from "./TouchscreenJoystick";
import { MultipleControl } from "./MultipleControl";
export { MainKeyboardControl } from "./MainKeyboardControl";
export { TouchscreenControl } from "./TouchscreenControl";
export { MultipleControl } from "./MultipleControl";
export type { PlayerControl } from "./PlayerControl";
export { TouchscreenJoystick, touchscreenControl } from "./TouchscreenJoystick";
export { SecondaryKeyboardControl } from "./SecondaryKeyboardControl";

export const createMainControls = () =>
	new MultipleControl([new MainKeyboardControl(), touchscreenControl]);
