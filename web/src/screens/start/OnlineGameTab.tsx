import { Input } from "@/ui/shadcn/input";
import { Label } from "@/ui/shadcn/label";
import { Button } from "@/ui/shadcn/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/ui/shadcn/card";
import { createUser, currentUser } from "@/network/currentUser";
import { useState } from "preact/hooks";
import { createLobby, joinLobby } from "@/network/currentLobby";

type Props = {
	toScreen: (screen: string) => () => void;
};

const registerInstruction = "Nothing special, an online session. First sign up";
const createOrJoinLobbyInstruction =
	"Nothing special, an online session. Now create or join a lobby";

export function OnlineGameTab({ toScreen }: Props) {
	const [searchLobbyId, setSarchLobbdyId] = useState("");
	const user = currentUser.value;
	const { isGuest } = user;
	const instruction = isGuest
		? registerInstruction
		: createOrJoinLobbyInstruction;

	const toSetupOnlineGame = toScreen("setup-online-game");
	const createNewLobby = async () => {
		await createLobby();
		toSetupOnlineGame();
	};
	const joinLobbyById = async (id: string) => {
		await joinLobby(id);
		toSetupOnlineGame();
	};
	return (
		<Card>
			<CardHeader>
				<CardTitle>Online</CardTitle>
				<CardDescription>{instruction}</CardDescription>
			</CardHeader>
			{isGuest ? (
				<form
					onSubmit={(e) => {
						e.preventDefault();
						createUser();
					}}
				>
					<CardContent className="flex flex-col gap-3">
						<div className="flex flex-col gap-3">
							<Label htmlFor="tabs-demo-name">Name</Label>
							<Input
								id="tabs-demo-name"
								value={user.username}
								onChange={(e) => {
									currentUser.value = {
										...user,
										username: e.currentTarget.value,
									};
								}}
							/>
						</div>
						<div className="grid">
							<Button type="submit">Sign up</Button>
						</div>
					</CardContent>
				</form>
			) : (
				<CardContent className="flex flex-col gap-6">
					<h2>Hi, {user.username}!</h2>
					<form
						onSubmit={(e) => {
							joinLobbyById(searchLobbyId);
							e.preventDefault();
						}}
						className="flex flex-col gap-3"
					>
						<div className="flex flex-col gap-3">
							<Label htmlFor="join-lobby-id">Enter lobby id:</Label>
							<Input
								id="join-lobby-id"
								value={searchLobbyId}
								onChange={(e) => {
									setSarchLobbdyId(e.currentTarget.value);
								}}
							/>
						</div>
						<div className="grid">
							<Button type="submit" variant="outline">
								Join lobby by id
							</Button>
						</div>
					</form>
					<div className="grid">
						<Button onClick={() => createNewLobby()}>Start new lobby</Button>
					</div>
				</CardContent>
			)}
			<CardFooter>
				<Button variant="secondary" onClick={toScreen("game-settings")}>
					Settings
				</Button>
			</CardFooter>
		</Card>
	);
}
