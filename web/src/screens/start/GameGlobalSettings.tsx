import { AudioSettings } from "@/audio/AudioSettings";
import {
	exitFullscreen,
	isFullscreen,
	requestFullscreen,
} from "@/fullscreen";
import { CentralCard } from "@/ui/Layout";
import { useRouter } from "@/ui/routing";
import { Button } from "@/ui/shadcn/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/ui/shadcn/card";
import { Checkbox } from "@/ui/shadcn/checkbox";
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
		<CentralCard>
			<Card>
				<CardHeader>
					<h2 className="text-xl font-bold">
						Settings
					</h2>
				</CardHeader>
				<CardContent className="grid gap-6">
					<form className="flex flex-col gap-6">
						<AudioSettings />

						<fieldset className="grid gap-3">
							<legend className="text-lg font-semibold mb-2">
								Display
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
										? "Enter full scren"
										: "Exit full screen"}
								</Button>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="size-mode">
									Size
									game
									for:
								</Label>
								<select
									id="size-mode"
									className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
								>
									<option>
										Landscape
									</option>
									<option>
										Portrait
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
						Back
						to
						main
						menu
					</Button>
				</CardFooter>
			</Card>
		</CentralCard>
	);
}
