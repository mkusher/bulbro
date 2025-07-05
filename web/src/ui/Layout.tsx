import type { PropsWithChildren } from "preact/compat";
import styles from "./layout.module.css";

export function MainContainer({
	children,
	noPadding,
	top,
}: PropsWithChildren<{ noPadding?: boolean; top?: boolean }>) {
	const classes = [styles["main-container"], styles["full-viewport"]];
	if (noPadding) {
		classes.push(styles["no-padding"]);
	}
	if (top) {
		classes.push(styles["start-top"]);
	}
	return <div className={classes.join(" ")}>{children}</div>;
}
