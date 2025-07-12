import type { ComponentChildren } from "preact";
import styles from "./layout.module.css";

export function MainContainer({
	children,
	noPadding,
	top,
}: { noPadding?: boolean; top?: boolean; children: ComponentChildren }) {
	const classes = [styles["main-container"], styles["full-viewport"]];
	if (noPadding) {
		classes.push(styles["no-padding"]);
	}
	if (top) {
		classes.push(styles["start-top"]);
	}
	return <div className={classes.join(" ")}>{children}</div>;
}

export function CentralCard({ children }: { children: ComponentChildren }) {
	return (
		<div className="flex h-screen md:w-screen mt-30 md:mt-10 xl:mt-60">
			<div className="m-auto flex flex-col gap-6 pb-40 max-w-screen">
				{children}
			</div>
		</div>
	);
}
