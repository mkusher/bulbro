import { StartScreen } from "@/screens/StartScreen";

export default {
	title:
		"Screens/Start screen",
	component:
		StartScreen,
};

const toScreen =
	(
		screen: unknown,
	) =>
	() => {
		console.log(
			screen,
		);
	};

export const Main =
	{
		render:
			() => (
				<StartScreen />
			),
	};
