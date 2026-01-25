import {
	type SoundName,
	soundUrls,
} from "@/AudioAssets";
import { audioEngine } from "@/audio/AudioEngine";
import {
	audioEnabled,
	bgmEnabled,
	bgmVolume,
	effectsVolume,
	isBgmPlaying,
} from "@/audio/audioState";
import { Button } from "@/ui/shadcn/button";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Label } from "@/ui/shadcn/label";
import { Slider } from "@/ui/shadcn/slider";
import { useEffect } from "preact/hooks";

// Get effect sound names (everything except bgm)
const effectSounds =
	Object.keys(
		soundUrls,
	).filter(
		(
			name,
		) =>
			name !==
			"bgm",
	) as SoundName[];

export function AudioSettings() {
	const handleAudioEnabledChange =
		(
			checked: boolean,
		) => {
			audioEnabled.value =
				checked;
		};

	const handleBgmEnabledChange =
		(
			checked: boolean,
		) => {
			bgmEnabled.value =
				checked;
			// Stop BGM if disabled while playing
			if (
				!checked &&
				audioEngine.isBgmPlaying()
			) {
				audioEngine.stopBgm();
			}
		};

	const handleEffectsVolumeChange =
		(
			value: number[],
		) => {
			const vol =
				value[0];
			if (
				vol !==
				undefined
			) {
				effectsVolume.value =
					vol /
					100;
			}
		};

	const handleBgmVolumeChange =
		(
			value: number[],
		) => {
			const vol =
				value[0];
			if (
				vol !==
				undefined
			) {
				bgmVolume.value =
					vol /
					100;
			}
		};

	const playTestEffect =
		async (
			name: SoundName,
		) => {
			await audioEngine.resume();
			audioEngine.playEffect(
				name,
			);
		};

	const toggleBgm =
		async () => {
			await audioEngine.resume();
			if (
				audioEngine.isBgmPlaying()
			) {
				audioEngine.stopBgm();
			} else {
				audioEngine.playBgm();
			}
		};

	useEffect(() => {
		audioEngine.init();
	}, []);

	return (
		<fieldset className="grid gap-4">
			<legend className="text-lg font-semibold mb-2">
				Audio
			</legend>

			{/* Master Audio Toggle */}
			<div className="flex items-center gap-3">
				<Checkbox
					id="audio-enabled"
					checked={
						audioEnabled.value
					}
					onCheckedChange={
						handleAudioEnabledChange
					}
				/>
				<Label htmlFor="audio-enabled">
					Enable
					Audio
				</Label>
			</div>

			{/* Effects Volume */}
			<div className="grid gap-2">
				<div className="flex items-center justify-between">
					<Label>
						Effects
						Volume
					</Label>
					<span className="text-sm text-muted-foreground">
						{Math.round(
							effectsVolume.value *
								100,
						)}
						%
					</span>
				</div>
				<Slider
					value={[
						effectsVolume.value *
							100,
					]}
					onValueChange={
						handleEffectsVolumeChange
					}
					min={
						0
					}
					max={
						100
					}
					step={
						1
					}
					disabled={
						!audioEnabled.value
					}
				/>
			</div>

			{/* Test Effect Sounds */}
			<div className="grid gap-2">
				<Label>
					Test
					Effects
				</Label>
				<div className="flex flex-wrap gap-2">
					{effectSounds.map(
						(
							name,
						) => (
							<Button
								key={
									name
								}
								type="button"
								variant="outline"
								size="sm"
								onClick={() =>
									playTestEffect(
										name,
									)
								}
								disabled={
									!audioEnabled.value
								}
							>
								{
									name
								}
							</Button>
						),
					)}
				</div>
			</div>

			{/* BGM Toggle */}
			<div className="flex items-center gap-3 mt-2">
				<Checkbox
					id="bgm-enabled"
					checked={
						bgmEnabled.value
					}
					onCheckedChange={
						handleBgmEnabledChange
					}
					disabled={
						!audioEnabled.value
					}
				/>
				<Label htmlFor="bgm-enabled">
					Enable
					Background
					Music
				</Label>
			</div>

			{/* BGM Volume */}
			<div className="grid gap-2">
				<div className="flex items-center justify-between">
					<Label>
						BGM
						Volume
					</Label>
					<span className="text-sm text-muted-foreground">
						{Math.round(
							bgmVolume.value *
								100,
						)}
						%
					</span>
				</div>
				<Slider
					value={[
						bgmVolume.value *
							100,
					]}
					onValueChange={
						handleBgmVolumeChange
					}
					min={
						0
					}
					max={
						100
					}
					step={
						1
					}
					disabled={
						!audioEnabled.value ||
						!bgmEnabled.value
					}
				/>
			</div>

			{/* Test BGM */}
			<div className="grid gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={
						toggleBgm
					}
					disabled={
						!audioEnabled.value ||
						!bgmEnabled.value
					}
				>
					{isBgmPlaying.value
						? "Stop BGM"
						: "Play BGM"}
				</Button>
			</div>
		</fieldset>
	);
}
