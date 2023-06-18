import _ from "underscore";
import {ConnectionDirection, connectionDirections, Position, positions} from "./ConnectionDirection";
import {Tile} from "./Tile";
import {Grid} from "./Grid";

interface HistoryNode {
  distanceCovered: number;
  tile: Tile;
  connection: {from: ConnectionDirection | null, to: ConnectionDirection | null};
}

type History = HistoryNode[];

interface TrainCarInit {
  startPosition: Position;
  targetPosition: Position;
  pointPosition: Position;
  connectionLength: number;
  connectionProgress: number;
  tile: Tile;
  direction: ConnectionDirection;
  incomingDirection: ConnectionDirection | null;
  outgoingDirection: ConnectionDirection | null;
  nextTile: Tile | null;
  tail: Position[];
}

class TrainCar implements TrainCarInit {
  startPosition: Position;
  targetPosition: Position;
  pointPosition: Position;
  connectionLength: number;
  connectionProgress: number;
  tile: Tile;
  direction: ConnectionDirection;
  incomingDirection: ConnectionDirection | null;
  outgoingDirection: ConnectionDirection | null;
  nextTile: Tile | null;
  tail: Position[];

  static startFromTileAndDeadEndDirection(tile: Tile, outgoingDirection: ConnectionDirection, grid: Grid, tail: Position[]): TrainCar {
    const direction = outgoingDirection;
    const startPosition = {x: tile.x + 0.5, y: tile.y + 0.5};
    const directionOffset = connectionDirections.positionByDirectionMap.get(direction)!;
    const targetPosition = {x: tile.x + directionOffset.x, y: tile.y + directionOffset.y};
    return new TrainCar({
      startPosition,
      targetPosition,
      pointPosition: positions.interpolatePoint(startPosition, targetPosition, 0),
      connectionLength: positions.getPointDistance(startPosition, targetPosition),
      connectionProgress: 0,
      tile,
      direction,
      incomingDirection: null,
      outgoingDirection,
      nextTile: grid.getTileInDirection(tile, direction),
      tail: tail,
    });
  }

  static startFromTileAndDirection(tile: Tile, incomingDirection: ConnectionDirection, grid: Grid, tail: Position[]): TrainCar {
    const startDirectionOffset = connectionDirections.positionByDirectionMap.get(incomingDirection)!;
    const startPosition = {x: tile.x + startDirectionOffset.x, y: tile.y + startDirectionOffset.y};
    const targetDirections = tile.getConnectionsFrom(incomingDirection);
    let targetPosition: Position, direction: ConnectionDirection, nextTile: Tile | null, outgoingDirection: ConnectionDirection | null;
    if (targetDirections.length) {
      direction = targetDirections[_.random(0, targetDirections.length - 1)];
      const targetDirectionOffset = connectionDirections.positionByDirectionMap.get(direction)!;
      targetPosition = {x: tile.x + targetDirectionOffset.x, y: tile.y + targetDirectionOffset.y};
      nextTile = grid.getTileInDirection(tile, direction);
      outgoingDirection = direction;
    } else {
      targetPosition = {x: tile.x + 0.5, y: tile.y + 0.5};
      direction = connectionDirections.oppositeMap[incomingDirection];
      nextTile = null;
      outgoingDirection = null;
    }
    return new TrainCar({
      startPosition,
      targetPosition,
      pointPosition: positions.interpolatePoint(startPosition, targetPosition, 0),
      connectionLength: positions.getPointDistance(startPosition, targetPosition),
      connectionProgress: 0,
      tile,
      direction,
      incomingDirection,
      outgoingDirection,
      nextTile,
      tail: tail,
    });
  }

  constructor(init: TrainCarInit) {
    this.startPosition = init.startPosition;
    this.targetPosition = init.targetPosition;
    this.pointPosition = init.pointPosition;
    this.connectionLength = init.connectionLength;
    this.connectionProgress = init.connectionProgress;
    this.tile = init.tile;
    this.direction = init.direction;
    this.incomingDirection = init.incomingDirection;
    this.outgoingDirection = init.outgoingDirection;
    this.nextTile = init.nextTile;
    this.tail = init.tail;
  }

