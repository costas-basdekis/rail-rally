import _ from "underscore";
import {ConnectionDirection, connectionDirections, Position} from "./ConnectionDirection";
import {Tile} from "./Tile";
import {Grid} from "./Grid";

export class Train {
  startPosition: Position;
  targetPosition: Position;
  pointPosition: Position;
  connectionLength: number;
  connectionProgress: number;
  tile: Tile;
  direction: ConnectionDirection;
  nextTile: Tile | null;

  static startNew(grid: Grid): Train | null {
    const tilesWithDeadEndConnections = Array.from(grid.tiles()).filter(tile => tile.deadEndInternalConnections.length);
    if (!tilesWithDeadEndConnections.length) {
      return null;
    }
    const tile = tilesWithDeadEndConnections[_.random(0, tilesWithDeadEndConnections.length - 1)];
    return this.startFromTile(tile, grid);
  }

  static startFromTile(tile: Tile, grid: Grid): Train {
    const direction = tile.externalConnections[_.random(0, tile.externalConnections.length - 1)];
    return this.startFromTileAndDeadEndDirection(tile, direction, grid);
  }

  static startFromTileAndDeadEndDirection(tile: Tile, outgoingDirection: ConnectionDirection, grid: Grid): Train {
    const direction = outgoingDirection;
    const startPosition = {x: tile.x + 0.5, y: tile.y + 0.5};
    const directionOffset = connectionDirections.positionByDirectionMap.get(direction)!;
    const targetPosition = {x: tile.x + directionOffset.x, y: tile.y + directionOffset.y};
    return new Train({
      startPosition,
      targetPosition,
      pointPosition: this.interpolatePoint(startPosition, targetPosition, 0),
      connectionLength: this.getPointDistance(startPosition, targetPosition),
      connectionProgress: 0,
      tile,
      direction,
      nextTile: grid.getTileInDirection(tile, direction),
    });
  }

  static startFromTileDirection(tile: Tile, incomingDirection: ConnectionDirection, grid: Grid): Train {
    const startDirectionOffset = connectionDirections.positionByDirectionMap.get(incomingDirection)!;
    const startPosition = {x: tile.x + startDirectionOffset.x, y: tile.y + startDirectionOffset.y};
    const targetDirections = tile.getConnectionsFrom(incomingDirection);
    let targetPosition: Position, direction: ConnectionDirection, nextTile: Tile | null;
    if (targetDirections.length) {
      direction = targetDirections[_.random(0, targetDirections.length - 1)];
      const targetDirectionOffset = connectionDirections.positionByDirectionMap.get(direction)!;
      targetPosition = {x: tile.x + targetDirectionOffset.x, y: tile.y + targetDirectionOffset.y};
      nextTile = grid.getTileInDirection(tile, direction);
    } else {
      targetPosition = {x: tile.x + 0.5, y: tile.y + 0.5};
      direction = connectionDirections.oppositeMap[incomingDirection];
      nextTile = null;
    }
    return new Train({
      startPosition,
      targetPosition,
      pointPosition: this.interpolatePoint(startPosition, targetPosition, 0),
      connectionLength: this.getPointDistance(startPosition, targetPosition),
      connectionProgress: 0,
      tile,
      direction,
      nextTile,
    });
  }

  static getPointDistance(first: Position, second: Position): number {
    const dX = first.x - second.x, dY = first.y - second.y;
    return Math.sqrt(dX * dX + dY * dY);
  }

  static interpolatePoint(start: Position, end: Position, progress: number): Position {
    return {
      x: start.x + (end.x - start.x) * progress,
      y: start.y + (end.y - start.y) * progress,
    };
  }

  constructor(init : {
    startPosition: Position;
    targetPosition: Position;
    pointPosition: Position;
    connectionLength: number;
    connectionProgress: number;
    tile: Tile;
    direction: ConnectionDirection;
    nextTile: Tile | null;
  }) {
    this.startPosition = init.startPosition;
    this.targetPosition = init.targetPosition;
    this.pointPosition = init.pointPosition;
    this.connectionLength = init.connectionLength;
    this.connectionProgress = init.connectionProgress;
    this.tile = init.tile;
    this.direction = init.direction;
    this.nextTile = init.nextTile;
  }

  animate(grid: Grid, connectionProgressIncrement: number = 0.2): Train {
    const connectionProgressTarget = this.connectionProgress + connectionProgressIncrement;
    const connectionProgress = Math.min(this.connectionLength, connectionProgressTarget);
    const connectionProgressLeftover = connectionProgressTarget - connectionProgress;
    const newProgress = connectionProgress / this.connectionLength;
    const pointPosition = Train.interpolatePoint(this.startPosition, this.targetPosition, newProgress);
    let train = new Train({
      startPosition: this.startPosition,
      targetPosition: this.targetPosition,
      pointPosition,
      connectionLength: this.connectionLength,
      connectionProgress,
      tile: this.tile,
      direction: this.direction,
      nextTile: this.nextTile,
    });
    if (newProgress === 1) {
      train = train.getNext(grid);
      // TODO: if we didn't manage to make any progress, we should worry
      if (connectionProgressLeftover && connectionProgressLeftover < connectionProgressTarget) {
        train = train.animate(grid, connectionProgressLeftover);
      }
    }
    return train;
  }

  getNext(grid: Grid): Train {
    if (!this.nextTile) {
      return Train.startFromTileAndDeadEndDirection(this.tile, connectionDirections.oppositeMap[this.direction], grid);
    }
    return Train.startFromTileDirection(this.nextTile, connectionDirections.oppositeMap[this.direction], grid);
  }
}
