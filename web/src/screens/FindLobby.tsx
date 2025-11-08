import { useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import {
	createLobby,
	joinLobby,
} from "@/network/currentLobby";
import { currentUser } from "@/network/currentUser";
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
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/ui/shadcn/card";
import { Input } from "@/ui/shadcn/input";
import { Label } from "@/ui/shadcn/label";

const createOrJoinLobbyInstruction =
	"Nothing special, an online session. Now create or join a lobby";

export function FindLobby() {
	const location =
		useLocation();
	const router =
		useRouter();
	const toScreen =
		(
			screen: string,
		) =>
		() => {
			location.route(
				`/${screen}`,
			);
		};
	const [
		searchLobbyId,
		setSarchLobbdyId,
	] =
		useState(
			"",
		);
	const user =
		currentUser.value;
	const instruction =
		createOrJoinLobbyInstruction;

	const toSetupOnlineGame =
		toScreen(
			"setup-online-game",
		);
	const createNewLobby =
		async () => {
			await createLobby(
				router.toGame,
			);
			toSetupOnlineGame();
		};
	const joinLobbyById =
		async (
			id: string,
		) => {
			await joinLobby(
				id,
				router.toGame,
			);
			toSetupOnlineGame();
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
								Lobby
							</CardTitle>
							<CardDescription>
								{
									instruction
								}
							</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col gap-6">
							<h2>
								Hi,{" "}
								{
									user.username
								}
								!
							</h2>
							<form
								onSubmit={(
									e,
								) => {
									joinLobbyById(
										searchLobbyId,
									);
									e.preventDefault();
								}}
								className="flex flex-col gap-3"
							>
								<div className="flex flex-col gap-3">
									<Label htmlFor="join-lobby-id">
										Enter
										lobby
										id:
									</Label>
									<Input
										id="join-lobby-id"
										value={
											searchLobbyId
										}
										autoComplete="off"
										onChange={(
											e,
										) => {
											setSarchLobbdyId(
												e
													.currentTarget
													.value,
											);
										}}
									/>
								</div>
								<div className="grid">
									<Button
										type="submit"
										variant="outline"
									>
										Join
										lobby
										by
										id
									</Button>
								</div>
							</form>
							<div className="grid">
								<Button
									onClick={() =>
										createNewLobby()
									}
								>
									Start
									new
									lobby
								</Button>
							</div>
						</CardContent>
						<CardFooter>
							<Button
								variant="secondary"
								onClick={toScreen(
									"game-settings",
								)}
							>
								Settings
							</Button>
						</CardFooter>
					</Card>
				</CentralCard>
			</MainContainer>
		</SplashBanner>
	);
}
