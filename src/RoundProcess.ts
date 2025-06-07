export type Round = {
	id: string;
	duration: number;
	startTime?: number;
	endTime?: number;
};
/**
 * Manages the lifecycle of a game round: timing, pausing, resuming, and completion.
 */
export class RoundProcess {
	readonly #round: Round;
	#timerId: ReturnType<typeof setTimeout> | null = null;
	#startedAt: Date | null = null;
	#endedAt?: Date;
	#ended = false;
	#waitPromise: Promise<void>;
	#waitResolve!: () => void;
	#waitReject!: (reason?: any) => void;

	/**
	 * @param round Round model (duration in milliseconds)
	 */
	constructor(round: Round) {
		this.#round = round;
		this.#waitPromise = new Promise<void>((resolve, reject) => {
			this.#waitResolve = resolve;
			this.#waitReject = reject;
		});
	}

	/**
	 * Starts or resumes the round timer. No-op if already running or ended.
	 */
	start(): void {
		if (this.#ended || this.#timerId) {
			return;
		}
		const now = new Date();
		if (this.#startedAt === null) {
			this.#startedAt = now;
			this.#round.startTime = now.getTime();
		}
		this.#timerId = setTimeout(() => this.#finish(), this.#round.duration);
	}

	/**
	 * Pauses the round timer. Can be resumed via start(). No-op if not running or already ended.
	 */
	// Pausing is not supported in this implementation

	/**
	 * Immediately ends the round. Further start()/pause() calls are no-ops.
	 */
	stop(): void {
		if (this.#ended) {
			return;
		}
		if (this.#timerId !== null) {
			clearTimeout(this.#timerId);
			this.#timerId = null;
		}
		this.#finish();
	}

	/**
	 * Returns a promise that resolves when the round completes (naturally or via stop()).
	 */
	wait(): Promise<void> {
		return this.#waitPromise;
	}

	/**
	 * @returns true if round has been started and not yet ended
	 */
	public isRunning(): boolean {
		return this.#startedAt !== null && !this.#ended;
	}

	/**
	 * @returns Remaining time in milliseconds (0 if ended).
	 */
	/**
	 * @returns Remaining time in milliseconds (0 if ended, full duration if not started).
	 */
	getTimeLeft(): number {
		if (this.#ended) {
			return 0;
		}
		if (this.#startedAt === null) {
			return this.#round.duration;
		}
		const elapsed = Date.now() - this.#startedAt.getTime();
		return Math.max(0, this.#round.duration - elapsed);
	}

	/**
	 * Checks and updates the timer state. Ends the round if duration has passed.
	 */
	tick(): void {
		if (this.#ended || this.#startedAt === null) {
			return;
		}

		const elapsed = Date.now() - this.#startedAt.getTime();
		if (elapsed >= this.#round.duration) {
			this.#finish();
		}
	}

	/**
	 * Internal handler when the timer elapses.
	 */
	#finish(): void {
		if (this.#ended) {
			return;
		}
		this.#ended = true;
		this.#timerId = null;
		this.#endedAt = new Date();
		this.#waitResolve();
	}
}
