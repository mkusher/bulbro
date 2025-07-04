import type { Bulbro } from "../bulbro";
import type { SpriteType } from "../bulbro/Sprite";
import type { Difficulty } from "../game-formulas";

export type OptionProps<V> = {
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

export function DifficultyOption({ value, selected }: OptionProps<Difficulty>) {
	return (
		<option value={value} selected={selected}>
			{value}
		</option>
	);
}
