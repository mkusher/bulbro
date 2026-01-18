import * as PIXI from "pixi.js";
import type { Size } from "../geometry";

/**
 * Coordinate grid overlay for debugging positions in Storybook.
 * Can be added to any container to show a coordinate grid.
 */
export class CoordinateGridOverlay {
	#graphics: PIXI.Graphics;
	#size: Size;

	constructor(
		size: Size,
	) {
		this.#size =
			size;
		this.#graphics =
			new PIXI.Graphics();
		this.#drawCoordinateGrid();
	}

	get graphics() {
		return this
			.#graphics;
	}

	appendTo(
		container: PIXI.Container,
	) {
		container.addChild(
			this
				.#graphics,
		);
	}

	remove() {
		this.#graphics.removeFromParent();
	}

	#drawCoordinateGrid() {
		const gridSize = 50; // Grid cell size in pixels
		const labelSize = 12;
		const gridColor = 0xffffff;
		const gridAlpha = 0.3;
		const labelColor = 0xffffff;
		const majorGridColor = 0xffff00;
		const majorGridAlpha = 0.5;

		// Draw vertical lines
		for (
			let x = 0;
			x <=
			this
				.#size
				.width;
			x +=
				gridSize
		) {
			const isMajor =
				x %
					500 ===
				0;
			this.#graphics
				.moveTo(
					x,
					0,
				)
				.lineTo(
					x,
					this
						.#size
						.height,
				)
				.stroke(
					{
						width:
							isMajor
								? 2
								: 1,
						color:
							isMajor
								? majorGridColor
								: gridColor,
						alpha:
							isMajor
								? majorGridAlpha
								: gridAlpha,
					},
				);

			// Add x coordinate label at top
			if (
				x >
				0
			) {
				const label =
					new PIXI.Text(
						{
							text: x.toString(),
							style:
								{
									fontSize:
										labelSize,
									fill: labelColor,
									fontFamily:
										"monospace",
								},
						},
					);
				label.x =
					x +
					2;
				label.y = 2;
				label.alpha = 0.7;
				this.#graphics.addChild(
					label,
				);
			}
		}

		// Draw horizontal lines
		for (
			let y = 0;
			y <=
			this
				.#size
				.height;
			y +=
				gridSize
		) {
			const isMajor =
				y %
					500 ===
				0;
			this.#graphics
				.moveTo(
					0,
					y,
				)
				.lineTo(
					this
						.#size
						.width,
					y,
				)
				.stroke(
					{
						width:
							isMajor
								? 2
								: 1,
						color:
							isMajor
								? majorGridColor
								: gridColor,
						alpha:
							isMajor
								? majorGridAlpha
								: gridAlpha,
					},
				);

			// Add y coordinate label on left
			if (
				y >
				0
			) {
				const label =
					new PIXI.Text(
						{
							text: y.toString(),
							style:
								{
									fontSize:
										labelSize,
									fill: labelColor,
									fontFamily:
										"monospace",
								},
						},
					);
				label.x = 2;
				label.y =
					y +
					2;
				label.alpha = 0.7;
				this.#graphics.addChild(
					label,
				);
			}
		}

		// Add origin marker
		const originMarker =
			new PIXI.Graphics()
				.circle(
					0,
					0,
					5,
				)
				.fill(
					{
						color: 0xff0000,
						alpha: 0.8,
					},
				);
		this.#graphics.addChild(
			originMarker,
		);

		// Add origin label
		const originLabel =
			new PIXI.Text(
				{
					text: "(0,0)",
					style:
						{
							fontSize:
								labelSize,
							fill: 0xff0000,
							fontFamily:
								"monospace",
							fontWeight:
								"bold",
						},
				},
			);
		originLabel.x = 8;
		originLabel.y = 8;
		this.#graphics.addChild(
			originLabel,
		);

		// Add corner markers with coordinates
		this.#addCornerMarker(
			this
				.#size
				.width,
			0,
			`(${this.#size.width},0)`,
		);
		this.#addCornerMarker(
			0,
			this
				.#size
				.height,
			`(0,${this.#size.height})`,
		);
		this.#addCornerMarker(
			this
				.#size
				.width,
			this
				.#size
				.height,
			`(${this.#size.width},${this.#size.height})`,
		);

		// Add center marker
		const centerX =
			this
				.#size
				.width /
			2;
		const centerY =
			this
				.#size
				.height /
			2;
		const centerMarker =
			new PIXI.Graphics()
				.moveTo(
					centerX -
						10,
					centerY,
				)
				.lineTo(
					centerX +
						10,
					centerY,
				)
				.moveTo(
					centerX,
					centerY -
						10,
				)
				.lineTo(
					centerX,
					centerY +
						10,
				)
				.stroke(
					{
						width: 2,
						color: 0x00ff00,
						alpha: 0.8,
					},
				);
		this.#graphics.addChild(
			centerMarker,
		);

		const centerLabel =
			new PIXI.Text(
				{
					text: `(${centerX},${centerY})`,
					style:
						{
							fontSize:
								labelSize,
							fill: 0x00ff00,
							fontFamily:
								"monospace",
							fontWeight:
								"bold",
						},
				},
			);
		centerLabel.x =
			centerX +
			12;
		centerLabel.y =
			centerY +
			2;
		this.#graphics.addChild(
			centerLabel,
		);
	}

	#addCornerMarker(
		x: number,
		y: number,
		label: string,
	) {
		const marker =
			new PIXI.Graphics()
				.circle(
					x,
					y,
					5,
				)
				.fill(
					{
						color: 0xff0000,
						alpha: 0.8,
					},
				);
		this.#graphics.addChild(
			marker,
		);

		const textLabel =
			new PIXI.Text(
				{
					text: label,
					style:
						{
							fontSize: 12,
							fill: 0xff0000,
							fontFamily:
								"monospace",
							fontWeight:
								"bold",
						},
				},
			);

		// Position label to avoid going outside bounds
		if (
			x ===
			this
				.#size
				.width
		) {
			textLabel.anchor.x = 1;
			textLabel.x =
				x -
				8;
		} else {
			textLabel.x =
				x +
				8;
		}

		if (
			y ===
			this
				.#size
				.height
		) {
			textLabel.anchor.y = 1;
			textLabel.y =
				y -
				8;
		} else {
			textLabel.y =
				y +
				8;
		}

		this.#graphics.addChild(
			textLabel,
		);
	}
}
