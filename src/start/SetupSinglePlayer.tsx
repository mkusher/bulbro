import { useState } from "preact/hooks";
import type { StartGame } from "./start-game";
import { wellRoundedBulbro } from "../characters-definitions";
import { isDifficulty, type Difficulty } from "../game-formulas";
import type { Weapon } from "../weapon";
import { fist } from "../weapons-definitions";
import { type SpriteType } from "../bulbro/Sprite";
import { DifficultyOption } from "./Options";
import { BulbroConfig } from "./BulbroConfig";

type Props = {
	startGame: StartGame;
};

export function SetupSinglePlayer({ startGame }: Props) {
	const [selectedBulbro, selectBulbro] = useState(wellRoundedBulbro);
	const [selectedBulbroStyle, selectBulbroStyle] =
		useState<SpriteType>("dark oracle");
	const [selectedDifficulty, selectDifficulty] = useState<Difficulty>(0);
	const [selectedWeapons, selectWeapons] = useState<Weapon[]>([fist]);
	const [selectedDuration, setDuration] = useState<number>(60);
	const onSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		startGame(
			[
				{
					bulbro: selectedBulbro,
					sprite: selectedBulbroStyle,
				},
			],
			selectedDifficulty,
			[selectedWeapons],
			selectedDuration,
		);
	};
	return (
		<form onSubmit={onSubmit}>
			<h2>Start new session</h2>
			<BulbroConfig
				selectBulbro={selectBulbro}
				selectedBulbro={selectedBulbro}
				selectBulbroStyle={selectBulbroStyle}
				selectedBulbroStyle={selectedBulbroStyle}
				selectedWeapons={selectedWeapons}
				selectWeapons={selectWeapons}
			/>
			<div id="difficulty-select">
				<label>
					Difficulty:
					<select
						name="difficulty"
						value={selectedDifficulty}
						onChange={(e) => {
							const newValue = Number(e.currentTarget.value);
							if (isDifficulty(newValue)) {
								selectDifficulty(newValue);
							}
						}}
					>
						{([0, 1, 2, 3, 4, 5] as const).map((difficulty: Difficulty) => (
							<DifficultyOption
								key={difficulty}
								value={difficulty}
								selected={selectedDifficulty === difficulty}
							/>
						))}
					</select>
				</label>
			</div>
			<div id="duration">
				<label>
					Wave duration:
					<input
						type="number"
						value={selectedDuration}
						onChange={(e) => {
							setDuration(Number(e.currentTarget.value));
						}}
					/>
				</label>
			</div>
			<button type="submit">Start</button>
		</form>
	);
}
