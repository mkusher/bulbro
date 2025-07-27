import { BulbroSpriteRenderer } from "@/ui/BulbroSpriteRenderer";
import type { Bulbro } from "../bulbro";
import type { SpriteType } from "../bulbro/Sprite";
import { Card, CardContent } from "./shadcn/card";
import { wellRoundedBulbro } from "@/characters-definitions";
import { WithContainerWidth } from "./WithContainerWidth";

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
		<Card>
			<CardContent>
				<WithContainerWidth>
					{({ width, height }) => (
						<BulbroSpriteRenderer
							spriteType={value}
							bulbro={wellRoundedBulbro}
							width={width}
							height={Math.max(height, 150)}
						/>
					)}
				</WithContainerWidth>
			</CardContent>
		</Card>
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
