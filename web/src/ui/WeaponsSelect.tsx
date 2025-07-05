import type { Weapon } from "../weapon";
import { weapons } from "../weapons-definitions";

export type Props = {
	selectedWeapons: Weapon[];
	selectWeapons: (w: Weapon[]) => void;
};

export function WeaponsSelect({ selectedWeapons, selectWeapons }: Props) {
	return (
		<label>
			Weapons:
			<select
				name="weapons"
				multiple
				onChange={(e) => {
					const select = e.target as HTMLSelectElement;
					const selected = Array.from(select.selectedOptions)
						.map((option) => option.value)
						.map((s) => weapons.find((w) => w.id === s))
						.filter((w) => !!w);
					selectWeapons(selected);
				}}
			>
				{weapons.map((weapon) => (
					<WeaponOption
						key={weapon.id}
						value={weapon}
						selected={!!selectedWeapons.find((w) => w.id === weapon.id)}
						onSelect={() => {}}
					/>
				))}
			</select>
		</label>
	);
}

type OptionProps<V> = {
	value: V;
	onSelect: (value: V) => void;
	selected: boolean;
};

export function WeaponOption({
	value,
	onSelect,
	selected,
}: OptionProps<Weapon>) {
	return (
		<option
			value={value.id}
			selected={selected}
			onSelect={(e) => {
				onSelect(value);
			}}
		>
			{value.name}
		</option>
	);
}
