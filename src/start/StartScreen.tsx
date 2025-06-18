import { useState } from "preact/hooks";
import type { StartGame } from "./start-game";
import type { GameProcess } from "../GameProcess";
import { bulbros, wellRoundedBulbro } from "../characters-definitions";
import type { Bulbro } from "../bulbro";
import { isDifficulty, type Difficulty } from "../game-formulas";
import type { Weapon } from "../weapon";
import { fist } from "../weapons-definitions";
import { WeaponsSelect } from "./WeaponsSelect";
import type { SpriteType } from "../bulbro/Sprite";

type Props = {
	startGame: StartGame;
	gameProcess: GameProcess;
};

const bulbrosStyles: SpriteType[] = ["soldier", "shooter", "dark oracle"];

export function StartScreen({ startGame, gameProcess }: Props) {
	const [selectedBulbro, selectBulbro] = useState(wellRoundedBulbro);
	const [selectedBulbroStyle, selectBulbroStyle] =
		useState<SpriteType>("dark oracle");
	const [selectedDifficulty, selectDifficulty] = useState<Difficulty>(0);
	const [selectedWeapons, selectWeapons] = useState<Weapon[]>([fist]);
	const [selectedDuration, setDuration] = useState<number>(60);
	const onSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		startGame(
			gameProcess,
			selectedBulbro,
			selectedBulbroStyle,
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
					BulBro Class:
					<select
						name="bulbro"
						value={selectedBulbro.id}
						onChange={(e) => {
							const found = bulbros.find((b) => b.id === e.currentTarget.value);
							if (found) {
								selectBulbro(found);
							}
						}}
					>
						{bulbros.map((bulbro) => (
							<BulbroOption
								value={bulbro}
								selected={bulbro.id === selectedBulbro.id}
							/>
						))}
					</select>
				</label>
			</div>
			<div id="bulbro-style-select">
				<label>
					BulBro Style:
					<select
						name="bulbro-style"
						value={selectedBulbroStyle}
						onChange={(e) => {
							selectBulbroStyle(e.currentTarget.value as SpriteType);
						}}
					>
						{bulbrosStyles.map((bulbro) => (
							<BulbroStyleOption
								key={bulbro}
								value={bulbro}
								selected={bulbro === selectedBulbroStyle}
							/>
						))}
					</select>
				</label>
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
	onSelect?: (value: V) => void;
	selected: boolean;
};

export function BulbroStyleOption({
	value,
	selected,
}: OptionProps<SpriteType>) {
	return (
		<option selected={selected} value={value}>
			{value}
		</option>
	);
}

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
				onSelect?.(value);
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
		<option value={value} selected={selected}>
			{value}
		</option>
	);
}
