import {
	useEffect,
	useState,
} from "preact/hooks";
import { audioEngine } from "@/audio";

type Props =
	{
		text: string;
		/** Delay before the first letter appears */
		startDelayMs?: number;
		/** Time between two letters */
		letterIntervalMs?: number;
		/** Plays a typewriter key click for every typed letter */
		withSound?: boolean;
		onDone?: () => void;
	};

const prefersReducedMotion =
	() =>
		typeof window !==
			"undefined" &&
		window.matchMedia?.(
			"(prefers-reduced-motion: reduce)",
		)
			.matches;

/**
 * Text typed letter by letter with a blinking caret, like on a typewriter.
 * The full text is always laid out, so typing doesn't shift the layout.
 */
export function TypingText({
	text,
	startDelayMs = 0,
	letterIntervalMs = 60,
	withSound = true,
	onDone,
}: Props) {
	const letters =
		Array.from(
			text,
		);
	const [
		typed,
		setTyped,
	] =
		useState(
			0,
		);

	useEffect(() => {
		if (
			prefersReducedMotion()
		) {
			setTyped(
				letters.length,
			);
			onDone?.();
			return;
		}
		setTyped(
			0,
		);
		let count = 0;
		let interval:
			| ReturnType<
					typeof setInterval
			  >
			| undefined;
		const typeLetter =
			() => {
				count++;
				setTyped(
					count,
				);
				if (
					withSound &&
					letters[
						count -
							1
					]?.trim()
				)
					audioEngine.playEffect(
						"typewriter",
					);
				if (
					count >=
					letters.length
				) {
					clearInterval(
						interval,
					);
					onDone?.();
				}
			};
		const timeout =
			setTimeout(
				() => {
					typeLetter();
					interval =
						setInterval(
							typeLetter,
							letterIntervalMs,
						);
				},
				startDelayMs,
			);
		return () => {
			clearTimeout(
				timeout,
			);
			clearInterval(
				interval,
			);
		};
	}, [
		text,
	]);

	const isTyping =
		typed <
		letters.length;
	const letter =
		(
			value: string,
			i: number,
		) => (
			<span
				key={
					i
				}
				className={
					i <
					typed
						? "animate-in fade-in duration-150"
						: "invisible"
				}
			>
				{
					value
				}
			</span>
		);

	return (
		<span>
			<span className="sr-only">
				{
					text
				}
			</span>
			<span aria-hidden="true">
				{letters
					.slice(
						0,
						typed,
					)
					.map(
						letter,
					)}
				{isTyping && (
					<span className="relative inline-block w-0">
						<span className="absolute -top-[0.85em] left-0 h-[1em] w-[0.08em] animate-pulse bg-current" />
					</span>
				)}
				{letters
					.slice(
						typed,
					)
					.map(
						(
							value,
							i,
						) =>
							letter(
								value,
								typed +
									i,
							),
					)}
			</span>
		</span>
	);
}
