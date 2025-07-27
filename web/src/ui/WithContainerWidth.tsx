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
			setSize({
				width: el.offsetWidth,
				height: el.offsetHeight,
			});
		};
		el.addEventListener("resize", resize);
		setSize({
			width: el.offsetWidth,
			height: el.offsetHeight,
		});
		return () => {
			el.removeEventListener("resize", resize);
		};
	}, []);
	return <div ref={ref}>{children(size)}</div>;
}
