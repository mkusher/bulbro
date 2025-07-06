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

type Props = {
	toScreen: (screen: string) => () => void;
};

export function OnlineGameTab({ toScreen }: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Online</CardTitle>
				<CardDescription>
					Nothing special, an online session. Create a user and create or join a
					lobby
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-6">
				<div className="grid gap-3">
					<Label htmlFor="tabs-demo-name">Name</Label>
					<Input id="tabs-demo-name" defaultValue="Pedro Duarte" />
				</div>
				<div className="grid gap-3">
					<Button variant="outline">Create user</Button>
				</div>
				<div className="grid gap-3">
					<Button>Start local co-op run</Button>
				</div>
			</CardContent>
			<CardFooter>
				<Button variant="secondary" onClick={toScreen("game-settings")}>
					Settings
				</Button>
			</CardFooter>
		</Card>
	);
}
