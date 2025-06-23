import { isEqual, zeroPoint } from "../geometry";
import { TouchscreenControl } from "./TouchscreenControl";

const joystickSize = 80;

export const touchscreenControl = new TouchscreenControl(joystickSize);
type Props = {
	scale?: number;
};
export function TouchscreenJoystick() {
	const hasStartedTouch =
		!!touchscreenControl.startPoint &&
		!isEqual(touchscreenControl.startPoint, zeroPoint());
	const joystickPosition = {
		x: touchscreenControl.startPoint.x - joystickSize / 2,
		y: touchscreenControl.startPoint.y - joystickSize / 2,
	};
	const touchpadPosition = {
		x: (touchscreenControl.direction.x * joystickSize) / 2 + joystickSize / 4,
		y: (touchscreenControl.direction.y * joystickSize) / 2 + joystickSize / 4,
	};

	const joystickStyle = {
		width: `${joystickSize}px`,
		height: `${joystickSize}px`,
		left: `${joystickPosition.x}px`,
		top: `${joystickPosition.y}px`,
		display: hasStartedTouch ? "block" : "none",
		borderRadius: `${joystickSize}px`,
	};

	const touchpadStyle = {
		width: `${joystickSize / 2}px`,
		height: `${joystickSize / 2}px`,
		left: `${touchpadPosition.x}px`,
		top: `${touchpadPosition.y}px`,
		borderRadius: `${joystickSize / 2}px`,
	};

	return (
		<div class="joystick" style={joystickStyle}>
			<div class="touchpad" style={touchpadStyle}></div>
		</div>
	);
}
