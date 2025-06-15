import { useState } from "preact/hooks";
import type { StartGame } from "./start-game";
import type { GameProcess } from "../GameProcess";
import { bulbros, wellRoundedBulbro } from "../characters-definitions";
import type { Bulbro } from "../bulbro";
import type { Difficulty } from "../game-formulas";
import type { Weapon } from "../weapon";
import { fist, weapons } from "../weapons-definitions";
import { WeaponsSelect } from "./WeaponsSelect";

type Props = {
	startGame: StartGame;
	gameProcess: GameProcess;
};

export function SelectForStart({ startGame, gameProcess }: Props) {
	const [selectedBulbro, selectBulbro] = useState(wellRoundedBulbro);
	const [selectedDifficulty, selectDifficulty] = useState<Difficulty>(0);
	const [selectedWeapons, selectWeapons] = useState<Weapon[]>([fist]);
	const onSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		startGame(gameProcess, selectedBulbro, selectedDifficulty, selectedWeapons);
	};
	return (
		<form onSubmit={onSubmit}>
			<div id="bulbro-select">
				<select name="bulbro" value={selectedBulbro.id}>
					{bulbros.map((bulbro) => (
						<BulbroOption
							value={bulbro}
							onSelect={selectBulbro}
							selected={bulbro.id === selectedBulbro.id}
						/>
					))}
				</select>
			</div>
			<div id="difficulty-select">
				<select name="difficulty" value={selectedDifficulty}>
					{([0, 1, 2, 3, 4, 5] as const).map((difficulty: Difficulty) => (
						<DifficultyOption
							key={difficulty}
							value={difficulty}
							onSelect={selectDifficulty}
							selected={selectedDifficulty === difficulty}
						/>
					))}
				</select>
			</div>
			<div id="weapons-select">
				<WeaponsSelect
					selectedWeapons={selectedWeapons}
					selectWeapons={selectWeapons}
				/>
			</div>
			<button type="submit">Start</button>
		</form>
	);
}

type OptionProps<V> = {
	value: V;
	onSelect: (value: V) => void;
	selected: boolean;
};

export function BulbroOption({
	value,
	onSelect,
	selected,
}: OptionProps<Bulbro>) {
	return (
		<option
			selected={selected}
			value={value.id}
			onSelect={(e) => {
				onSelect(value);
			}}
		>
			{value.name}
		</option>
	);
}

export function DifficultyOption({
	value,
	onSelect,
	selected,
}: OptionProps<Difficulty>) {
	return (
		<option
			value={value}
			selected={selected}
			onSelect={(e) => {
				onSelect(value);
			}}
		>
			{value}
		</option>
	);
}
