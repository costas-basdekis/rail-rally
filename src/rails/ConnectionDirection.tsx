import _ from "underscore";

export interface Position {
  x: number;
  y: number;
}

const items = [
  "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "top-left",
] as const;

export const connectionDirections: {
  items: ConnectionDirection[],
  offsetMap: {[key: ConnectionDirection]: Position},
  positionByDirectionMap: Map<ConnectionDirection, Position>,
  oppositeMap: { [key: ConnectionDirection]: ConnectionDirection },
  connectableDirections: {[key: ConnectionDirection]: ConnectionDirection[]},
  otherConnectionsByOffset: {[key: ConnectionDirection]: {[key: number]: ConnectionDirection[]}},
  areAllDirectionsNeighbours: (directions: ConnectionDirection[]) => boolean,
  areTwoDirectionsNeighbours: (first: ConnectionDirection, second: ConnectionDirection) => boolean,
  getTilePositionInDirection: (position: Position, direction: ConnectionDirection) => Position,
} = {
  items,
  offsetMap: {
    top: {x: 0, y: -1},
    "top-right": {x: 1, y: -1},
    right: {x: 1, y: 0},
    "bottom-right": {x: 1, y: 1},
    bottom: {x: 0, y: 1},
    "bottom-left": {x: -1, y: 1},
    left: {x: -1, y: 0},
    "top-left": {x: -1, y: -1},
  },
  positionByDirectionMap: new Map([
    ["top", {x: 0.5, y: 0}],
    ["bottom", {x: 0.5, y: 1}],
    ["left", {x: 0, y: 0.5}],
    ["right", {x: 1, y: 0.5}],
    ["top-left", {x: 0, y: 0}],
    ["top-right", {x: 1, y: 0}],
    ["bottom-right", {x: 1, y: 1}],
    ["bottom-left", {x: 0, y: 1}],
  ]),
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
  areAllDirectionsNeighbours(directions: ConnectionDirection[]): boolean {
    return directions.every(first => directions.some(second => first !== second && this.areTwoDirectionsNeighbours(first, second)));
  },
  areTwoDirectionsNeighbours(first: ConnectionDirection, second: ConnectionDirection): boolean {
    return [
      ...connectionDirections.otherConnectionsByOffset[first][1],
      ...connectionDirections.otherConnectionsByOffset[first][2],
    ].includes(second);
  },
  getTilePositionInDirection(position: Position, direction: ConnectionDirection): Position {
    const offset = this.offsetMap[direction];
    return {
      x: position.x + offset.x,
      y: position.y + offset.y,
    };
  },
};
export type ConnectionDirection = (
  "top" | "top-right" | "right" | "bottom-right" | "bottom" | "bottom-left" | "left" | "top-left"
);
