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
import { useEffect } from "preact/hooks";
import { fetchWebApp, tgUserName } from "@/tg-app";
import { useLocation } from "preact-iso";

export function TgAppStartScreen() {
	const location = useLocation();
	const toScreen = (screen: string) => () => {
		location.route(`/${screen}`);
	};
	useEffect(() => {
		fetchWebApp();
	}, []);
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
									<Button onClick={toScreen("setup-local-co-op-player")}>
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
