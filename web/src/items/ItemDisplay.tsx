import atlas from "@/assets/items.json";
import type { ItemDefinition } from "./Items";

const atlasUrl =
	new URL(
		"../assets/items.png",
		import.meta
			.url,
	)
		.href;

export type ItemDisplayProps =
	{
		item: Pick<
			ItemDefinition,
			"id"
		>;
		size?: number;
		className?: string;
	};

/** Decorative atlas artwork; the containing tile supplies the localized name. */
export function ItemDisplay({
	item,
	size = 48,
	className = "",
}: ItemDisplayProps) {
	const frame =
		Object.hasOwn(
			atlas.frames,
			item.id,
		)
			? atlas
					.frames[
					item.id as keyof typeof atlas.frames
				]
			: undefined;
	if (
		!frame
	)
		return null;
	const scale =
		size /
		frame.w;
	return (
		<span
			aria-hidden="true"
			className={`item-sprite inline-block shrink-0 ${className}`}
			style={{
				width:
					size,
				height:
					frame.h *
					scale,
				backgroundImage: `url("${atlasUrl}")`,
				backgroundRepeat:
					"no-repeat",
				backgroundSize: `${atlas.meta.size.w * scale}px ${atlas.meta.size.h * scale}px`,
				backgroundPosition: `${-frame.x * scale}px ${-frame.y * scale}px`,
			}}
		/>
	);
}
