import {
	type Locale,
	languageNames,
	allLocales,
} from "@/i18n";
import { MainContainer } from "@/ui/Layout";
import {
	SplashBanner,
	SplashTitle,
} from "@/ui/Splash";
import { Button } from "@/ui/shadcn/button";
import {
	Card,
	CardContent,
} from "@/ui/shadcn/card";
import { updateLocale } from "@/userSettings";

export function LanguageSelection() {
	return (
		<LanguageSelectionComponent />
	);
}

export type Props =
	{};

export function LanguageSelectionComponent({}: Props) {
	const locales =
		allLocales;

	const handleLanguageSelect =
		async (
			locale: Locale,
		) => {
			updateLocale(
				locale,
			);
		};

	return (
		<SplashBanner>
			<MainContainer
				noPadding
				top
			>
				<div className="flex h-screen w-4/5">
					<div className="m-auto w-full flex flex-col items-center gap-6 pb-40">
						<SplashTitle />
						<Card>
							<CardContent className="grid gap-3">
								{locales.map(
									(
										l,
									) => (
										<Button
											key={
												l
											}
											onClick={() =>
												handleLanguageSelect(
													l,
												)
											}
											variant="outline"
										>
											{
												languageNames[
													l
												]
											}
										</Button>
									),
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</MainContainer>
		</SplashBanner>
	);
}
