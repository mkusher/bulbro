import { useState } from "preact/hooks";
import type { StartGame } from "./start-game";
import type { GameProcess } from "../GameProcess";
import { bulbros, wellRoundedBulbro } from "../characters-definitions";
import type { Bulbro } from "../bulbro";
import type { Difficulty } from "../game-formulas";
import type { Weapon } from "../weapon";
import { fist } from "../weapons-definitions";
import { WeaponsSelect } from "./WeaponsSelect";

type Props = {
	startGame: StartGame;
	gameProcess: GameProcess;
};

export function SelectForStart({ startGame, gameProcess }: Props) {
	const [selectedBulbro, selectBulbro] = useState(wellRoundedBulbro);
	const [selectedDifficulty, selectDifficulty] = useState<Difficulty>(0);
	const [selectedWeapons, selectWeapons] = useState<Weapon[]>([fist]);
	const [selectedDuration, setDuration] = useState<number>(60);
	const onSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		startGame(
			gameProcess,
			selectedBulbro,
			selectedDifficulty,
			selectedWeapons,
			selectedDuration,
		);
	};
	return (
		<form onSubmit={onSubmit}>
			<h1>Start new BulBro session</h1>
			<div id="bulbro-select">
				<label>
					BulBro:
					<select name="bulbro" value={selectedBulbro.id}>
						{bulbros.map((bulbro) => (
							<BulbroOption
								value={bulbro}
								onSelect={selectBulbro}
								selected={bulbro.id === selectedBulbro.id}
							/>
						))}
					</select>
				</label>
			</div>
			<div id="difficulty-select">
				<label>
					Difficulty:
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
				</label>
			</div>
			<div id="weapons-select">
				<WeaponsSelect
					selectedWeapons={selectedWeapons}
					selectWeapons={selectWeapons}
				/>
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
