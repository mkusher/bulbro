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
	selectedBulbroStyle: SpriteType;
	selectedWeapons: Weapon[];
};
export function BulbroConfigView({
	selectedBulbro,
	selectedBulbroStyle,
	selectedWeapons,
}: BulbroProps) {
	const bulbro = bulbros.find((b) => b.id === selectedBulbro.id);
	return (
		<div className="flex flex-col gap-2">
			<div id="bulbro-select">
				<Label>BulBro Class: {bulbro?.name ?? "?"}</Label>
			</div>
			<div id="bulbro-style-select">
				<Label>BulBro Style: {selectedBulbroStyle}</Label>
			</div>
			<div id="weapons-select">
				<Label>Weapons:</Label>
				<ul>
					{selectedWeapons.map((weapon) => (
						<li>{weapon.name}</li>
					))}
				</ul>
			</div>
		</div>
	);
}
