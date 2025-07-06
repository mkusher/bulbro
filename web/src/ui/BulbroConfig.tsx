import type { Bulbro } from "../bulbro";
import { bulbrosStyles, type SpriteType } from "../bulbro/Sprite";
import { bulbros } from "../characters-definitions";
import type { Weapon } from "../weapon";
import { BulbroOption, BulbroStyleOption } from "./Options";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "./shadcn/carousel";
import { Label } from "./shadcn/label";
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
		<div className="flex flex-col gap-3">
			<div id="bulbro-select">
				<Label>BulBro Class:</Label>
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
			</div>
			<div id="bulbro-style-select">
				<Label>BulBro Style:</Label>
				<Carousel className="w-full">
					<CarouselContent>
						{bulbrosStyles.map((bulbro) => (
							<CarouselItem>
								<div className="p-1">
									<BulbroStyleOption
										key={bulbro}
										value={bulbro}
										selected={bulbro === selectedBulbroStyle}
									/>
								</div>
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious />
					<CarouselNext />
				</Carousel>
			</div>
			<div id="weapons-select" className="w-full">
				<WeaponsSelect
					selectedWeapons={selectedWeapons}
					selectWeapons={selectWeapons}
				/>
			</div>
		</div>
	);
}
