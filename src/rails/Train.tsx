import _ from "underscore";
import {ConnectionDirection, connectionDirections, Position, positions} from "./ConnectionDirection";
import {Tile} from "./Tile";
import {Grid} from "./Grid";
// noinspection TypeScriptCheckImport
import Iterator from "core-js-pure/actual/iterator";

interface HistoryNode {
  tile: Tile;
  tileIndex: number;
  connection: {from: ConnectionDirection | null, to: ConnectionDirection | null};
}

type History = HistoryNode[];

interface TrainCarInit {
  startPosition: Position;
  targetPosition: Position;
  pointPosition: Position;
  connectionLength: number;
  connectionProgress: number;
  distanceCovered: number;
  tile: Tile;
  tileIndex: number;
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
  distanceCovered: number;
  tile: Tile;
  tileIndex: number;
  direction: ConnectionDirection;
  incomingDirection: ConnectionDirection | null;
  outgoingDirection: ConnectionDirection | null;
  nextTile: Tile | null;
  tail: Position[];

  static startFromTileAndDirection(tile: Tile, incomingDirection: ConnectionDirection, grid: Grid, distanceCovered: number, tileIndex: number, tail: Position[]): TrainCar {
    const targetDirections = tile.getConnectionsFrom(incomingDirection);
    const outgoingDirection =
      targetDirections.length
        ? targetDirections[_.random(0, targetDirections.length - 1)]
        : null;
    return this.startFromTileAndConnection(tile, incomingDirection, outgoingDirection, grid, distanceCovered, tileIndex, tail);
  }

  static startFromTileAndConnection(tile: Tile, incomingDirection: ConnectionDirection | null, outgoingDirection: ConnectionDirection | null, grid: Grid, distanceCovered: number, tileIndex: number, tail: Position[]): TrainCar {
    const startDirectionOffset =
      incomingDirection
        ? connectionDirections.positionByDirectionMap.get(incomingDirection)!
        : connectionDirections.centerOffset;
    const startPosition = {x: tile.x + startDirectionOffset.x, y: tile.y + startDirectionOffset.y};
    const targetDirectionOffset =
      outgoingDirection
        ? connectionDirections.positionByDirectionMap.get(outgoingDirection)!
        : connectionDirections.centerOffset;
    const targetPosition = {x: tile.x + targetDirectionOffset.x, y: tile.y + targetDirectionOffset.y};
    const nextTile =
      outgoingDirection
        ? grid.getTileInDirection(tile, outgoingDirection)
        : null;
    return new TrainCar({
      startPosition,
      targetPosition,
      pointPosition: positions.interpolatePoint(startPosition, targetPosition, 0),
      connectionLength: positions.getPointDistance(startPosition, targetPosition),
      connectionProgress: 0,
      distanceCovered,
      tile,
      tileIndex,
      direction: outgoingDirection ?? connectionDirections.oppositeMap[incomingDirection],
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
    this.distanceCovered = init.distanceCovered;
    this.tile = init.tile;
    this.tileIndex = init.tileIndex;
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
      distanceCovered: this.distanceCovered,
      tile: this.tile,
      tileIndex: this.tileIndex,
      direction: this.direction,
      incomingDirection: this.incomingDirection,
      outgoingDirection: this.outgoingDirection,
      nextTile: this.nextTile,
      tail: this.tail,
      ...updates,
    });
  }

  makeHistoryNode(): HistoryNode {
    return {
      tile: this.tile,
      tileIndex: this.tileIndex,
      connection: {from: this.incomingDirection, to: this.outgoingDirection},
    };
  }

