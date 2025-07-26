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
import { SplashBanner } from "@/ui/Splash";
import { MainContainer } from "@/ui/Layout";
import { useLocation } from "preact-iso";
import { isTgApp } from "@/tg-app";

export function StartScreen() {
	const location = useLocation();
	const toScreen = (screen: string) => () => {
		location.route(`/${screen}`);
	};
	if (isTgApp.value) {
		location.route("/tg-app");
	}
	return <StartScreenComponent toScreen={toScreen} />;
}

export type Props = {
	toScreen: (screen: string) => () => void;
};

export const StartScreenComponent = ({ toScreen }: Props) => (
	<SplashBanner>
		<MainContainer noPadding top>
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
									<Button variant="secondary" onClick={toScreen("settings")}>
										Settings
									</Button>
								</CardFooter>
							</Card>
						</TabsContent>
						<TabsContent value="online">
							<OnlineGameTab />
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</MainContainer>
	</SplashBanner>
);
