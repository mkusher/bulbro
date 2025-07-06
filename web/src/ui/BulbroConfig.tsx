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
	type CarouselApi,
} from "./shadcn/carousel";
import { Label } from "./shadcn/label";
import { WeaponsSelect } from "./WeaponsSelect";
import { useEffect, useState } from "preact/compat";

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
	const [api, setApi] = useState<CarouselApi>();
	const current =
		bulbrosStyles.findIndex((style) => style === selectedBulbroStyle) ?? 0;

	useEffect(() => {
		if (!api) {
			return;
		}

		api.scrollTo(current);

		api.on("select", () => {
			selectBulbroStyle(bulbrosStyles[api.selectedScrollSnap() + 1]!);
		});
	}, [api]);
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
				<Carousel
					className="box-border w-60 align-center m-auto md:w-100 sm:w-80"
					setApi={setApi}
				>
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
					<CarouselPrevious type="button" />
					<CarouselNext type="button" />
				</Carousel>
			</div>
			<div id="weapons-select">
				<WeaponsSelect
					selectedWeapons={selectedWeapons}
					selectWeapons={selectWeapons}
				/>
			</div>
		</div>
	);
}
