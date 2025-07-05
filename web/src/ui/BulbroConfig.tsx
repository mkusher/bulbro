import type { Bulbro } from "../bulbro";
import { bulbrosStyles, type SpriteType } from "../bulbro/Sprite";
import { bulbros } from "../characters-definitions";
import type { Weapon } from "../weapon";
import { BulbroOption, BulbroStyleOption } from "./Options";
import { WeaponsSelect } from "./WeaponsSelect";

type BulbroProps = {
	selectedBulbro: Bulbro;
	selectBulbro: (b: Bulbro) => void;
	selectedBulbroStyle: SpriteType;
	selectBulbroStyle: (s: SpriteType) => void;
	selectedWeapons: Weapon[];
	selectWeapons: (w: Weapon[]) => void;
};
export function BulbroConfig({
	selectedBulbro,
	selectBulbro,
	selectedBulbroStyle,
	selectBulbroStyle,
	selectedWeapons,
	selectWeapons,
}: BulbroProps) {
	return (
		<>
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
			<div id="weapons-select">
				<WeaponsSelect
					selectedWeapons={selectedWeapons}
					selectWeapons={selectWeapons}
				/>
			</div>
		</>
	);
}
