import _ from "underscore";
import {ConnectionDirection, connectionDirections, Position} from "./ConnectionDirection";
import {Tile} from "./Tile";
import {Grid} from "./Grid";

interface HistoryNode {
  distanceCovered: number;
  tile: Tile;
  connection: {from: ConnectionDirection, to: ConnectionDirection} | {from: ConnectionDirection, to: null} | {from: null, to: ConnectionDirection};
}

type History = HistoryNode[];

interface TrainInit {
  startPosition: Position;
  targetPosition: Position;
  pointPosition: Position;
  connectionLength: number;
  connectionProgress: number;
  tile: Tile;
  direction: ConnectionDirection;
  nextTile: Tile | null;
  tail: Position[];
  distanceCovered: number;
  history: History;
}

export class Train implements TrainInit {
  startPosition: Position;
  targetPosition: Position;
  pointPosition: Position;
  connectionLength: number;
  connectionProgress: number;
  tile: Tile;
  direction: ConnectionDirection;
  nextTile: Tile | null;
  tail: Position[];
  distanceCovered: number;
  history: History;

  static startNew(grid: Grid): Train | null {
    return this.startNewFromDeadEnd(grid) ?? this.startNewFromConnection(grid);
  }

  static startNewFromDeadEnd(grid: Grid): Train | null {
    const tilesWithDeadEndConnections = Array.from(grid.tiles()).filter(tile => tile.deadEndInternalConnections.length);
    if (!tilesWithDeadEndConnections.length) {
      return null;
    }
    const tile = tilesWithDeadEndConnections[_.random(0, tilesWithDeadEndConnections.length - 1)];
    return this.startFromTile(tile, grid, [], 0, []);
  }

  static startNewFromConnection(grid: Grid): Train | null {
    const tilesWithConnections = Array.from(grid.tiles()).filter(tile => tile.externalConnections.length);
    if (!tilesWithConnections.length) {
      return null;
    }
    const tile = tilesWithConnections[_.random(0, tilesWithConnections.length - 1)];
    return this.startFromTile(tile, grid, [], 0, []);
  }

  static startFromTile(tile: Tile, grid: Grid, tail: Position[], distanceCovered: number, history: History): Train {
    const direction = tile.externalConnections[_.random(0, tile.externalConnections.length - 1)];
    return this.startFromTileAndDeadEndDirection(tile, direction, grid, tail, distanceCovered, history);
  }

  static startFromTileAndDeadEndDirection(tile: Tile, outgoingDirection: ConnectionDirection, grid: Grid, tail: Position[], distanceCovered: number, history: History): Train {
    const direction = outgoingDirection;
    const startPosition = {x: tile.x + 0.5, y: tile.y + 0.5};
    const directionOffset = connectionDirections.positionByDirectionMap.get(direction)!;
    const targetPosition = {x: tile.x + directionOffset.x, y: tile.y + directionOffset.y};
    const newHistory = [
      {
        distanceCovered,
        tile,
        connection: {from: null, to: direction},
      },
      ...history,
    ].slice(0, 5);
    return new Train({
      startPosition,
      targetPosition,
      pointPosition: this.interpolatePoint(startPosition, targetPosition, 0),
      connectionLength: this.getPointDistance(startPosition, targetPosition),
      connectionProgress: 0,
      tile,
      direction,
      nextTile: grid.getTileInDirection(tile, direction),
      tail: tail,
      distanceCovered,
      history: newHistory,
    });
  }

  static startFromTileDirection(tile: Tile, incomingDirection: ConnectionDirection, grid: Grid, tail: Position[], distanceCovered: number, history: History): Train {
    const startDirectionOffset = connectionDirections.positionByDirectionMap.get(incomingDirection)!;
    const startPosition = {x: tile.x + startDirectionOffset.x, y: tile.y + startDirectionOffset.y};
    const targetDirections = tile.getConnectionsFrom(incomingDirection);
    let targetPosition: Position, direction: ConnectionDirection, nextTile: Tile | null, newHistory: History;
    if (targetDirections.length) {
      direction = targetDirections[_.random(0, targetDirections.length - 1)];
      const targetDirectionOffset = connectionDirections.positionByDirectionMap.get(direction)!;
      targetPosition = {x: tile.x + targetDirectionOffset.x, y: tile.y + targetDirectionOffset.y};
      nextTile = grid.getTileInDirection(tile, direction);
      newHistory = [
        {
          distanceCovered,
          tile,
          connection: {from: incomingDirection, to: direction},
        },
        ...history,
      ].slice(0, 5);
    } else {
      targetPosition = {x: tile.x + 0.5, y: tile.y + 0.5};
      direction = connectionDirections.oppositeMap[incomingDirection];
      nextTile = null;
      newHistory = [
        {
          distanceCovered,
          tile,
          connection: {from: incomingDirection, to: null},
        },
        ...history,
      ].slice(0, 5);
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
      tail: tail,
      distanceCovered,
      history: newHistory,
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

  constructor(init : TrainInit) {
    this.startPosition = init.startPosition;
    this.targetPosition = init.targetPosition;
    this.pointPosition = init.pointPosition;
    this.connectionLength = init.connectionLength;
    this.connectionProgress = init.connectionProgress;
    this.tile = init.tile;
    this.direction = init.direction;
    this.nextTile = init.nextTile;
    this.tail = init.tail;
    this.distanceCovered = init.distanceCovered;
    this.history = init.history;
  }

  animate(grid: Grid, connectionProgressIncrement: number = 0.2): Train {
    const connectionProgressTarget = this.connectionProgress + connectionProgressIncrement;
    const connectionProgress = Math.min(this.connectionLength, connectionProgressTarget);
    const connectionProgressLeftover = connectionProgressTarget - connectionProgress;
    const newProgress = connectionProgress / this.connectionLength;
    const pointPosition = Train.interpolatePoint(this.startPosition, this.targetPosition, newProgress);
    let train = this.copy({
      pointPosition,
      connectionProgress,
      tail: [this.pointPosition, ...this.tail].slice(0, 5),
      distanceCovered: this.distanceCovered + connectionProgress,
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

  copy(updates: Partial<TrainInit> = {}): Train {
    return new Train({
      startPosition: this.startPosition,
      targetPosition: this.targetPosition,
      pointPosition: this.pointPosition,
      connectionLength: this.connectionLength,
      connectionProgress: this.connectionProgress,
      tile: this.tile,
      direction: this.direction,
      nextTile: this.nextTile,
      tail: this.tail,
      distanceCovered: this.distanceCovered,
      history: this.history,
      ...updates,
    });
  }

  getNext(grid: Grid): Train {
    const nextDirection = connectionDirections.oppositeMap[this.direction];
    if (!this.nextTile) {
      return Train.startFromTileAndDeadEndDirection(this.tile, nextDirection, grid, this.tail, this.distanceCovered, this.history);
    }
    return Train.startFromTileDirection(this.nextTile, nextDirection, grid, this.tail, this.distanceCovered, this.history);
  }
}
