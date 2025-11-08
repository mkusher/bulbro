import * as PIXI from "pixi.js";
import {
	useEffect,
	useRef,
} from "preact/hooks";
import { Assets } from "@/Assets";

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

	useEffect(() => {
		const container =
			divRef.current;
		if (
			!container
		)
			return;

		let app: PIXI.Application | null =
			null;

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

				app =
					new PIXI.Application();
				await app.init(
					{
						width:
							initialWidth,
						height:
							initialHeight,
						backgroundColor,
					},
				);

				if (
					onInit
				) {
					await onInit(
						app,
						container,
					);
				}

				await Assets.preloadAll();

				await new Promise(
					(
						resolve,
					) =>
						setTimeout(
							resolve,
							100,
						),
				);

				const dataUrl =
					app.canvas.toDataURL();

				const img =
					document.createElement(
						"img",
					);
				img.src =
					dataUrl;
				img.style.width =
					"100%";
				img.style.height =
					"100%";

				container.appendChild(
					img,
				);

				app.ticker?.stop();
				app.destroy();
				app =
					null;
			};

		const initPromise =
			initPixi();

		return async () => {
			await initPromise;
			if (
				app
			) {
				try {
					app.ticker?.stop();
					app.destroy();
					app =
						null;
				} catch (e) {
					console.error(
						"PixiApp cleanup failed",
						e,
					);
				}
			}
		};
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
		/>
	);
}
