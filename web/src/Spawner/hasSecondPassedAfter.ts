import type {
	DeltaTime,
	NowTime,
} from "@/time";

export const hasSecondPassedAfter =
	(
		now: NowTime,
		deltaTime: DeltaTime,
	) => {
		const currentSecond =
			Math.floor(
				now /
					1000,
			);
		const previousSecond =
			Math.floor(
				(now -
					deltaTime) /
					1000,
			);
		const hasSecondPassed =
			currentSecond -
				previousSecond >
			0;
		return {
			hasSecondPassed,
			currentSecond,
		};
	};
