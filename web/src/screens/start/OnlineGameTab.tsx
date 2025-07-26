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
import { useRouter } from "@/ui/routing";

const registerInstruction = "Nothing special, an online session. First sign up";

export function OnlineGameTab() {
	const user = currentUser.value;
	const instruction = registerInstruction;
	const router = useRouter();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Online</CardTitle>
				<CardDescription>{instruction}</CardDescription>
			</CardHeader>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					createUser();
					router.toFindLobby();
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
			<CardFooter>
				<Button variant="secondary" onClick={router.toSettings}>
					Settings
				</Button>
			</CardFooter>
		</Card>
	);
}
