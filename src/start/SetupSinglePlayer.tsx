import { useState } from "preact/hooks";
import type { StartGame } from "./start-game";
import { wellRoundedBulbro } from "../characters-definitions";
import { isDifficulty, type Difficulty } from "../game-formulas";
import type { Weapon } from "../weapon";
import { fist, pistol } from "../weapons-definitions";
import { DifficultyOption } from "./Options";
import { BulbroConfig } from "./BulbroConfig";
import type { CharacterSetup } from "../GameProcess";

type Props = {
	startGame: StartGame;
};

export function SetupSinglePlayer({ startGame }: Props) {
	const [firstBulbro, changeFirstBulbro] = useState<CharacterSetup>({
		bulbro: wellRoundedBulbro,
		sprite: "dark oracle",
	});
	const [selectedDifficulty, selectDifficulty] = useState<Difficulty>(0);
	const [selectedWeapons, selectWeapons] = useState<Weapon[][]>([
		[pistol, fist],
	]);
	const [selectedDuration, setDuration] = useState<number>(60);
	const onSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		startGame(
			[firstBulbro],
			selectedDifficulty,
			selectedWeapons,
			selectedDuration,
		);
	};
	return (
		<form onSubmit={onSubmit}>
			<h2>Start new session</h2>
			<BulbroConfig
				selectBulbro={(bulbro) => changeFirstBulbro({ ...firstBulbro, bulbro })}
				selectedBulbro={firstBulbro.bulbro}
				selectBulbroStyle={(sprite) =>
					changeFirstBulbro({ ...firstBulbro, sprite })
				}
				selectedBulbroStyle={firstBulbro.sprite}
				selectedWeapons={selectedWeapons[0] ?? []}
				selectWeapons={(weapons) => selectWeapons(([w]) => [weapons, w ?? []])}
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
