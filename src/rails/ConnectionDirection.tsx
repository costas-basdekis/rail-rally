import _ from "underscore";

const items = [
  "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "top-left",
] as const;
export const connectionDirections: {
  items: ConnectionDirection[],
  oppositeMap: { [key: ConnectionDirection]: ConnectionDirection },
  connectableDirections: {[key: ConnectionDirection]: ConnectionDirection[]},
  otherConnectionsByOffset: {[key: ConnectionDirection]: {[key: number]: ConnectionDirection[]}},
} = {
  items,
  oppositeMap: Object.fromEntries(items.map((direction, index) => [direction, items[(index + 4) % 8]])),
  connectableDirections: Object.fromEntries(items.map((direction, index) => [
    direction,
    [items[(index + 3) % 8], items[(index + 4) % 8], items[(index + 5) % 8]],
  ] as const)),
  otherConnectionsByOffset: Object.fromEntries(items.map((direction, index) => [
    direction,
    Object.fromEntries(_.range(0, 5).map(offset => [
      offset,
      Array.from(new Set([items[(8 + index + offset) % 8], items[(8 + index - offset) % 8]])).sort(),
    ] as const)),
  ] as const)),
};
export type ConnectionDirection = (
  "top" | "top-right" | "right" | "bottom-right" | "bottom" | "bottom-left" | "left" | "top-left"
);
