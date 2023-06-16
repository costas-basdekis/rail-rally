import {Grid} from "./Grid";
import {ConnectionDirection, connectionDirections} from "./ConnectionDirection";

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

  get positionStr(): string {
    return `${this.x},${this.y}`;
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
      throw new Error(`Tile ${other.positionStr} is not next to ${this.positionStr}`);
    }
    return direction;
  }

  canConnectTo(other: Tile, checkOther: boolean = true): boolean {
    const refusalReason = this.getConnectionRefusalReason(other, checkOther);
    // if (refusalReason) {
    //   console.log(`Can't connect ${this.positionStr} to ${other.positionStr}, since ${refusalReason}`);
    // }
    return refusalReason === null;
  }

  getConnectionRefusalReason(other: Tile, checkOther: boolean = true): string | null {
    if (checkOther) {
      const otherRefusalReason = other.getConnectionRefusalReason(this, false);
      if (otherRefusalReason) {
        return `the other one can't connect to this: ${otherRefusalReason}`;
      }
    }
    if (!this.isNextTo(other)) {
      return "they're not next to each other";
    }
    const direction = this.getDirectionOfTile(other);
    if (this.externalConnections.length === 3) {
      const crossDirections = [
        ...connectionDirections.otherConnectionsByOffset[direction][2],
        ...connectionDirections.otherConnectionsByOffset[direction][4],
      ];
      if (crossDirections.length !== 3 || crossDirections.some(item => !this.externalConnections.includes(item))) {
        return `this already has too many external non-cross connections (${this.externalConnections.length}, max 3)`;
      }
    }
    if (this.externalConnections.length >= 4) {
      return `this already has too many external connections (${this.externalConnections.length}, max 4)`;
    }
    if (this.hasExternalConnection(direction)) {
      return `there is already a '${direction}' external connection`;
    }
    const neighbourConnections = [
      ...connectionDirections.otherConnectionsByOffset[direction][1],
      ...connectionDirections.otherConnectionsByOffset[direction][2],
    ].filter(neighbourDirection => this.hasExternalConnection(neighbourDirection));
    if (neighbourConnections.length > 2) {
      // This should be impossible
      return `this has too many neighbour directions (${neighbourConnections.length})`;
    }
    const checkingDirections = [
      direction,
      ...this.externalConnections,
    ];
    if (!this.canDirectionsBeNeighbours(checkingDirections)) {
      return `there will be too many non-cross neighbour connections`;
    }
    return null;
  }

  canDirectionsBeNeighbours(directions: ConnectionDirection[]): boolean {
    return Tile.canDirectionsBeNeighbours(directions);
  }

  static canDirectionsBeNeighbours(directions: ConnectionDirection[]): boolean {
    if (directions.length < 3) {
      return true;
    }
    if (!this.areAllDirectionsNeighbours(directions)) {
      return true;
    }
    for (const checkingDirection of directions) {
      const crossConnections = [
          ...connectionDirections.otherConnectionsByOffset[checkingDirection][2],
          ...connectionDirections.otherConnectionsByOffset[checkingDirection][4],
        ].filter(neighbourDirection => directions.includes(neighbourDirection));
      if (crossConnections.length < 2) {
        return false;
      }
    }
    return true;
  }

  static areAllDirectionsNeighbours(directions: ConnectionDirection[]): boolean {
    return directions.every(first => directions.some(second => first !== second && this.areTwoDirectionsNeighbours(first, second)));
  }

  static areTwoDirectionsNeighbours(first: ConnectionDirection, second: ConnectionDirection): boolean {
    return [
      ...connectionDirections.otherConnectionsByOffset[first][1],
      ...connectionDirections.otherConnectionsByOffset[first][2],
    ].includes(second);
  }

  connectTo(other: Tile, check: boolean = true): this {
    if (check && !this.canConnectTo(other)) {
      throw new Error(`Tile ${this.positionStr} cannot connect to ${other.positionStr}`);
    }
    this.addDeadEndInternalConnection(this.getDirectionOfTile(other));
    const direction = this.getDirectionOfTile(other);
    const oppositeConnections = connectionDirections
      .connectableDirections[direction]
      .filter(connectableDirection => this.externalConnections.includes(connectableDirection));
    for (const connectableDirection of oppositeConnections) {
      this.addInternalConnection([direction, connectableDirection]);
    }
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
