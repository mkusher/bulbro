import { Label } from "./shadcn/label";
import type { Weapon } from "../weapon";
import { weapons } from "../weapons-definitions";
import { Checkbox } from "./shadcn/checkbox";

export type Props = {
	selectedWeapons: Weapon[];
	selectWeapons: (w: Weapon[]) => void;
};

export function WeaponsSelect({ selectedWeapons, selectWeapons }: Props) {
	const onChange = (e: Event) => {
		const select = e.target as HTMLSelectElement;
		const selected = Array.from(select.selectedOptions)
			.map((option) => option.value)
			.map((s) => weapons.find((w) => w.id === s))
			.filter((w) => !!w);
		selectWeapons(selected);
	};
	return (
		<>
			<Label htmlFor="weapons">Weapons:</Label>
			<div className="grid grid-rows-4 grid-flow-col gap-2">
				{weapons.map((weapon) => (
					<WeaponOption
						key={weapon.id}
						value={weapon}
						selected={!!selectedWeapons.find((w) => w.id === weapon.id)}
						onSelect={onChange}
					/>
				))}
			</div>
		</>
	);
}

type OptionProps<V> = {
	value: V;
	onSelect: (e: Event) => void;
	selected: boolean;
};

export function WeaponOption({
	value,
	onSelect,
	selected,
}: OptionProps<Weapon>) {
	return (
		<Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
			<Checkbox
				name="weapons"
				value={value.id}
				checked={selected}
				onSelect={(e) => {
					onSelect(e);
				}}
				className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
			/>
			<div className="grid gap-1.5 font-normal">
				<p className="text-sm leading-none font-medium">{value.name}</p>
				<p className="text-muted-foreground text-sm">
					I will add weapon description at some point, maybe
				</p>
			</div>
		</Label>
	);
}
