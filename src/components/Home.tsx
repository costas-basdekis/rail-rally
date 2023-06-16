import styles from "@/components/Home.module.scss";
import {About, RGrid, RTile} from "@/components";
import {Component} from "react";
import _ from "underscore";
import * as rails from "@/rails";

class Train {
  startPosition: rails.Position;
  targetPosition: rails.Position;
  pointPosition: rails.Position;
  connectionLength: number;
  connectionProgress: number;
  tile: rails.Tile;
  direction: rails.ConnectionDirection;
  nextTile: rails.Tile | null;

  static startNew(grid: rails.Grid): Train | null {
    const tilesWithDeadEndConnections = Array.from(grid.tiles()).filter(tile => tile.deadEndInternalConnections.length);
    if (!tilesWithDeadEndConnections.length) {
      return null;
    }
    const tile = tilesWithDeadEndConnections[_.random(0, tilesWithDeadEndConnections.length - 1)];
    return this.startFromTile(tile, grid);
  }

  static startFromTile(tile: rails.Tile, grid: rails.Grid): Train {
    const direction = tile.externalConnections[_.random(0, tile.externalConnections.length - 1)];
    return this.startFromTileAndDeadEndDirection(tile, direction, grid);
  }

  static startFromTileAndDeadEndDirection(tile: rails.Tile, outgoingDirection: rails.ConnectionDirection, grid: rails.Grid): Train {
    const direction = outgoingDirection;
    const startPosition = {x: (tile.x + 0.5) * 20, y: (tile.y + 0.5) * 20};
    const directionOffset = RTile.positionByDirectionMap.get(direction)!;
    const targetPosition = {x: (tile.x + directionOffset.x) * 20, y: (tile.y + directionOffset.y) * 20};
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

  static startFromTileDirection(tile: rails.Tile, incomingDirection: rails.ConnectionDirection, grid: rails.Grid): Train {
    const startDirectionOffset = RTile.positionByDirectionMap.get(incomingDirection)!;
    const startPosition = {x: (tile.x + startDirectionOffset.x) * 20, y: (tile.y + startDirectionOffset.y) * 20};
    const targetDirections = tile.getConnectionsFrom(incomingDirection);
    let targetPosition: rails.Position, direction: rails.ConnectionDirection, nextTile: rails.Tile | null;
    if (targetDirections.length) {
      direction = targetDirections[_.random(0, targetDirections.length - 1)];
      const targetDirectionOffset = RTile.positionByDirectionMap.get(direction)!;
      targetPosition = {x: (tile.x + targetDirectionOffset.x) * 20, y: (tile.y + targetDirectionOffset.y) * 20};
      nextTile = grid.getTileInDirection(tile, direction);
    } else {
      targetPosition = {x: (tile.x + 0.5) * 20, y: (tile.y + 0.5) * 20};
      direction = rails.connectionDirections.oppositeMap[incomingDirection];
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

  static getPointDistance(first: rails.Position, second: rails.Position): number {
    const dX = first.x - second.x, dY = first.y - second.y;
    return Math.sqrt(dX * dX + dY * dY);
  }

  static interpolatePoint(start: rails.Position, end: rails.Position, progress: number): rails.Position {
    return {
      x: start.x + (end.x - start.x) * progress,
      y: start.y + (end.y - start.y) * progress,
    };
  }

  constructor(init : {
    startPosition: rails.Position;
    targetPosition: rails.Position;
    pointPosition: rails.Position;
    connectionLength: number;
    connectionProgress: number;
    tile: rails.Tile;
    direction: rails.ConnectionDirection;
    nextTile: rails.Tile | null;
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

  animate(grid: rails.Grid): Train {
    const connectionProgress = Math.min(this.connectionLength, this.connectionProgress + 2);
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
    }
    return train;
  }

  getNext(grid: rails.Grid): Train {
    if (!this.nextTile) {
      return Train.startFromTileAndDeadEndDirection(this.tile, rails.connectionDirections.oppositeMap[this.direction], grid);
    }
    return Train.startFromTileDirection(this.nextTile, rails.connectionDirections.oppositeMap[this.direction], grid);
  }
}

interface HomeState {
  grid: rails.Grid,
  train: Train | null,
}

export class Home extends Component<object, HomeState>{
  state: HomeState = {
    grid: rails.Grid.fromSize(20, 20),
    train: null,
  };

  recheckTrainInterval: number | null = null;
  animateTrainInterval: number | null = null;

  componentDidMount() {
    this.recheckTrainInterval = window.setInterval(this.recheckTrain, 1000);
  }

  componentWillUnmount() {
    if (this.recheckTrainInterval) {
      window.clearInterval(this.recheckTrainInterval);
      this.recheckTrainInterval = null;
    }
  }

  render() {
    const {grid, train} = this.state;
    return (
      <main className={styles.main}>
        <h1>Rail Rally</h1>
        <svg width={400} height={400} style={{backgroundColor: "white"}}>
          <RGrid grid={grid} />
          {train ? (
            <circle cx={train.pointPosition.x} cy={train.pointPosition.y} r={3} fill={"red"} />
          ) : null}
        </svg>
        <About/>
      </main>
    );
  }

  recheckTrain = () => {
    if (!this.recheckTrainInterval) {
      return;
    }
    if (this.state.train) {
      return;
    }
    const {grid} = this.state;
    const train = Train.startNew(grid);
    if (!train) {
      return;
    }
    console.log("train", train);
    this.setState<"train">({train});
    this.startTrainAnimation();
  };

  startTrainAnimation() {
    this.stopTrainAnimation();
    this.animateTrainInterval = window.setInterval(this.animateTrain, 100);
  }

  stopTrainAnimation() {
    if (!this.animateTrainInterval) {
      return;
    }
    window.clearInterval(this.animateTrainInterval);
    this.animateTrainInterval = null;
  }

  animateTrain = () => {
    if (!this.animateTrainInterval) {
      return;
    }
    const {grid, train} = this.state;
    if (!train) {
      this.stopTrainAnimation();
      return;
    }

    this.setState<"train">({train: train.animate(grid)});
  };
}
