import { Card, CardContent, CardHeader } from "@/ui/shadcn/card";
import type { Weapon } from "@/weapon";
import { WeaponDisplay } from "@/weapon/WeaponDisplay";
import { WeaponTitle } from "@/weapon/WeaponTitle";

export interface WeaponSlotsProps {
	weapons: Weapon[];
	maxSlots?: number;
	onWeaponClick?: (weapon: Weapon, index: number) => void;
}

export function WeaponSlots({
	weapons,
	maxSlots = 6,
	onWeaponClick,
}: WeaponSlotsProps) {
	const slots = Array.from({ length: maxSlots }, (_, i) => weapons[i] || null);

	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-semibold">Weapons</h3>
					<span className="text-xs text-muted-foreground">
						{weapons.length} / {maxSlots}
					</span>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="grid grid-cols-6 gap-1">
					{slots.map((weapon, index) => (
						<div
							key={index}
							className={`flex flex-col items-center gap-0.5 p-1 rounded border ${
								weapon
									? "cursor-pointer hover:shadow-md transition-shadow border-border bg-card"
									: "border-dashed border-muted"
							}`}
							onClick={() => weapon && onWeaponClick?.(weapon, index)}
						>
							{weapon ? (
								<>
									<div className="w-full aspect-square flex items-center justify-center">
										<WeaponDisplay weapon={weapon} width={80} height={80} scale={0.4} />
									</div>
									<p className="text-[8px] text-center truncate w-full leading-tight">
										{weapon.name}
									</p>
								</>
							) : (
								<div className="w-full aspect-square flex items-center justify-center text-muted-foreground">
									<span className="text-base">+</span>
								</div>
							)}
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
