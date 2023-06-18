import _ from "underscore";
import {Position} from "@/rails/Position";

export type ConnectionDirection = (
  "top" | "top-right" | "right" | "bottom-right" | "bottom" | "bottom-left" | "left" | "top-left"
  );

class ConnectionDirections {
  items: ConnectionDirection[] = [
    "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "top-left",
  ] as const;

  offsetMap: {[key: ConnectionDirection]: Position} = {
    top: {x: 0, y: -1},
    "top-right": {x: 1, y: -1},
    right: {x: 1, y: 0},
    "bottom-right": {x: 1, y: 1},
    bottom: {x: 0, y: 1},
    "bottom-left": {x: -1, y: 1},
    left: {x: -1, y: 0},
    "top-left": {x: -1, y: -1},
  };
  centerOffset: Position = {x: 0.5, y: 0.5};

  positionByDirectionMap: {[key: ConnectionDirection]: Position} = {
    top: {x: 0.5, y: 0},
    bottom: {x: 0.5, y: 1},
    left: {x: 0, y: 0.5},
    right: {x: 1, y: 0.5},
    "top-left": {x: 0, y: 0},
    "top-right": {x: 1, y: 0},
    "bottom-right": {x: 1, y: 1},
    "bottom-left": {x: 0, y: 1},
  };

  oppositeMap: { [key: ConnectionDirection]: ConnectionDirection } =
    Object.fromEntries(this.items.map((direction, index) => [direction, (this.items)[(index + 4) % 8]]));

  connectableDirections: {[key: ConnectionDirection]: ConnectionDirection[]} =
    Object.fromEntries(this.items.map((direction, index) => [
      direction,
      [(this.items)[(index + 3) % 8], (this.items)[(index + 4) % 8], (this.items)[(index + 5) % 8]],
    ] as const));

  otherConnectionsByOffset: {[key: ConnectionDirection]: {[key: number]: ConnectionDirection[]}} =
    Object.fromEntries(this.items.map((direction, index) => [
      direction,
      Object.fromEntries(_.range(0, 5).map(offset => [
        offset,
        Array.from(new Set([(this.items)[(8 + index + offset) % 8], (this.items)[(8 + index - offset) % 8]])).sort(),
      ] as const)),
    ] as const));

  areAllDirectionsNeighbours(directions: ConnectionDirection[]): boolean {
    return directions.every(first => directions.some(second => first !== second && this.areTwoDirectionsNeighbours(first, second)));
  }

  areTwoDirectionsNeighbours(first: ConnectionDirection, second: ConnectionDirection): boolean {
    return [
      ...this.otherConnectionsByOffset[first][1],
      ...this.otherConnectionsByOffset[first][2],
    ].includes(second);
  }

  getTilePositionInDirection(position: Position, direction: ConnectionDirection): Position {
    const offset = this.offsetMap[direction];
    return {
      x: position.x + offset.x,
      y: position.y + offset.y,
    };
  }
}

export const connectionDirections = new ConnectionDirections();
