import {
	BulbroDisplay as BulbroDisplayComponent,
	BulbroCard as BulbroCardComponent,
} from "../bulbro/BulbroDisplay";
import { BulbroTitle } from "../bulbro/BulbroTitle";
import { BulbroStats } from "../bulbro/BulbroStats";
import { wellRoundedBulbro, bulbros } from "@/characters-definitions";
import type { BulbroRarity } from "../bulbro/BulbroTitle";

export default {
	title: "Bulbros/Gallery & Showcase",
	component: BulbroDisplayComponent,
};

export const BulbroGallery = {
	render: () => (
		<div
			style={{
				padding: "20px",
				display: "flex",
				flexDirection: "column",
				gap: "20px",
			}}
		>
			<h2>All Bulbro Characters</h2>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
					gap: "20px",
				}}
			>
				{bulbros.map((bulbro) => (
					<BulbroCardComponent
						key={bulbro.id}
						bulbro={bulbro}
						displayWidth={250}
						displayHeight={180}
						onClick={() => console.log(`Selected ${bulbro.name}`)}
					/>
				))}
			</div>
		</div>
	),
};

export const BulbroDisplayShowcase = {
	render: (args: any) => {
		const bulbro =
			bulbros.find((b) => b.id === args.bulbroId) || wellRoundedBulbro;
		const rarities: BulbroRarity[] = [
			"common",
			"uncommon",
			"rare",
			"exceptional",
			"legendary",
		];

		return (
			<div
				style={{
					padding: "20px",
					display: "flex",
					flexDirection: "column",
					gap: "20px",
				}}
			>
				<h2>Bulbro Display Component</h2>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "10px",
						maxWidth: "400px",
					}}
				>
					{rarities.map((rarity) => (
						<div
							key={rarity}
							style={{ display: "flex", flexDirection: "column", gap: "10px" }}
						>
							<BulbroTitle bulbro={bulbro} rarity={rarity} />
							<div style={{ width: "250px", height: "180px" }}>
								<BulbroDisplayComponent bulbro={bulbro} />
							</div>
						</div>
					))}
				</div>
			</div>
		);
	},
	args: {
		bulbroId: wellRoundedBulbro.id,
	},
	argTypes: {
		bulbroId: {
			options: bulbros.map((b) => b.id),
			control: { type: "select" },
		},
	},
};

export const BulbroCardShowcase = {
	render: (args: any) => {
		const bulbro =
			bulbros.find((b) => b.id === args.bulbroId) || wellRoundedBulbro;

		return (
			<div
				style={{
					padding: "20px",
					display: "flex",
					flexDirection: "column",
					gap: "20px",
				}}
			>
				<h2>Bulbro Card Component</h2>
				<div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
					<div style={{ minWidth: "320px" }}>
						<h3>With Details</h3>
						<BulbroCardComponent
							bulbro={bulbro}
							showDetails={true}
							displayWidth={args.displayWidth}
							displayHeight={args.displayHeight}
							onClick={() => console.log(`Clicked ${bulbro.name}`)}
						/>
					</div>
					<div style={{ minWidth: "320px" }}>
						<h3>Without Details</h3>
						<BulbroCardComponent
							bulbro={bulbro}
							showDetails={false}
							displayWidth={args.displayWidth}
							displayHeight={args.displayHeight}
							onClick={() => console.log(`Clicked ${bulbro.name}`)}
						/>
					</div>
				</div>
			</div>
		);
	},
	args: {
		bulbroId: wellRoundedBulbro.id,
		displayWidth: 280,
		displayHeight: 200,
	},
	argTypes: {
		bulbroId: {
			options: bulbros.map((b) => b.id),
			control: { type: "select" },
		},
		displayWidth: {
			control: { type: "range", min: 150, max: 400, step: 10 },
		},
		displayHeight: {
			control: { type: "range", min: 100, max: 300, step: 10 },
		},
	},
};

export const BulbroStatsShowcase = {
	render: (args: any) => {
		const bulbro =
			bulbros.find((b) => b.id === args.bulbroId) || wellRoundedBulbro;

		return (
			<div
				style={{
					padding: "20px",
					display: "flex",
					flexDirection: "column",
					gap: "20px",
				}}
			>
				<h2>Bulbro Stats Component</h2>
				<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
					<BulbroTitle bulbro={bulbro} rarity={args.rarity} />
					<div style={{ display: "flex", gap: "20px" }}>
						<div style={{ flex: 1 }}>
							<div style={{ width: "300px", height: "220px" }}>
								<BulbroDisplayComponent bulbro={bulbro} />
							</div>
						</div>
						<div style={{ flex: 1 }}>
							<BulbroStats bulbro={bulbro} />
						</div>
					</div>
				</div>
			</div>
		);
	},
	args: {
		bulbroId: wellRoundedBulbro.id,
		rarity: "rare",
	},
	argTypes: {
		bulbroId: {
			options: bulbros.map((b) => b.id),
			control: { type: "select" },
		},
		rarity: {
			options: ["common", "uncommon", "rare", "exceptional", "legendary"],
			control: { type: "select" },
		},
	},
};
