export const connectionDirections = [
  "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "top-left",
] as const;
export type ConnectionDirection = typeof connectionDirections[number];

export class Tile {
  internalConnections: [ConnectionDirection, ConnectionDirection][] = [];
  deadEndInternalConnections: ConnectionDirection[] = [];
  externalConnections: ConnectionDirection[] = [];

  static empty(): Tile {
    return new Tile();
  }

  static fromConnections(internalConnections: [ConnectionDirection, ConnectionDirection][] = [], deadEndInternalConnections: ConnectionDirection[] = []): Tile {
    const tile = new Tile();
    for (const connection of internalConnections) {
      tile.addInternalConnection(connection);
    }
    for (const direction of deadEndInternalConnections) {
      tile.addDeadEndInternalConnection(direction);
    }
    return tile;
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
    this.addExternalDirection(first);
    this.addExternalDirection(second);
    return this;
  }

  addExternalDirection(first: string): this {
    if (!this.externalConnections.includes(first)) {
      this.externalConnections.push(first);
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
    this.addExternalDirection(direction);

    return this;
  }

  removeDeadEndInternalConnection(direction: ConnectionDirection): this {
    const index = this.deadEndInternalConnections.indexOf(direction);
    if (index > -1) {
      this.deadEndInternalConnections.splice(index, 1);
    }
    return this;
  }
}