  copy(updates: Partial<TrainCarInit> = {}): TrainCar {
    return new TrainCar({
      startPosition: this.startPosition,
      targetPosition: this.targetPosition,
      pointPosition: this.pointPosition,
      connectionLength: this.connectionLength,
      connectionProgress: this.connectionProgress,
      tile: this.tile,
      direction: this.direction,
      incomingDirection: this.incomingDirection,
      outgoingDirection: this.outgoingDirection,
      nextTile: this.nextTile,
      tail: this.tail,
      ...updates,
    });
  }

  makeHistoryNode(distanceCovered: number): HistoryNode {
    return {
      distanceCovered,
      tile: this.tile,
      connection: {from: this.incomingDirection, to: this.outgoingDirection},
    };
  }

  animate(grid: Grid, distanceCovered: number, connectionProgressIncrement: number = 0.2): {car: TrainCar, newHistoryNodes: History, distanceCovered: number} {
    const connectionProgressTarget = this.connectionProgress + connectionProgressIncrement;
    const connectionProgress = Math.min(this.connectionLength, connectionProgressTarget);
    const connectionProgressLeftover = connectionProgressTarget - connectionProgress;
    const newProgress = connectionProgress / this.connectionLength;
    const pointPosition = positions.interpolatePoint(this.startPosition, this.targetPosition, newProgress);
    let car = this.copy({
      pointPosition,
      connectionProgress,
      tail: [this.pointPosition, ...this.tail].slice(0, 5),
    });
    let newDistanceCovered = distanceCovered + connectionProgress;
    const newHistoryNodes = [];
    if (newProgress === 1) {
      car = car.getNext(grid);
      newHistoryNodes.push(car.makeHistoryNode(distanceCovered + connectionProgress));
      // TODO: if we didn't manage to make any progress, we should worry
      if (connectionProgressLeftover && connectionProgressLeftover < connectionProgressTarget) {
        let nextHistoryNodes;
        ({car, newHistoryNodes: nextHistoryNodes, distanceCovered: newDistanceCovered} = car.animate(grid, newDistanceCovered, connectionProgressLeftover));
        newHistoryNodes.push(...nextHistoryNodes);
      }
    }
    return {car, newHistoryNodes, distanceCovered: newDistanceCovered};
  }

  getNext(this: TrainCar, grid: Grid): TrainCar {
    const nextDirection = connectionDirections.oppositeMap[this.direction];
    if (!this.nextTile) {
      return TrainCar.startFromTileAndDeadEndDirection(this.tile, nextDirection, grid, this.tail);
    }
    return TrainCar.startFromTileAndDirection(this.nextTile, nextDirection, grid, this.tail);
  }
}

interface TrainInit {
  cars: TrainCar[],
  distanceCovered: number;
  history: History;
}

export class Train implements TrainInit {
  cars: TrainCar[];
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
    const car = TrainCar.startFromTileAndDeadEndDirection(tile, direction, grid, tail);
    return this.startWithCar(car, distanceCovered, history);
  }

  static startWithCar(car: TrainCar, distanceCovered: number, history: History): Train {
    const newHistory = [
      car.makeHistoryNode(distanceCovered),
      ...history,
    ].slice(0, 5);
    return new Train({
      cars: [
        car,
      ],
      distanceCovered,
      history: newHistory,
    });
  }

  constructor(init : TrainInit) {
    this.cars = init.cars;
    this.distanceCovered = init.distanceCovered;
    this.history = init.history;
  }

  animate(grid: Grid, connectionProgressIncrement: number = 0.2): Train {
    const {car, newHistoryNodes, distanceCovered} = this.cars[0].animate(grid, this.distanceCovered, connectionProgressIncrement);
    let history = this.history;
    if (newHistoryNodes.length) {
      history = [...history, ...newHistoryNodes];
    }
    return Train.startWithCar(car, distanceCovered, history);
  }
}
