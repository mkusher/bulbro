import { LanguageSelection } from "@/screens/LanguageSelection";

export default {
	title:
		"Screens/Language selection",
	component:
		LanguageSelection,
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
				<LanguageSelection />
			),
	};
