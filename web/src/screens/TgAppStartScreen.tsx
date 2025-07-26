import { Button } from "@/ui/shadcn/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/ui/shadcn/card";
import { SplashBanner } from "@/ui/Splash";
import { MainContainer } from "@/ui/Layout";
import { useEffect, useState } from "preact/hooks";
import { initWebApp, tgUserName } from "@/tg-app";
import { useLocation } from "preact-iso";
import { useRouter } from "@/ui/routing";
import { Loader } from "@/ui/Loading";
import { joinLobby } from "@/network/currentLobby";

export function TgAppStartScreen() {
	const location = useLocation();
	const router = useRouter();
	const toScreen = (screen: string) => () => {
		location.route(`/${screen}`);
	};
	const [isLoading, setIsLoading] = useState(true);
	useEffect(() => {
		initWebApp()
			.then(async (command) => {
				if (command && command.type === "joinlobby") {
					await joinLobby(command.lobbyId, router.toGame);
					router.toSetupOnlineGame();
				}
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, []);

	if (isLoading) {
		return (
			<SplashBanner>
				<MainContainer noPadding top>
					<div className="flex h-screen w-4/5">
						<div className="m-auto w-full flex flex-col gap-6 pb-40">
							<Loader />
						</div>
					</div>
				</MainContainer>
			</SplashBanner>
		);
	}
	return (
		<SplashBanner>
			<MainContainer noPadding top>
				<div className="flex h-screen w-4/5">
					<div className="m-auto w-full flex flex-col gap-6 pb-40">
						<Card>
							<CardHeader>
								<CardTitle>Select game mode</CardTitle>
								<CardDescription>
									<p>Hi, {tgUserName.value}</p>
									<p>Nothing special, just a mode selection</p>
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
									<Button onClick={toScreen("find-lobby")}>
										Start online game
									</Button>
								</div>
								<div className="grid gap-3">
									<Button
										onClick={toScreen("setup-local-co-op-player")}
										variant="outline"
									>
										Start local co-op run
									</Button>
								</div>
							</CardContent>
							<CardFooter>
								<Button variant="secondary" onClick={toScreen("settings")}>
									Settings
								</Button>
							</CardFooter>
						</Card>
					</div>
				</div>
			</MainContainer>
		</SplashBanner>
	);
}
