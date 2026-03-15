import { AudioSettings } from "@/audio/AudioSettings";
import {
	exitFullscreen,
	isFullscreen,
	requestFullscreen,
} from "@/fullscreen";
import { t } from "@/i18n";
import {
	CentralCard,
	MainContainer,
} from "@/ui/Layout";
import { useRouter } from "@/ui/routing";
import { SplashBanner } from "@/ui/Splash";
import { Button } from "@/ui/shadcn/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/ui/shadcn/card";
import { Label } from "@/ui/shadcn/label";

type Props =
	{
		goBack: () => void;
	};

const toggleFullscreen =
	() => {
		if (
			isFullscreen.value
		) {
			requestFullscreen();
		} else {
			exitFullscreen();
		}
	};
export function GameGlobalSettings() {
	const router =
		useRouter();
	return (
		<GameGlobalSettingsLayout
			goBack={
				router.toMainMenu
			}
		/>
	);
}

export function GameGlobalSettingsLayout({
	goBack,
}: Props) {
	return (
		<SplashBanner>
			<MainContainer
				top
				noPadding
			>
				<CentralCard>
					<Card>
						<CardHeader>
							<h2 className="text-xl font-bold">
								{t(
									"settings.title",
								)}
							</h2>
						</CardHeader>
						<CardContent className="grid gap-6">
							<form className="flex flex-col gap-6">
								<AudioSettings />

								<fieldset className="grid gap-3">
									<legend className="text-lg font-semibold mb-2">
										{t(
											"settings.display",
										)}
									</legend>
									<div className="flex items-center gap-3">
										<Button
											id="full-screen"
											type="button"
											className="flex"
											onClick={
												toggleFullscreen
											}
										>
											{!isFullscreen.value
												? t(
														"settings.enterFullscreen",
													)
												: t(
														"settings.exitFullscreen",
													)}
										</Button>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="size-mode">
											{t(
												"settings.sizeFor",
											)}
										</Label>
										<select
											id="size-mode"
											className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
										>
											<option>
												{t(
													"settings.landscape",
												)}
											</option>
											<option>
												{t(
													"settings.portrait",
												)}
											</option>
										</select>
									</div>
								</fieldset>
							</form>
						</CardContent>
						<CardFooter className="flex">
							<Button
								type="button"
								onClick={
									goBack
								}
							>
								{t(
									"settings.backToMenu",
								)}
							</Button>
						</CardFooter>
					</Card>
				</CentralCard>
			</MainContainer>
		</SplashBanner>
	);
}
