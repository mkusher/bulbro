import { PrevWaveStats, type WaveStats } from "@/shop/PrevWaveStats";

export default {
	title: "Shop/PrevWaveStats",
	component: PrevWaveStats,
};

// Default wave stats
export const DefaultStats = {
	render: (args: any) => <PrevWaveStats {...args} />,
	args: {
		stats: {
			wave: 1,
			enemiesKilled: 45,
			damageDealt: 12450,
			damageTaken: 320,
			materialsCollected: 180,
			survivalTime: 60,
			accuracy: 68.5,
		} as WaveStats,
	},
};

// High performance stats
export const HighPerformance = {
	render: (args: any) => <PrevWaveStats {...args} />,
	args: {
		stats: {
			wave: 5,
			enemiesKilled: 120,
			damageDealt: 45000,
			damageTaken: 150,
			materialsCollected: 450,
			survivalTime: 60,
			accuracy: 85.2,
		} as WaveStats,
	},
};

// Low performance stats
export const LowPerformance = {
	render: (args: any) => <PrevWaveStats {...args} />,
	args: {
		stats: {
			wave: 1,
			enemiesKilled: 15,
			damageDealt: 3200,
			damageTaken: 800,
			materialsCollected: 45,
			survivalTime: 35,
			accuracy: 42.1,
		} as WaveStats,
	},
};

// Early death (short survival time)
export const EarlyDeath = {
	render: (args: any) => <PrevWaveStats {...args} />,
	args: {
		stats: {
			wave: 3,
			enemiesKilled: 8,
			damageDealt: 1500,
			damageTaken: 1200,
			materialsCollected: 20,
			survivalTime: 15,
			accuracy: 38.5,
		} as WaveStats,
	},
};

// Perfect run (no damage taken, high accuracy)
export const PerfectRun = {
	render: (args: any) => <PrevWaveStats {...args} />,
	args: {
		stats: {
			wave: 2,
			enemiesKilled: 65,
			damageDealt: 18500,
			damageTaken: 0,
			materialsCollected: 280,
			survivalTime: 60,
			accuracy: 95.8,
		} as WaveStats,
	},
};

// Without accuracy stat
export const NoAccuracy = {
	render: (args: any) => <PrevWaveStats {...args} />,
	args: {
		stats: {
			wave: 1,
			enemiesKilled: 45,
			damageDealt: 12450,
			damageTaken: 320,
			materialsCollected: 180,
			survivalTime: 60,
		} as WaveStats,
	},
};

// Late game wave
export const LateGame = {
	render: (args: any) => <PrevWaveStats {...args} />,
	args: {
		stats: {
			wave: 15,
			enemiesKilled: 250,
			damageDealt: 125000,
			damageTaken: 2500,
			materialsCollected: 850,
			survivalTime: 60,
			accuracy: 72.3,
		} as WaveStats,
	},
};