  animate(grid: Grid, connectionProgressIncrement: number, history: History | null): {car: TrainCar, newHistoryNodes: History} {
    const connectionProgressTarget = this.connectionProgress + connectionProgressIncrement;
    const connectionProgress = Math.min(this.connectionLength, connectionProgressTarget);
    const connectionProgressLeftover = connectionProgressTarget - connectionProgress;
    if (connectionProgress < 0) {
      return {
        car: this.copy({
          connectionProgress,
          distanceCovered: this.distanceCovered + connectionProgress,
        }),
        newHistoryNodes: [],
      };
    }
    const newProgress = connectionProgress / this.connectionLength;
    const pointPosition = positions.interpolatePoint(this.startPosition, this.targetPosition, newProgress);
    let car = this.copy({
      pointPosition,
      connectionProgress,
      distanceCovered: this.distanceCovered + connectionProgressIncrement - connectionProgressLeftover,
      tail: [this.pointPosition, ...this.tail].slice(0, 5),
    });
    const newHistoryNodes = [];
    if (newProgress === 1) {
      if (history) {
        car = car.getNext(grid, history);
      } else {
        car = car.createNext(grid);
        newHistoryNodes.unshift(car.makeHistoryNode());
      }
      // TODO: if we didn't manage to make any progress, we should worry
      if (connectionProgressLeftover && connectionProgressLeftover < connectionProgressTarget) {
        let nextHistoryNodes;
        ({car, newHistoryNodes: nextHistoryNodes} = car.animate(grid, connectionProgressLeftover, history));
        newHistoryNodes.unshift(...nextHistoryNodes);
      }
    }
    return {car, newHistoryNodes};
  }

  createNext(grid: Grid): TrainCar {
    const nextDirection = connectionDirections.oppositeMap[this.direction];
    if (!this.nextTile) {
      return TrainCar.startFromTileAndConnection(this.tile, null, nextDirection, grid, this.distanceCovered, this.tileIndex + 1, this.tail);
    }
    return TrainCar.startFromTileAndDirection(this.nextTile, nextDirection, grid, this.distanceCovered, this.tileIndex + 1, this.tail);
  }

  getNext(grid: Grid, history: History): TrainCar {
    const node = history.findLast(node => node.tileIndex === this.tileIndex + 1);
    if (!node) {
      throw new Error(`Could not find next node: ${this.tileIndex + 1} in ${history.map(node => node.tileIndex).join(",")}`);
    }
    return TrainCar.startFromTileAndConnection(node.tile, node.connection.from, node.connection.to, grid, this.distanceCovered, this.tileIndex + 1, this.tail);
  }
}

interface TrainInit {
  cars: TrainCar[],
  history: History;
}

export class Train implements TrainInit {
  cars: TrainCar[];
  history: History;

  static startNew(grid: Grid): Train | null {
    return this.startNewFromDeadEnd(grid) ?? this.startNewFromConnection(grid);
  }

  static startNewFromDeadEnd(grid: Grid): Train | null {
    const tilesWithDeadEndConnections = Iterator.from(grid.tiles())
      .filter(tile => tile.deadEndInternalConnections.length)
      .toArray();
    if (!tilesWithDeadEndConnections.length) {
      return null;
    }
    const tile = tilesWithDeadEndConnections[_.random(0, tilesWithDeadEndConnections.length - 1)];
    return this.startFromTile(tile, grid);
  }

  static startNewFromConnection(grid: Grid): Train | null {
    const tilesWithConnections = Iterator.from(grid.tiles())
      .filter(tile => tile.externalConnections.length)
      .toArray();
    if (!tilesWithConnections.length) {
      return null;
    }
    const tile = tilesWithConnections[_.random(0, tilesWithConnections.length - 1)];
    return this.startFromTile(tile, grid);
  }

  static startFromTile(tile: Tile, grid: Grid): Train {
    const direction = tile.externalConnections[_.random(0, tile.externalConnections.length - 1)];
    const car = TrainCar.startFromTileAndConnection(tile, null, direction, grid, 0, 0, []);
    return this.startWithCar(car, []);
  }

  static startWithCar(car: TrainCar, history: History): Train {
    return new Train({
      cars: [
        car,
      ],
      history,
    });
  }

  constructor(init : TrainInit) {
    this.cars = init.cars;
    this.history = init.history;
  }

  animate(grid: Grid, connectionProgressIncrement: number = 0.2): Train {
    const {car, newHistoryNodes} = this.cars[0].animate(grid, connectionProgressIncrement, null);
    let history = this.history;
    if (newHistoryNodes.length) {
      history = [...newHistoryNodes, ...history];
    }
    return Train.startWithCar(car, history);
  }
}
