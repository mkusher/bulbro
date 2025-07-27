import { BulbroSpriteRenderer } from "../ui/BulbroSpriteRenderer";
import { wellRoundedBulbro } from "@/characters-definitions";
import type { SpriteType } from "@/bulbro/Sprite";

export default {
	title: "Components/BulbroSpriteRenderer",
	component: BulbroSpriteRenderer,
};

const controls = {
	args: {
		width: 400,
		height: 300,
		debug: false,
		centerSprite: true,
	},
	argTypes: {
		width: { control: { type: "range", min: 80, max: 1920, step: 10 } },
		height: { control: { type: "range", min: 80, max: 1080, step: 10 } },
		debug: { control: "boolean" },
		centerSprite: { control: "boolean" },
	},
} as const;

export const DarkOracle = {
	render: (args: any) => (
		<BulbroSpriteRenderer
			spriteType="dark oracle"
			bulbro={wellRoundedBulbro}
			{...args}
		/>
	),
	...controls,
};

export const Necromancer = {
	render: (args: any) => (
		<BulbroSpriteRenderer
			spriteType="necromancer"
			bulbro={wellRoundedBulbro}
			{...args}
		/>
	),
	...controls,
};

export const AllSprites = {
	render: (args: any) => {
		const sprites: SpriteType[] = [
			"dark oracle",
			"necromancer",
			"shooter",
			"soldier",
			"valkyrie",
			"simple bulbro",
		];

		return (
			<div
				style={{
					display: "flex",
					flexWrap: "wrap",
					gap: "20px",
					padding: "20px",
				}}
			>
				{sprites.map((sprite) => (
					<div key={sprite} style={{ textAlign: "center" }}>
						<h3 style={{ margin: "0 0 10px 0", color: "#fff" }}>
							{sprite.charAt(0).toUpperCase() + sprite.slice(1)}
						</h3>
						<BulbroSpriteRenderer
							spriteType={sprite}
							bulbro={wellRoundedBulbro}
							width={args.width}
							height={args.height}
							debug={args.debug}
							centerSprite={args.centerSprite}
						/>
					</div>
				))}
			</div>
		);
	},
	...controls,
};

export const WithAnimation = {
	render: (args: any) => (
		<BulbroSpriteRenderer
			spriteType="dark oracle"
			bulbro={wellRoundedBulbro}
			tick={(deltaTime) => {
				// This would be where you could add sprite animations
				// For now, the sprite system handles its own animations
			}}
			{...args}
		/>
	),
	...controls,
};
