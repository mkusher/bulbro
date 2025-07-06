import { useState } from "preact/hooks";
import type { StartGame } from "@/ui/start-game";
import { SetupSinglePlayer } from "./start/SetupSinglePlayer";
import { SetupLocalCoOp } from "./start/SetupLocalCoOp";
import { GameGlobalSettings } from "./start/GameGlobalSettings";

import { Button } from "@/ui/shadcn/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/ui/shadcn/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/shadcn/tabs";
import { OnlineGameTab } from "./start/OnlineGameTab";

type Props = {
	startGame: StartGame;
};

export function StartScreen({ startGame }: Props) {
	const [screen, setScreen] = useState("start");
	const toScreen = (screen: string) => () => setScreen(screen);
	if (screen === "setup-single-player") {
		return <SetupSinglePlayer startGame={startGame} />;
	}
	if (screen === "setup-local-co-op-player") {
		return <SetupLocalCoOp startGame={startGame} />;
	}
	if (screen === "game-settings") {
		return <GameGlobalSettings goBack={toScreen("start")} />;
	}
	return (
		<div className="flex h-screen w-4/5">
			<div className="m-auto w-full flex flex-col gap-6 pb-40">
				<Tabs defaultValue="local">
					<TabsList>
						<TabsTrigger value="local">Local</TabsTrigger>
						<TabsTrigger value="online">Online</TabsTrigger>
					</TabsList>
					<TabsContent value="local">
						<Card>
							<CardHeader>
								<CardTitle>Local</CardTitle>
								<CardDescription>
									Nothing special, a local session.
								</CardDescription>
							</CardHeader>
							<CardContent className="grid gap-6">
								<div className="grid gap-3">
									<Button
										onClick={toScreen("setup-single-player")}
										variant="outline"
									>
										Start single player run
									</Button>
								</div>
								<div className="grid gap-3">
									<Button onClick={toScreen("setup-local-co-op-player")}>
										Start local co-op run
									</Button>
								</div>
							</CardContent>
							<CardFooter>
								<Button variant="secondary" onClick={toScreen("game-settings")}>
									Settings
								</Button>
							</CardFooter>
						</Card>
					</TabsContent>
					<TabsContent value="online">
						<OnlineGameTab toScreen={toScreen} />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
