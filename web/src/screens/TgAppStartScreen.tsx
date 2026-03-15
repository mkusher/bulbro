import {
	useEffect,
	useState,
} from "preact/hooks";
import { useLocation } from "preact-iso";
import { t } from "@/i18n";
import { joinLobby } from "@/network/currentLobby";
import {
	initWebApp,
	tgUserName,
} from "@/tg-app";
import { MainContainer } from "@/ui/Layout";
import { Loader } from "@/ui/Loading";
import { useRouter } from "@/ui/routing";
import {
	SplashBanner,
	SplashTitle,
} from "@/ui/Splash";
import { Button } from "@/ui/shadcn/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/ui/shadcn/card";

export function TgAppStartScreen() {
	const location =
		useLocation();
	const router =
		useRouter();
	const toScreen =
		(
			screen: string,
		) =>
		() => {
			location.route(
				`/${screen}`,
			);
		};
	const [
		isLoading,
		setIsLoading,
	] =
		useState(
			true,
		);
	useEffect(() => {
		initWebApp()
			.then(
				async (
					command,
				) => {
					if (
						command &&
						command.type ===
							"joinlobby"
					) {
						await joinLobby(
							command.lobbyId,
							router.toGame,
						);
						router.toSetupOnlineGame();
					}
				},
			)
			.finally(
				() => {
					setIsLoading(
						false,
					);
				},
			);
	}, []);

	if (
		isLoading
	) {
		return (
			<SplashBanner>
				<MainContainer
					noPadding
					top
				>
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
			<MainContainer
				noPadding
				top
			>
				<div className="flex h-screen w-4/5">
					<div className="m-auto w-full flex flex-col items-center gap-6 pb-40">
						<SplashTitle />
						<Card>
							<CardHeader>
								<CardTitle>
									{t(
										"tgApp.selectMode",
									)}
								</CardTitle>
								<CardDescription>
									<p>
										{t(
											"greeting",
											{
												username:
													tgUserName.value,
											},
										)}
									</p>
									<p>
										{t(
											"tgApp.modeDescription",
										)}
									</p>
								</CardDescription>
							</CardHeader>
							<CardContent className="grid gap-6">
								<div className="grid gap-3">
									<Button
										onClick={toScreen(
											"setup-single-player",
										)}
										variant="outline"
									>
										{t(
											"start.local.singlePlayer",
										)}
									</Button>
								</div>
								<div className="grid gap-3">
									<Button
										onClick={toScreen(
											"find-lobby",
										)}
									>
										{t(
											"online.title",
										)}
									</Button>
								</div>
								<div className="grid gap-3">
									<Button
										onClick={toScreen(
											"setup-local-co-op-player",
										)}
										variant="outline"
									>
										{t(
											"start.local.coOp",
										)}
									</Button>
								</div>
							</CardContent>
							<CardFooter>
								<Button
									variant="secondary"
									onClick={toScreen(
										"settings",
									)}
								>
									{t(
										"start.settings",
									)}
								</Button>
							</CardFooter>
						</Card>
					</div>
				</div>
			</MainContainer>
		</SplashBanner>
	);
}
