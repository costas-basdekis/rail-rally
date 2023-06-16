import _ from "underscore";
import {Tile} from "@/rails/Tile";

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

  connect([first, second]: [Tile, Tile]): this {
    if (!this.canConnect([first, second])) {
      throw new Error(`Cannot connect ${first.positionStr} to ${second.positionStr}`);
    }
    first.connectTo(second);
    second.connectTo(first);
    return this;
  }
}
