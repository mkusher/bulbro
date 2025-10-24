import type { Bulbro } from "../bulbro";
import { bulbros } from "../characters-definitions";
import { BulbroStyleOption } from "./Options";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	type CarouselApi,
} from "./shadcn/carousel";
import { useEffect, useState } from "preact/compat";

type BulbroConfigProps = {
	selectedBulbro: Bulbro;
	onChange: (bulbro: Bulbro) => void;
};

export function BulbroConfig({ selectedBulbro, onChange }: BulbroConfigProps) {
	const [api, setApi] = useState<CarouselApi>();
	const current =
		bulbros.findIndex((bulbro) => bulbro.id === selectedBulbro.id) ?? 0;

	useEffect(() => {
		if (!api) {
			return;
		}

		api.scrollTo(current);

		api.on("select", () => {
			const selectedBulbro = bulbros[api.selectedScrollSnap()];
			if (selectedBulbro) {
				onChange(selectedBulbro);
			}
		});
	}, [api, onChange]);

	return (
		<div className="flex flex-col gap-3">
			<div id="bulbro-select">
				<Carousel
					className="box-border w-72 sm:w-96 md:w-[32rem] lg:w-[40rem] xl:w-[44rem] 2xl:w-[48rem] mx-auto"
					setApi={setApi}
				>
					<CarouselContent>
						{bulbros.map((bulbro) => (
							<CarouselItem key={bulbro.id} className="flex justify-center">
								<div className="p-2 sm:p-3 md:p-4 lg:p-5 w-full max-w-[240px] sm:max-w-[320px] md:max-w-[400px] lg:max-w-[480px] xl:max-w-[520px]">
									<BulbroStyleOption
										value={bulbro}
										selected={bulbro.id === selectedBulbro.id}
										showDetails={true}
									/>
								</div>
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious type="button" />
					<CarouselNext type="button" />
				</Carousel>
			</div>
		</div>
	);
}
