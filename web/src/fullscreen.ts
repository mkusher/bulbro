import {
	computed,
	signal,
} from "@preact/signals";
import {
	isFullscreen as isTgFullscreen,
	requestFullscreen as requestTgFullscreen,
	exitFullscreen as exitTgFullscreen,
	isTgApp,
} from "./tg-app/";

const isDocumentFullscreen =
	signal(
		!!document.fullscreenElement,
	);

export const isFullscreen =
	computed(
		() => {
			if (
				isTgApp.value
			) {
				return isTgFullscreen.value;
			}
			return isDocumentFullscreen.value;
		},
	);

export const requestFullscreen =
	async () => {
		if (
			isTgApp.value
		) {
			return requestTgFullscreen();
		}
		await document.body.requestFullscreen();
		isDocumentFullscreen.value =
			!!document.fullscreenElement;
	};

export const exitFullscreen =
	async () => {
		if (
			isTgApp.value
		) {
			return exitTgFullscreen();
		}
		await document.exitFullscreen();
		isDocumentFullscreen.value =
			!!document.fullscreenElement;
	};
