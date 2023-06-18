import _ from "underscore";
import {Tile} from "@/rails/Tile";
import {ConnectionDirection, connectionDirections} from "@/rails/ConnectionDirection";
import {Position} from "@/rails/Position";

export interface SerialisedGrid {
  width: number;
  height: number;
  connections: { from: Position, to: Position }[];
}

export class Grid {
  width: number;
  height: number;
  tilesByPosition: Map<number, Map<number, Tile>> = new Map();

  static fromSize(width: number, height: number): Grid {
    const grid = new Grid(width, height);
    for (const x of _.range(width)) {
      for (const y of _.range(height)) {
        grid.tilesByPosition.set(x, grid.tilesByPosition.get(x) ?? new Map());
        grid.tilesByPosition.get(x)!.set(y, new Tile(this, x, y));
      }
    }
    return grid;
  }

  static deserialise(serialised: SerialisedGrid): Grid {
    const grid = this.fromSize(serialised.width, serialised.height);
    for (const {from, to} of serialised.connections) {
      grid.connect([grid.get(from.x, from.y), grid.get(to.x, to.y)]);
    }
    return grid;
  }

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  get(x: number, y: number): Tile {
    const tile = this.getIfExists(x, y);
    if (!tile) {
      throw new Error(`There's no tile on position ${x}, ${y}`);
    }
    return tile;
  }

  getIfExists(x: number, y: number): Tile | null {
    return this.tilesByPosition.get(x)?.get(y) ?? null;
  }

  *tiles(): Iterable<Tile> {
   for (const row of this.tilesByPosition.values()) {
     for (const tile of row.values()) {
       yield tile;
     }
   }
  }

  canConnect([first, second]: [Tile, Tile]): boolean {
    return first.canConnectTo(second);
  }

  connect([firstOrPosition, secondOrPosition]: [Tile | Position, Tile | Position]): this {
    let first: Tile, second: Tile;
    if (firstOrPosition instanceof Tile) {
      first = firstOrPosition;
    } else {
      first = this.get(firstOrPosition.x, firstOrPosition.y);
    }
    if (secondOrPosition instanceof Tile) {
      second = secondOrPosition;
    } else {
      second = this.get(secondOrPosition.x, secondOrPosition.y);
    }
    if (!this.canConnect([first, second])) {
      throw new Error(`Cannot connect ${first.positionStr} to ${second.positionStr}`);
    }
    first.connectTo(second, false);
    second.connectTo(first, false);
    return this;
  }

  connectMany(tilesOrPositions: (Tile | Position)[], closeLoop: boolean = false): this {
    if (!tilesOrPositions.length) {
      return this;
    }
    for (const index of _.range(tilesOrPositions.length - 1)) {
      this.connect([tilesOrPositions[index], tilesOrPositions[index + 1]]);
    }
    if (closeLoop && tilesOrPositions.length > 2) {
      this.connect([tilesOrPositions[tilesOrPositions.length - 1], tilesOrPositions[0]]);
    }
    return this;
  }

  getTileInDirection(tile: Tile, direction: ConnectionDirection): Tile | null {
    const {x, y} = connectionDirections.getTilePositionInDirection(tile, direction);
    return this.getIfExists(x, y);
  }

  serialise(): SerialisedGrid {
    const positionStrMap: {[key: string]: Tile} = {};
    const connectionMap: {[key: string]: {from: Tile, to: Tile}} = {};
    const connectionCount: {[key: string]: number} = {};
    for (const tile of this.tiles()) {
      if (!tile.externalConnections.length) {
        continue;
      }
      positionStrMap[tile.positionStr] = tile;
      for (const direction of tile.externalConnections) {
        const otherTile = this.getTileInDirection(tile, direction);
        if (!otherTile) {
          throw new Error(`Tile ${tile.positionStr} did not have a neighbour at direction ${direction}`);
        }
        const connectionKey = [tile.positionStr, otherTile.positionStr].sort().join(":");
        if (!(connectionKey in connectionMap)) {
          connectionMap[connectionKey] = {from: tile, to: otherTile};
        }
        connectionCount[connectionKey] = (connectionCount[connectionKey] ?? 0) + 1;
      }
    }
    const mismatchedConnections = Object.entries(connectionCount).filter(([, count]) => count != 2);
    if (mismatchedConnections.length) {
      throw new Error(
        `Some connections weren't present in exactly 2 tiles: `
        + `${mismatchedConnections.map(([key, count]) => `${key}: ${count} times`).join(", ")}`
      );
    }
    return {
      width: this.width,
      height: this.height,
      connections: Object.values(connectionMap).map(({from, to}) => ({
        from: {x: from.x, y: from.y},
        to: {x: to.x, y: to.y},
      })),
    };
  }
}
