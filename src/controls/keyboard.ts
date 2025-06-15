export type ArrowKeys = {
	up?: boolean;
	left?: boolean;
	right?: boolean;
	down?: boolean;
};
export function keysToDirection(keys: ArrowKeys) {
	return {
		x: Number(!!keys.right) - Number(!!keys.left),
		y: Number(!!keys.down) - Number(!!keys.up),
	};
}

const codeToArrow = (code: string) => {
	if (code === "ArrowUp") return "up";
	if (code === "ArrowDown") return "down";
	if (code === "ArrowLeft") return "left";
	if (code === "ArrowRight") return "right";
};

export function subscribeToKeyboard(keys: ArrowKeys) {
	window.addEventListener("keydown", (e) => {
		const arrow = codeToArrow(e.code);
		if (!arrow) return;
		keys[arrow] = true;
	});
	window.addEventListener("keyup", (e) => {
		const arrow = codeToArrow(e.code);
		if (!arrow) return;
		keys[arrow] = false;
	});
}
