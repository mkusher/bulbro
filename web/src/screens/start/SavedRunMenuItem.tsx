import { resumeLocalGame } from "@/currentGameProcess";
import { t } from "@/i18n";
import { loadSinglePlayerGame } from "@/singlePlayerSave";
import { Button } from "@/ui/shadcn/button";

export function SavedRunMenuItem({
	toGame,
}: {
	toGame: () => void;
}) {
	const savedGame =
		loadSinglePlayerGame();
	if (
		!savedGame
	)
		return null;
	return (
		<Button
			autoFocus
			onClick={() => {
				void resumeLocalGame();
				toGame();
			}}
		>
			{t(
				"start.local.resume",
				{
					wave: savedGame
						.state
						.round
						.wave,
				},
			)}
		</Button>
	);
}
