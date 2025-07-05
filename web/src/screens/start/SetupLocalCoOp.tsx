import { useState } from "preact/hooks";
import type { StartGame } from "@/ui/start-game";
import { wellRoundedBulbro } from "@/characters-definitions";
import { isDifficulty, type Difficulty } from "@/game-formulas";
import type { Weapon } from "@/weapon";
import { smg } from "@/weapons-definitions";
import { DifficultyOption } from "@/ui/Options";
import { BulbroConfig } from "@/ui/BulbroConfig";
import type { CharacterSetup } from "@/GameProcess";

type Props = {
	startGame: StartGame;
};

export function SetupLocalCoOp({ startGame }: Props) {
	const [firstBulbro, changeFirstBulbro] = useState<CharacterSetup>({
		bulbro: wellRoundedBulbro,
		sprite: "dark oracle",
	});
	const [secondBulbro, changeSecondBulbro] = useState<CharacterSetup>({
		bulbro: wellRoundedBulbro,
		sprite: "valkyrie",
	});
	const [selectedDifficulty, selectDifficulty] = useState<Difficulty>(0);
	const [weaponsSetup, setWeaponsSetup] = useState<Weapon[][]>([[smg], [smg]]);
	const [selectedDuration, setDuration] = useState<number>(60);
	const onSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		startGame(
			[firstBulbro, secondBulbro],
			selectedDifficulty,
			weaponsSetup,
			selectedDuration,
		);
	};
	return (
		<form onSubmit={onSubmit}>
			<h2>Start new co-op session</h2>
			<div className="characters">
				<div className="character">
					<BulbroConfig
						selectBulbro={(bulbro) =>
							changeFirstBulbro({ ...firstBulbro, bulbro })
						}
						selectedBulbro={firstBulbro.bulbro}
						selectBulbroStyle={(sprite) =>
							changeFirstBulbro({ ...firstBulbro, sprite })
						}
						selectedBulbroStyle={firstBulbro.sprite}
						selectedWeapons={weaponsSetup[0] ?? []}
						selectWeapons={(weapons) =>
							setWeaponsSetup(([w]) => [weapons, w ?? []])
						}
					/>
				</div>
				<div className="character">
					<BulbroConfig
						selectBulbro={(bulbro) =>
							changeSecondBulbro({ ...secondBulbro, bulbro })
						}
						selectedBulbro={secondBulbro.bulbro}
						selectBulbroStyle={(sprite) =>
							changeSecondBulbro({ ...secondBulbro, sprite })
						}
						selectedBulbroStyle={secondBulbro.sprite}
						selectedWeapons={weaponsSetup[1] ?? []}
						selectWeapons={(weapons) =>
							setWeaponsSetup(([w]) => [w ?? [], weapons])
						}
					/>
				</div>
			</div>
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
