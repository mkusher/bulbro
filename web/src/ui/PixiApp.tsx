import type * as PIXI from "pixi.js";
import {
	useEffect,
	useRef,
	useState,
} from "preact/hooks";
import { Assets } from "@/Assets";
import { createPixiInitOptions } from "@/graphics/PixiConfiguration";
import { PixiAppSemaphore } from "./PixiAppSemaphore";

const pixiAppSemaphore =
	new PixiAppSemaphore(
		2,
	);

const sleep =
	(
		delay: number,
	) =>
		new Promise(
			(
				res,
			) => {
				setTimeout(
					res,
					delay,
				);
			},
		);

export type PixiAppProps =
	{
		width?: number;
		height?: number;
		minWidth?: number;
		minHeight?: number;
		backgroundColor?: number;
		className?: string;
		style?: React.CSSProperties;
		onInit?: (
			app: PIXI.Application,
			canvas: HTMLDivElement,
		) => Promise<void> | void;
		dependencies?: any[];
	};

export function PixiApp({
	width,
	height,
	minWidth,
	minHeight,
	backgroundColor = 0x000000,
	className,
	style,
	onInit,
	dependencies = [],
}: PixiAppProps) {
	const divRef =
		useRef<HTMLDivElement>(
			null,
		);
	const [
		imageDataUrl,
		setImageDataUrl,
	] =
		useState<
			| string
			| null
		>(
			null,
		);

	useEffect(() => {
		const container =
			divRef.current;
		if (
			!container
		)
			return;

		const initPixi =
			async () => {
				const rect =
					container.getBoundingClientRect();
				const initialWidth =
					width ||
					Math.max(
						rect.width ||
							minWidth ||
							100,
						minWidth ||
							100,
					);
				const initialHeight =
					height ||
					Math.max(
						rect.height ||
							minHeight ||
							100,
						minHeight ||
							100,
					);

				const app =
					await pixiAppSemaphore.take();
				try {
					await Assets.preloadAll();
					await app.init(
						createPixiInitOptions(
							{
								width:
									initialWidth,
								height:
									initialHeight,
								backgroundColor,
							},
						),
					);

					if (
						onInit
					) {
						await onInit(
							app,
							container,
						);
					}

					await sleep(
						100,
					);

					const dataUrl =
						app.canvas.toDataURL();
					setImageDataUrl(
						dataUrl,
					);
				} finally {
					app.ticker?.stop();
					app.destroy();
					pixiAppSemaphore.release();
				}
			};

		initPixi();

		return () => {};
	}, [
		width,
		height,
		minWidth,
		minHeight,
		backgroundColor,
		onInit,
		...dependencies,
	]);

	return (
		<div
			ref={
				divRef
			}
			className={
				className
			}
			style={{
				width:
					width
						? `${width}px`
						: "100%",
				height:
					height
						? `${height}px`
						: "100%",
				minWidth:
					minWidth
						? `${minWidth}px`
						: undefined,
				minHeight:
					minHeight
						? `${minHeight}px`
						: undefined,
				...style,
			}}
		>
			{imageDataUrl && (
				<img
					src={
						imageDataUrl
					}
					style={{
						width:
							"100%",
						height:
							"100%",
					}}
					alt=""
				/>
			)}
		</div>
	);
}
