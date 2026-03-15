import { t } from "@/i18n";
import { MainContainer } from "@/ui/Layout";
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
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/ui/shadcn/tabs";
import { OnlineGameTab } from "./start/OnlineGameTab";

export type Props =
	{
		toScreen: (
			screen: string,
		) => () => void;
	};

export const MainMenuComponent =
	({
		toScreen,
	}: Props) => (
		<SplashBanner>
			<MainContainer
				noPadding
				top
			>
				<div className="flex h-screen w-4/5">
					<div className="m-auto w-full flex flex-col items-center gap-6 pb-40">
						<SplashTitle />
						<Tabs defaultValue="local">
							<TabsList>
								<TabsTrigger value="local">
									{t(
										"start.tab.local",
									)}
								</TabsTrigger>
								<TabsTrigger value="online">
									{t(
										"start.tab.online",
									)}
								</TabsTrigger>
							</TabsList>
							<TabsContent value="local">
								<Card>
									<CardHeader>
										<CardTitle>
											{t(
												"start.local.title",
											)}
										</CardTitle>
										<CardDescription>
											{t(
												"start.local.description",
											)}
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
													"setup-local-co-op-player",
												)}
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
