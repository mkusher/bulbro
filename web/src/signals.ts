import {
	effect,
	type Signal,
	signal,
} from "@preact/signals";

export const throttle =
	<
		T,
	>(
		source: Signal<T>,
		timeout: number,
	) => {
		let nextValue =
			source.value;
		let timer: any;
		const throttled =
			signal(
				nextValue,
			);

		effect(
			() => {
				nextValue =
					source.value;
				if (
					!timer
				) {
					timer =
						setTimeout(
							() => {
								timer =
									undefined;
								throttled.value =
									nextValue;
							},
							timeout,
						);
				}
			},
		);

		return throttled;
	};
