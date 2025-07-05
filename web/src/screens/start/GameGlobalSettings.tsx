type Props = {
	goBack: () => void;
};

const toggleFullscreen = () => {
	if (document.fullscreenEnabled) {
		if (!document.fullscreenElement) {
			document.body.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	}
};

export function GameGlobalSettings({ goBack }: Props) {
	return (
		<form>
			<h2>Settings</h2>
			<label>
				Full screen
				<input
					name="full-screen"
					type="checkbox"
					onChange={toggleFullscreen}
					checked={!!document.fullscreenElement}
				/>
			</label>
			<label>
				Size game for:
				<select>
					<option>Landscape</option>
					<option>Portrait</option>
				</select>
			</label>
			<button type="button" onClick={goBack}>
				Back to main menu
			</button>
		</form>
	);
}
