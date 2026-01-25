import { GameGlobalSettingsLayout } from "@/screens/start/GameGlobalSettings";

export default {
	title:
		"Screens/GameGlobalSettings",
	component:
		GameGlobalSettingsLayout,
};

export const Default =
	{
		render:
			() => (
				<GameGlobalSettingsLayout
					goBack={() => {
						console.log(
							"Go back clicked",
						);
					}}
				/>
			),
	};
