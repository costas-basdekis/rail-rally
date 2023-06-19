import {Grid} from "@/rails/Grid";
import {Tile} from "@/rails/Tile";
import {ConnectionDirection, connectionDirections} from "@/rails/ConnectionDirection";
import {connections} from "@/rails/Connection";

class SearchNode {
  grid: Grid;
  tile: Tile;
  incomingDirection: ConnectionDirection | null;
  outgoingDirection: ConnectionDirection | null;
  edgeKey: string;
  distanceCovered: number;
  previous: SearchNode | null;

  static getEdgeKey(tile: Tile, outgoingDirection: ConnectionDirection | null): string {
    return `${tile.x},${tile.y}|${outgoingDirection}`;
  }

  constructor(grid: Grid, tile: Tile, incomingDirection: ConnectionDirection | null, outgoingDirection: ConnectionDirection | null, distanceCovered: number, previous: SearchNode | null) {
    this.grid = grid;
    this.tile = tile;
    this.incomingDirection = incomingDirection;
    this.outgoingDirection = outgoingDirection;
    this.edgeKey = SearchNode.getEdgeKey(tile, outgoingDirection);
    this.distanceCovered = distanceCovered;
    this.previous = previous;
  }

  *getNext(): Iterable<SearchNode> {
    if (!this.outgoingDirection) {
      return;
    }
    const nextTile = this.grid.getTileInDirection(this.tile, this.outgoingDirection);
    if (!nextTile) {
      return;
    }
    const nextIncomingDirection = connectionDirections.oppositeMap[this.outgoingDirection];
    let nextOutgoingDirections = nextTile.getConnectionsFrom(nextIncomingDirection);
    if (!nextOutgoingDirections.length) {
      nextOutgoingDirections = [null];
    }
    for (const nextOutgoingDirection of nextOutgoingDirections) {
      yield this.makeNext(nextTile, nextIncomingDirection, nextOutgoingDirection);
    }
  }

  makeNext(tile, incomingDirection: ConnectionDirection | null, outgoingDirection: ConnectionDirection | null): SearchNode {
    return new SearchNode(
      this.grid,
      tile,
      incomingDirection,
      outgoingDirection,
      this.distanceCovered + connections.map[incomingDirection][outgoingDirection].length,
      this,
    );
  }

  isWorseThan(other: SearchNode | null): boolean {
    return !!other && other.distanceCovered <= this.distanceCovered;
  }
}

export interface PathNode {
  tile: Tile;
  incomingDirection: ConnectionDirection | null;
  outgoingDirection: ConnectionDirection | null;
}

export type Path = PathNode[];

export class PathFinder {
  grid: Grid;
  startTile: Tile;
  endTile: Tile;
  searchStack: SearchNode[];
  minDistanceSearchNodePerEdge: {[key: string]: SearchNode};
  bestSearchNode: SearchNode | null;

  static findBestPath(grid: Grid, startTile: Tile, endTile: Tile): Path | null {
    return this.fromSearchParams(grid, startTile, endTile).findBestPath();
  }

  static fromSearchParams(grid: Grid, startTile: Tile, endTile: Tile): PathFinder {
    if (startTile === endTile) {
      throw new Error("Cannot search with same start and end");
    }
    const searchStack = startTile.externalConnections.map(outgoingDirection => {
      let incomingDirections: (ConnectionDirection | null)[] = startTile.getConnectionsFrom(outgoingDirection);
      if (!incomingDirections.length) {
        incomingDirections = [null];
      }
      return incomingDirections.map(incomingDirection => new SearchNode(
        grid,
        startTile,
        incomingDirection,
        outgoingDirection,
        0,
        null,
      ));
    }).flat();
    return new PathFinder(
      grid,
      startTile,
      endTile,
      searchStack,
      Object.fromEntries(searchStack.map(searchNode => [searchNode.edgeKey, searchNode] as const)),
      null,
    );
  }

  constructor(grid: Grid, startTile: Tile, endTile: Tile, searchStack: SearchNode[], minDistanceSearchNodePerEdge: {[key: string]: SearchNode}, bestSearchNode: SearchNode | null) {
    this.grid = grid;
    this.startTile = startTile;
    this.endTile = endTile;
    this.searchStack = searchStack;
    this.minDistanceSearchNodePerEdge = minDistanceSearchNodePerEdge;
    this.bestSearchNode = bestSearchNode;
  }

  findBestPath(): Path | null {
    this.search();
    if (!this.bestSearchNode) {
      return null;
    }
    return this.getBestPath();
  }

  getBestPath(): Path {
    if (!this.bestSearchNode) {
      throw new Error("No best path found yet");
    }
    const path = [];
    let node: SearchNode | null = this.bestSearchNode;
    while (node) {
      path.unshift({
        tile: node.tile,
        incomingDirection: node.incomingDirection,
        outgoingDirection: node.outgoingDirection,
      });
      node = node.previous;
    }
    return path;
  }

  search(): this {
    while (this.searchStack.length) {
      this.step();
    }
    return this;
  }

  step(): this {
    if (!this.searchStack.length) {
      return this;
    }
    const searchNode = this.searchStack.shift();
    if (searchNode.isWorseThan(this.bestSearchNode)) {
      return this;
    }
    for (const nextSearchNode of searchNode.getNext()) {
      if (nextSearchNode.isWorseThan(this.minDistanceSearchNodePerEdge[nextSearchNode.edgeKey])) {
        continue;
      }
      if (nextSearchNode.isWorseThan(this.bestSearchNode)) {
        continue;
      }
      this.minDistanceSearchNodePerEdge[nextSearchNode.edgeKey] = nextSearchNode;
      this.searchStack.push(nextSearchNode);
      if (nextSearchNode.tile === this.endTile) {
        this.bestSearchNode = nextSearchNode;
      }
    }
    return this;
  }
}
