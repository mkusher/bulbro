import { direction, distance, type Direction } from "../geometry";

export type DirectionContainer = {
	direction?: Direction;
};
export function subscribeToTouch(container: DirectionContainer) {
	let startPoint = { x: 0, y: 0 };
	const handleStart = (e: TouchEvent) => {
		const touch = e.touches[0];
		if (!touch) return;
		startPoint.x = touch.clientX;
		startPoint.y = touch.clientY;
	};
	const handleEnd = () => {
		container.direction = undefined;
	};
	const handleCancel = () => {
		container.direction = undefined;
	};
	const minimalDistance = 16;
	const handleMove = (e: TouchEvent) => {
		const touch = e.touches[0];
		if (!touch) return;
		const move = { x: touch.clientX, y: touch.clientY };
		if (distance(startPoint, move) < minimalDistance) {
			return;
		}

		container.direction = direction(startPoint, move);
	};
	window.addEventListener("touchstart", handleStart);
	window.addEventListener("touchend", handleEnd);
	window.addEventListener("touchcancel", handleCancel);
	window.addEventListener("touchmove", handleMove);
}
