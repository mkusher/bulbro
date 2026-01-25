import { soundUrls } from "@/AudioAssets";
import { CentralCard } from "@/ui/Layout";
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
			document.fullscreenEnabled
		) {
			if (
				!document.fullscreenElement
			) {
				document.body.requestFullscreen();
			} else {
				document.exitFullscreen();
			}
		}
	};

export function GameGlobalSettings({
	goBack,
}: Props) {
	return (
		<CentralCard>
			<Card>
				<CardHeader>
					<h2>
						Settings
					</h2>
				</CardHeader>
				<CardContent className="grid gap-6">
					<form className="flex flex-col gap-3">
						<fieldset className="grid gap-3">
							<legend>
								Audio
							</legend>
							{Object.entries(
								soundUrls,
							).map(
								([
									name,
									url,
								]) => (
									<div
										key={
											name
										}
										className="grid gap-1"
									>
										<div className="text-sm font-medium">
											{
												name
											}
										</div>
										<audio
											controls
											preload="auto"
											src={
												url
											}
											data-sound={
												name
											}
										/>
									</div>
								),
							)}
						</fieldset>
						<div className="gap-3">
							<Label htmlFor="full-screen">
								Full
								screen
							</Label>
							<Checkbox
								name="full-screen"
								onChange={
									toggleFullscreen
								}
								checked={
									!!document.fullscreenElement
								}
							/>
						</div>
						<div className="gap-3">
							<Label>
								Size
								game
								for:
							</Label>
							<select>
								<option>
									Landscape
								</option>
								<option>
									Portrait
								</option>
							</select>
						</div>
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
