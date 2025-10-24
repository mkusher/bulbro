import type { Size } from "@/geometry";
import type { ComponentChildren } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

type Props = {
	children: (props: Size) => ComponentChildren;
};
export function WithContainerWidth({ children }: Props) {
	const ref = useRef<HTMLDivElement | null>(null);
	const [size, setSize] = useState({ width: 0, height: 0 });
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const resize = () => {
			const rect = el.getBoundingClientRect();
			setSize({
				width: Math.max(rect.width, 220), // Minimum width for tablets
				height: Math.max(rect.height, 220), // Minimum height for tablets
			});
		};

		const resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(el);

		// Initial size
		resize();

		return () => {
			resizeObserver.disconnect();
		};
	}, []);
	return (
		<div
			ref={ref}
			className="w-full h-full min-w-[180px] min-h-[180px] md:min-w-[280px] md:min-h-[280px] lg:min-w-[320px] lg:min-h-[320px]"
		>
			{children(size)}
		</div>
	);
}
