import { isDifficulty, type Difficulty } from "@/game-formulas";
import { Label } from "./shadcn/label";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";

export type Props = {
	selectedDifficulty: Difficulty;
	selectDifficulty: (d: Difficulty) => void;
};
export function DifficultySelector({
	selectDifficulty,
	selectedDifficulty,
}: Props) {
	return (
		<div className="gap-3 flex flex-col">
			<Label>Difficulty:</Label>
			<RadioGroup
				className="gap-3 flex overflow-hidden flex-wrap"
				onValueChange={(e) => {
					const difficulty = Number(e);
					if (isDifficulty(difficulty)) {
						selectDifficulty(difficulty);
					}
				}}
				defaultValue={selectedDifficulty.toString()}
			>
				{([0, 1, 2, 3, 4, 5] as const).map((difficulty: Difficulty) => (
					<Label
						className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 pr-6 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950"
						htmlFor={`difficulty-level-${difficulty}`}
					>
						<RadioGroupItem
							id={"difficulty-level-" + difficulty}
							value={difficulty.toString()}
							checked={selectedDifficulty === difficulty}
							className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
						/>
						<div className="grid gap-1.5 font-normal">
							<p className="text-sm leading-none font-medium">{difficulty}</p>
						</div>
					</Label>
				))}
			</RadioGroup>
		</div>
	);
}
