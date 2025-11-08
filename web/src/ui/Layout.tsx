import type { ComponentChildren } from "preact";
import styles from "./layout.module.css";

export function MainContainer({
	children,
	noPadding,
	top,
}: {
	noPadding?: boolean;
	top?: boolean;
	children: ComponentChildren;
}) {
	const classes =
		[
			styles[
				"main-container"
			],
			styles[
				"full-viewport"
			],
		];
	if (
		noPadding
	) {
		classes.push(
			styles[
				"no-padding"
			],
		);
	}
	if (
		top
	) {
		classes.push(
			styles[
				"start-top"
			],
		);
	}
	return (
		<div
			className={classes.join(
				" ",
			)}
		>
			{
				children
			}
		</div>
	);
}

export function CentralCard({
	children,
}: {
	children: ComponentChildren;
}) {
	return (
		<div className="flex w-full px-4 py-8 md:px-8 lg:px-16 xl:px-24">
			<div className="m-auto flex flex-col gap-4 mb-8 md:gap-6 lg:gap-8 w-full max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl">
				{
					children
				}
			</div>
		</div>
	);
}
