import type { PropsWithChildren } from "preact/compat";
import styles from "./splash.module.css";

export const SplashBanner =
	(
		props: PropsWithChildren,
	) => (
		<div
			className={
				styles[
					"splash-container"
				]
			}
		>
			{
				props.children
			}
		</div>
	);

export const SplashTitle =
	() => (
		<div
			className={
				styles[
					"splash-title"
				]
			}
		></div>
	);
