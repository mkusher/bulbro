import {
	BulbroDisplay as BulbroDisplayComponent,
	BulbroCard as BulbroCardComponent,
} from "../bulbro/BulbroDisplay";
import { BulbroTitle } from "../bulbro/BulbroTitle";
import { BulbroStats } from "../bulbro/BulbroStats";
import { BulbroSelector } from "../ui/BulbroSelector";
import { wellRoundedBulbro, bulbros } from "@/characters-definitions";
import type { BulbroRarity } from "../bulbro/BulbroTitle";
import { useState } from "preact/hooks";
import type { Bulbro } from "../bulbro";

export default {
	title: "Bulbros",
	component: BulbroDisplayComponent,
};

// This file is now a placeholder for the main Bulbros section
// Individual stories have been moved to:
// - BulbroGameScenes.stories.tsx (for game scene animations)
// - BulbroShowcase.stories.tsx (for gallery and component showcases)

export const Overview = {
	render: () => (
		<div
			style={{
				padding: "40px",
				display: "flex",
				flexDirection: "column",
				gap: "30px",
				maxWidth: "800px",
				margin: "0 auto",
			}}
		>
			<h1 style={{ marginBottom: "20px", textAlign: "center" }}>Bulbros</h1>
			<p style={{ fontSize: "18px", lineHeight: "1.6", textAlign: "center" }}>
				Bulbros are the main characters in our roguelike arcade shooter game.
				Each bulbro is a unique potato-shaped character with different stats,
				weapons, and abilities.
			</p>

			<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
				<div
					style={{
						padding: "20px",
						border: "1px solid #ccc",
						borderRadius: "8px",
					}}
				>
					<h3>🎮 Game Scenes</h3>
					<p>
						View animated bulbros in action with various movement patterns and
						interactions.
					</p>
					<small>
						Navigate to: <strong>Bulbros → Game Scenes</strong>
					</small>
				</div>

				<div
					style={{
						padding: "20px",
						border: "1px solid #ccc",
						borderRadius: "8px",
					}}
				>
					<h3>🖼️ Gallery & Showcase</h3>
					<p>
						Browse all available bulbro characters and see detailed component
						showcases.
					</p>
					<small>
						Navigate to: <strong>Bulbros → Gallery & Showcase</strong>
					</small>
				</div>
			</div>

			<div
				style={{
					marginTop: "30px",
					padding: "20px",
					backgroundColor: "#f5f5f5",
					borderRadius: "8px",
				}}
			>
				<h4>Character Features:</h4>
				<ul style={{ lineHeight: "1.8" }}>
					<li>🗡️ Up to 6 weapons per character</li>
					<li>📊 15 different stats (HP, damage, speed, luck, etc.)</li>
					<li>🏷️ Rarity system (common to legendary)</li>
					<li>🎨 Unique sprite animations and expressions</li>
					<li>⚔️ Different weapon classes and bonuses</li>
				</ul>
			</div>
		</div>
	),
};

export const Selector = {
	render: () => {
		const [selectedBulbro, setSelectedBulbro] =
			useState<Bulbro>(wellRoundedBulbro);

		return (
			<div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
				<h2 style={{ marginBottom: "20px" }}>Bulbro Selector</h2>
				<BulbroSelector
					selectedBulbro={selectedBulbro}
					onChange={setSelectedBulbro}
				/>
				<div
					style={{
						marginTop: "20px",
						padding: "10px",
						backgroundColor: "#f0f0f0",
						borderRadius: "4px",
					}}
				>
					<strong>Selected:</strong> {selectedBulbro.name}
				</div>
			</div>
		);
	},
};
