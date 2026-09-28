import { useState } from "preact/hooks";
import type { RoutePropsForPath } from "preact-iso";
import { t } from "@/i18n";
import { joinLobby } from "@/network/currentLobby";
import {
	createUser,
	currentUser,
	sessionToken,
} from "@/network/currentUser";
import {
	CentralCard,
	MainContainer,
} from "@/ui/Layout";
import { useRouter } from "@/ui/routing";
import { SplashBanner } from "@/ui/Splash";
import { Button } from "@/ui/shadcn/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/ui/shadcn/card";
import { Input } from "@/ui/shadcn/input";
import { Label } from "@/ui/shadcn/label";

export function JoinLobby({
	id,
}: RoutePropsForPath<"/lobby/:id">) {
	const router =
		useRouter();
	const [
		username,
		setUsername,
	] =
		useState(
			currentUser
				.value
				.username,
		);
	const [
		joining,
		setJoining,
	] =
		useState(
			false,
		);
	const [
		error,
		setError,
	] =
		useState(
			"",
		);

	const submit =
		async () => {
			if (
				joining
			)
				return;
			setJoining(
				true,
			);
			setError(
				"",
			);
			try {
				currentUser.value =
					{
						...currentUser.value,
						username:
							username.trim(),
					};
				if (
					!sessionToken.value
				) {
					await createUser();
				}
				await joinLobby(
					id,
					router.toGame,
				);
				router.toSetupOnlineGame();
			} catch (cause) {
				setError(
					cause instanceof
						Error
						? cause.message
						: "Could not join lobby",
				);
			} finally {
				setJoining(
					false,
				);
			}
		};

	return (
		<SplashBanner>
			<MainContainer
				noPadding
				top
			>
				<CentralCard>
					<Card>
						<CardHeader>
							<CardTitle>
								{t(
									"lobby.title",
								)}
							</CardTitle>
							<CardDescription>
								{t(
									"online.description",
								)}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form
								className="flex flex-col gap-3"
								onSubmit={(
									event,
								) => {
									event.preventDefault();
									void submit();
								}}
							>
								<Label htmlFor="lobby-username">
									{t(
										"online.name",
									)}
								</Label>
								<Input
									id="lobby-username"
									value={
										username
									}
									required
									onInput={(
										event,
									) =>
										setUsername(
											event
												.currentTarget
												.value,
										)
									}
								/>
								{error && (
									<p role="alert">
										{
											error
										}
									</p>
								)}
								<Button
									type="submit"
									disabled={
										joining ||
										!username.trim()
									}
								>
									{joining
										? "Joining…"
										: t(
												"lobby.joinById",
											)}
								</Button>
							</form>
						</CardContent>
					</Card>
				</CentralCard>
			</MainContainer>
		</SplashBanner>
	);
}
