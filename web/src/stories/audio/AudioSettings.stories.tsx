import { soundUrls } from "@/AudioAssets";
import { AudioSettings } from "@/audio/AudioSettings";
import {
	Card,
	CardContent,
	CardHeader,
} from "@/ui/shadcn/card";

export default {
	title:
		"Audio/AudioSettings",
	component:
		AudioSettings,
};

export const Default =
	{
		render:
			() => (
				<div className="w-full max-w-2xl mx-auto p-6 bg-background">
					<Card>
						<CardHeader>
							<h2 className="text-xl font-bold">
								Audio
								Settings
								&
								Controls
							</h2>
						</CardHeader>
						<CardContent className="grid gap-8">
							{/* Audio Settings Component */}
							<div>
								<h3 className="text-lg font-semibold mb-4">
									Settings
								</h3>
								<AudioSettings />
							</div>

							{/* HTML Audio Elements for Direct Testing */}
							<div className="border-t pt-6">
								<h3 className="text-lg font-semibold mb-4">
									Direct
									Audio
									Controls
								</h3>
								<div className="grid gap-4">
									{Object.entries(
										soundUrls,
									).map(
										([
											name,
											url,
										]) => (
											<div
												key={
													name
												}
												className="border rounded-lg p-4"
											>
												<div className="font-medium mb-2 capitalize">
													{
														name
													}
												</div>
												<audio
													controls
													preload="auto"
													src={
														url
													}
													className="w-full"
													style={{
														filter:
															"invert(1)",
													}}
												>
													<track
														kind="captions"
														srcLang="en"
														label="English"
													/>
													Your
													browser
													does
													not
													support
													the
													audio
													element.
												</audio>
											</div>
										),
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			),
	};
