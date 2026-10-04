import { t } from "@/i18n";
import {
	Card,
	CardContent,
	CardHeader,
} from "@/ui/shadcn/card";

/**
 * Connection and readiness of a single online game participant.
 */
export interface PlayerStatus {
	id: string;
	username: string;
	connected: boolean;
	ready: boolean;
	isLocal?: boolean;
	/** Name of the chosen bulbro, once known */
	bulbroName?: string;
	/** Current level, omitted before the game starts */
	level?: number;
}

export interface PlayersStatusProps {
	players: PlayerStatus[];
}

function StatusBadge({
	active,
	activeLabel,
	inactiveLabel,
	activeClassName,
}: {
	active: boolean;
	activeLabel: string;
	inactiveLabel: string;
	activeClassName: string;
}) {
	return (
		<span
			className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
				active
					? activeClassName
					: "bg-muted text-muted-foreground"
			}`}
		>
			{active
				? activeLabel
				: inactiveLabel}
		</span>
	);
}

/**
 * Pure presentation of every online player's bulbro, level, connection and
 * ready state. Used in the lobby, on the level-up screen and in the shop.
 */
export function PlayersStatus({
	players,
}: PlayersStatusProps) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<h3 className="text-sm font-semibold">
					{t(
						"preround.players",
					)}
				</h3>
			</CardHeader>
			<CardContent className="pt-0">
				<ul className="flex flex-col gap-2">
					{players.map(
						(
							player,
						) => (
							<li
								key={
									player.id
								}
								data-player-id={
									player.id
								}
								className="flex items-center justify-between gap-2"
							>
								<span className="flex items-center gap-2 min-w-0">
									<span
										aria-hidden="true"
										className={`size-2 shrink-0 rounded-full ${
											player.connected
												? "bg-green-500"
												: "bg-red-500"
										}`}
									/>
									<span className="flex flex-col min-w-0">
										<span className="truncate text-sm">
											{
												player.username
											}
											{player.isLocal
												? ` (${t(
														"preround.you",
													)})`
												: ""}
										</span>
										{(player.bulbroName ||
											player.level !==
												undefined) && (
											<span className="truncate text-xs text-muted-foreground">
												{[
													player.bulbroName,
													player.level !==
													undefined
														? t(
																"players.level",
																{
																	level:
																		player.level,
																},
															)
														: undefined,
												]
													.filter(
														Boolean,
													)
													.join(
														" · ",
													)}
											</span>
										)}
									</span>
								</span>
								<span className="flex shrink-0 gap-1">
									<StatusBadge
										active={
											player.connected
										}
										activeLabel={t(
											"setup.connected",
										)}
										inactiveLabel={t(
											"setup.disconnected",
										)}
										activeClassName="bg-green-100 text-green-800"
									/>
									<StatusBadge
										active={
											player.ready
										}
										activeLabel={t(
											"setup.ready",
										)}
										inactiveLabel={t(
											"setup.notReady",
										)}
										activeClassName="bg-blue-100 text-blue-800"
									/>
								</span>
							</li>
						),
					)}
				</ul>
			</CardContent>
		</Card>
	);
}
