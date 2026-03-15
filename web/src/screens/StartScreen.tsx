import { useLocation } from "preact-iso";
import { isTgApp } from "@/tg-app";
import { MainMenuComponent } from "./MainMenu";
import { userSettings } from "@/userSettings";
import { LanguageSelectionComponent } from "./LanguageSelection";

export function StartScreen() {
	const locale =
		userSettings
			.value
			.locale;
	const location =
		useLocation();
	const toScreen =
		(
			screen: string,
		) =>
		() => {
			location.route(
				`/${screen}`,
			);
		};
	if (
		!locale
	) {
		return (
			<LanguageSelectionComponent />
		);
	}
	if (
		isTgApp.value
	) {
		location.route(
			"/tg-app",
		);
	}
	return (
		<MainMenuComponent
			toScreen={
				toScreen
			}
		/>
	);
}
