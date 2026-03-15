import { t } from "@/i18n";
import {
	createUser,
	currentUser,
} from "@/network/currentUser";
import { useRouter } from "@/ui/routing";
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

export function OnlineGameTab() {
	const user =
		currentUser.value;
	const router =
		useRouter();

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					{t(
						"online.title",
					)}
				</CardTitle>
				<CardDescription>
					{t(
						"online.description",
					)}
				</CardDescription>
			</CardHeader>
			<form
				onSubmit={(
					e,
				) => {
					e.preventDefault();
					createUser();
					router.toFindLobby();
				}}
			>
				<CardContent className="flex flex-col gap-3">
					<div className="flex flex-col gap-3">
						<Label htmlFor="tabs-demo-name">
							{t(
								"online.name",
							)}
						</Label>
						<Input
							id="tabs-demo-name"
							value={
								user.username
							}
							onChange={(
								e,
							) => {
								currentUser.value =
									{
										...user,
										username:
											e
												.currentTarget
												.value,
									};
							}}
						/>
					</div>
					<div className="grid">
						<Button type="submit">
							{t(
								"online.signUp",
							)}
						</Button>
					</div>
				</CardContent>
			</form>
			<CardFooter>
				<Button
					variant="secondary"
					onClick={
						router.toSettings
					}
				>
					{t(
						"start.settings",
					)}
				</Button>
			</CardFooter>
		</Card>
	);
}
