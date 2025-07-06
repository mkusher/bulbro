import { MainMenu } from "@/screens/start/MainMenu";
import { SetupSinglePlayer } from "@/screens/start/SetupSinglePlayer";

export default {
	title: "Start screen",
	component: MainMenu,
};

const toScreen = (screen: unknown) => () => {
	console.log(screen);
};

export const Main = {
	render: () => <MainMenu toScreen={toScreen} />,
};

export const SetupSinglePlayerGame = {
	render: () => <SetupSinglePlayer startGame={async () => {}} />,
};
