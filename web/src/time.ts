export type NowTime =
	number & {
		readonly __brand: "NowTime";
	};
export type DeltaTime =
	number & {
		readonly __brand: "DeltaTime";
	};

export const nowTime =
	(
		value: number,
	): NowTime =>
		value as NowTime;
export const deltaTime =
	(
		value: number,
	): DeltaTime =>
		value as DeltaTime;

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
