import {Grid} from "./Grid";

export const connectionDirections: {
  items: ConnectionDirection[],
  oppositeMap: {[key: ConnectionDirection]: ConnectionDirection},
} = {
  items: [
    "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "top-left",
  ] as const,
  oppositeMap: {
    top: "bottom",
    "top-right": "bottom-left",
    right: "left",
    "bottom-right": "top-left",
    bottom: "top",
    "bottom-left": "top-right",
    "left": "right",
    "top-left": "bottom-right",
  },
};
export type ConnectionDirection = typeof connectionDirections.items[number];

export class Tile {
  grid: Grid;
  x: number;
  y: number;
  internalConnections: [ConnectionDirection, ConnectionDirection][] = [];
  deadEndInternalConnections: ConnectionDirection[] = [];
  externalConnections: ConnectionDirection[] = [];

  static empty(): Tile {
    return Grid.fromSize(1, 1).get(0, 0);
  }

  static fromConnections(internalConnections: [ConnectionDirection, ConnectionDirection][] = [], deadEndInternalConnections: ConnectionDirection[] = []): Tile {
    const tile = this.empty();
    for (const connection of internalConnections) {
      tile.addInternalConnection(connection);
    }
    for (const direction of deadEndInternalConnections) {
      tile.addDeadEndInternalConnection(direction);
    }
    return tile;
  }

  constructor(grid: Grid, x: number, y: number) {
    this.grid = grid;
    this.x = x;
    this.y = y;
  }

  canAddInternalConnection([first, second]: [ConnectionDirection, ConnectionDirection]): boolean {
    if (first === second) {
      throw new Error("Cannot add connection with same start and end");
    }
    [first, second] = [first, second].sort();
    if (this.internalConnections.find(([otherFirst, otherSecond]) => otherFirst === first && otherSecond === second)) {
      return false;
    }
    return true;
  }

  addInternalConnection([first, second]: [ConnectionDirection, ConnectionDirection]): this {
    [first, second] = [first, second].sort();
    if (!this.canAddInternalConnection([first, second])) {
      throw new Error(`Cannot add new internal connection from "${first}" to "${second}"`);
    }
    this.internalConnections.push([first, second]);
    this.removeDeadEndInternalConnection(first);
    this.removeDeadEndInternalConnection(second);
    this.addExternalConnection(first);
    this.addExternalConnection(second);
    return this;
  }

  hasExternalConnection(direction: ConnectionDirection): boolean {
    return this.externalConnections.includes(direction);
  }

  addExternalConnection(direction: ConnectionDirection): this {
    if (!this.externalConnections.includes(direction)) {
      this.externalConnections.push(direction);
    }
    return this;
  }

  canAddDeadEndInternalConnection(direction: ConnectionDirection): boolean {
    if (this.externalConnections.includes(direction)) {
      return false;
    }
    return true;
  }

  addDeadEndInternalConnection(direction: ConnectionDirection): this {
    if (!this.canAddDeadEndInternalConnection(direction)) {
      throw new Error(`Cannot add dead-end internal connection "${direction}"`);
    }
    this.deadEndInternalConnections.push(direction);
    this.addExternalConnection(direction);

    return this;
  }

  removeDeadEndInternalConnection(direction: ConnectionDirection): this {
    const index = this.deadEndInternalConnections.indexOf(direction);
    if (index > -1) {
      this.deadEndInternalConnections.splice(index, 1);
    }
    return this;
  }

  offsetDirectionMap: Map<number, Map<number, ConnectionDirection>> = new Map([
    [1, new Map([
      [1, "bottom-right"],
      [0, "right"],
      [-1, "top-right"],
    ])],
    [0, new Map([
      [1, "bottom"],
      [-1, "top"],
    ])],
    [-1, new Map([
      [1, "bottom-left"],
      [0, "left"],
      [-1, "top-left"],
    ])],
  ]);

  isNextTo(other: Tile): boolean {
    return this.offsetDirectionMap.get(other.x - this.x)?.has(other.y - this.y) ?? false;
  }

  getDirectionOfTile(other: Tile): ConnectionDirection {
    const direction = this.offsetDirectionMap.get(other.x - this.x)?.get(other.y - this.y);
    if (!direction) {
      throw new Error(`Tile ${other.x},${other.y} is not next to ${this.x},${this.y}`);
    }
    return direction;
  }

  canConnectTo(other: Tile): boolean {
    if (!this.isNextTo(other)) {
      return false;
    }
    const direction = this.getDirectionOfTile(other);
    if (this.hasExternalConnection(direction)) {
      return false;
    }
    return true;
  }

  connectTo(other: Tile): this {
    if (!this.canConnectTo(other)) {
      throw new Error(`Tile ${this.x},${this.y} cannot connect to ${other.x},${other.y}`);
    }
    this.addDeadEndInternalConnection(this.getDirectionOfTile(other));
    return this;
  }

  getConnectableTiles(grid: Grid): Tile[] {
    const others = [];
    for (const xOffset of [-1, 0, 1]) {
      for (const yOffset of [-1, 0, 1]) {
        if (xOffset === 0 && yOffset === 0) {
          continue;
        }
        const other = grid.getIfExists(this.x + xOffset, this.y + yOffset);
        if (!other) {
          continue;
        }
        if (!this.canConnectTo(other)) {
          continue;
        }
        others.push(other);
      }
    }
    return others;
  }
}
