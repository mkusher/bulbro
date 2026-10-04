import { PlayersStatus } from "@/ui/PlayersStatus";

export default {
	title:
		"UI/PlayersStatus",
	component:
		PlayersStatus,
};

// In the lobby: bulbros are known once chosen, levels are not shown yet
export const Lobby =
	{
		render:
			() => (
				<div className="max-w-md p-4">
					<PlayersStatus
						players={[
							{
								id: "host",
								username:
									"Alice",
								connected: true,
								ready: false,
								isLocal: true,
								bulbroName:
									"Well Rounded",
							},
							{
								id: "guest",
								username:
									"Bob",
								connected: true,
								ready: false,
							},
						]}
					/>
				</div>
			),
	};

// During the game: bulbro and level of everybody, every combination of states
export const InGame =
	{
		render:
			() => (
				<div className="max-w-md p-4">
					<PlayersStatus
						players={[
							{
								id: "local",
								username:
									"Alice",
								connected: true,
								ready: true,
								isLocal: true,
								bulbroName:
									"Well Rounded",
								level: 5,
							},
							{
								id: "remote",
								username:
									"Bob",
								connected: true,
								ready: false,
								bulbroName:
									"Berserker",
								level: 4,
							},
							{
								id: "disconnected-ready",
								username:
									"Carol",
								connected: false,
								ready: true,
								bulbroName:
									"Medic",
								level: 3,
							},
							{
								id: "disconnected",
								username:
									"Dave",
								connected: false,
								ready: false,
								bulbroName:
									"Vampire",
								level: 0,
							},
						]}
					/>
				</div>
			),
	};
