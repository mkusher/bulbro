import { BulbroCard } from "../bulbro/BulbroDisplay";
import type { Bulbro } from "../bulbro";
import { WithContainerWidth } from "./WithContainerWidth";

export type OptionProps<V> = {
	value: V;
	onSelect?: (value: V) => void;
	selected: boolean;
};

export type BulbroStyleOptionProps = OptionProps<Bulbro> & {
	showDetails?: boolean;
};

export function BulbroStyleOption({
	value,
	selected,
	showDetails = false,
}: BulbroStyleOptionProps) {
	return (
		<WithContainerWidth>
			{({ width, height }) => (
				<BulbroCard
					bulbro={value}
					showDetails={showDetails}
					displayWidth={width}
					displayHeight={Math.max(height, 50)}
					className={selected ? "ring-2 ring-primary" : ""}
				/>
			)}
		</WithContainerWidth>
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
