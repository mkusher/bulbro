import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "preact/compat";
import { cn } from "@/ui/shadcn/utils";
import styles from "./slider.module.css";

function Slider({
	className,
	defaultValue,
	value,
	min = 0,
	max = 100,
	...props
}: React.ComponentProps<
	typeof SliderPrimitive.Root
>) {
	const _values =
		React.useMemo(
			() =>
				Array.isArray(
					value,
				)
					? value
					: Array.isArray(
								defaultValue,
							)
						? defaultValue
						: [
								min,
								max,
							],
			[
				value,
				defaultValue,
				min,
				max,
			],
		);

	return (
		<SliderPrimitive.Root
			data-slot="slider"
			defaultValue={
				defaultValue
			}
			value={
				value
			}
			min={
				min
			}
			max={
				max
			}
			className={cn(
				"relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
				className,
			)}
			{...props}
		>
			<SliderPrimitive.Track
				data-slot="slider-track"
				className={cn(
					"bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
				)}
			>
				<SliderPrimitive.Range
					data-slot="slider-range"
					className={cn(
						"bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
					)}
				/>
			</SliderPrimitive.Track>
			{Array.from(
				{
					length:
						_values.length,
				},
				(
					_,
					index,
				) => (
					<SliderPrimitive.Thumb
						data-slot="slider-thumb"
						key={
							index
						}
						className="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
					/>
				),
			)}
		</SliderPrimitive.Root>
	);
}

export {
	LabeledSlider,
	Slider,
};

type LabeledSliderProps =
	Pick<
		React.ComponentProps<
			typeof SliderPrimitive.Root
		>,
		| "value"
		| "defaultValue"
		| "min"
		| "max"
		| "step"
		| "disabled"
		| "onValueChange"
		| "onValueCommit"
		| "className"
		| "id"
		| "name"
		| "aria-label"
		| "aria-labelledby"
	> & {
		label: string;
		displayValue?: string;
	};

function LabeledSlider({
	label,
	displayValue,
	value,
	defaultValue,
	min = 0,
	max = 100,
	step = 1,
	disabled,
	onValueChange,
	onValueCommit,
	className,
	id,
	name,
	"aria-label":
		ariaLabel,
	"aria-labelledby":
		ariaLabelledBy,
}: LabeledSliderProps) {
	const [
		internalValue,
		setInternalValue,
	] =
		React.useState(
			defaultValue?.[0] ??
				min,
		);
	const current =
		value?.[0] ??
		internalValue;
	const percent =
		max >
		min
			? Math.max(
					0,
					Math.min(
						100,
						((current -
							min) /
							(max -
								min)) *
							100,
					),
				)
			: 0;
	return (
		<span
			data-slot="slider"
			data-disabled={
				disabled
					? ""
					: undefined
			}
			className={cn(
				"relative block h-11 w-full rounded-lg border border-border bg-muted select-none data-[disabled]:opacity-50",
				className,
			)}
		>
			<span
				aria-hidden="true"
				className="pointer-events-none absolute inset-y-0 left-0 rounded-[inherit] bg-primary/25"
				style={{
					width: `calc(22px + (100% - 44px) * ${percent / 100})`,
				}}
			/>
			<span
				aria-hidden="true"
				className="pointer-events-none absolute inset-x-3 inset-y-0 z-10 flex items-center justify-between gap-3 whitespace-nowrap text-sm font-medium"
			>
				<span>
					{
						label
					}
				</span>
				<span className="shrink-0 font-semibold tabular-nums">
					{displayValue ??
						current}
				</span>
			</span>
			<input
				id={
					id
				}
				name={
					name
				}
				type="range"
				aria-label={
					ariaLabel ??
					label
				}
				aria-labelledby={
					ariaLabelledBy
				}
				aria-valuetext={
					displayValue
				}
				min={
					min
				}
				max={
					max
				}
				step={
					step
				}
				disabled={
					disabled
				}
				value={
					current
				}
				className={
					styles.input
				}
				onInput={(
					event,
				) => {
					const next =
						event
							.currentTarget
							.valueAsNumber;
					setInternalValue(
						next,
					);
					onValueChange?.(
						[
							next,
						],
					);
				}}
				onChange={(
					event,
				) =>
					onValueCommit?.(
						[
							event
								.currentTarget
								.valueAsNumber,
						],
					)
				}
			/>
		</span>
	);
}
