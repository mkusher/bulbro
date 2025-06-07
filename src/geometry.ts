/**
 * 2D point.
 */
export interface Point {
	x: number;
	y: number;
}
export type Position = Point;
export type Direction = Point;

/**
 * 2D size.
 */
export interface Size {
	width: number;
	height: number;
}

/**
 * Axis-aligned rectangle (position is top-left corner).
 */
export interface Rectangle {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * Line segment between two points.
 */
/**
 * Line segment between two points.
 */
export interface Line {
	start: Point;
	end: Point;
}

/** Alias for a line segment. */
export type LineSegment = Line;

export function distance(p1: Point, p2: Point) {
	return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

export function direction(from: Point, to: Point) {
	return normalize({
		x: to.x - from.x,
		y: to.y - from.y,
	});
}

export function normalize(p: Point) {
	const d = Math.hypot(p.x, p.y);
	return {
		x: p.x / d,
		y: p.y / d,
	};
}

/**
 * Check if a point lies within (or on edge of) a rectangle.
 */
export function rectContainsPoint(rect: Rectangle, point: Point): boolean {
	return (
		point.x >= rect.x &&
		point.x <= rect.x + rect.width &&
		point.y >= rect.y &&
		point.y <= rect.y + rect.height
	);
}

/**
 * Check if two axis-aligned rectangles intersect.
 */
export function rectsIntersect(r1: Rectangle, r2: Rectangle): boolean {
	return (
		r1.x < r2.x + r2.width &&
		r1.x + r1.width > r2.x &&
		r1.y < r2.y + r2.height &&
		r1.y + r1.height > r2.y
	);
}

/**
 * Helper: test if two line segments intersect.
 */
export function segmentsIntersect(s1: LineSegment, s2: LineSegment): boolean {
	const { start: p1, end: p2 } = s1;
	const { start: p3, end: p4 } = s2;
	const ccw = (a: Point, b: Point, c: Point): boolean =>
		(c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
	return (
		ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4)
	);
}

/**
 * Check if an axis-aligned rectangle intersects a line segment.
 */
/**
 * Check if an axis-aligned rectangle intersects a line segment.
 */
export function rectIntersectsLine(
	rect: Rectangle,
	line: LineSegment,
): boolean {
	// If either endpoint inside, it's intersecting
	if (
		rectContainsPoint(rect, line.start) ||
		rectContainsPoint(rect, line.end)
	) {
		return true;
	}
	// Check intersection with each rectangle side
	const topLeft: Point = { x: rect.x, y: rect.y };
	const topRight: Point = { x: rect.x + rect.width, y: rect.y };
	const bottomLeft: Point = { x: rect.x, y: rect.y + rect.height };
	const bottomRight: Point = {
		x: rect.x + rect.width,
		y: rect.y + rect.height,
	};
	if (
		segmentsIntersect(line, { start: topLeft, end: topRight }) ||
		segmentsIntersect(line, { start: topRight, end: bottomRight }) ||
		segmentsIntersect(line, { start: bottomRight, end: bottomLeft }) ||
		segmentsIntersect(line, { start: bottomLeft, end: topLeft })
	) {
		return true;
	}
	return false;
}
