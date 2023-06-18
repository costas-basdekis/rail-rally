import _ from "underscore";

export type ConnectionDirection = (
  "top" | "top-right" | "right" | "bottom-right" | "bottom" | "bottom-left" | "left" | "top-left"
  );

export interface Position {
  x: number;
  y: number;
}

class Positions {
  getPointDistance(first: Position, second: Position): number {
    const dX = first.x - second.x, dY = first.y - second.y;
    return Math.sqrt(dX * dX + dY * dY);
  }

  interpolatePoint(start: Position, end: Position, progress: number): Position {
    return {
      x: start.x + (end.x - start.x) * progress,
      y: start.y + (end.y - start.y) * progress,
    };
  }

  add(first: Position, second: Position): Position {
    return {
      x: first.x + second.x,
      y: first.y + second.y,
    };
  }
}

export const positions = new Positions();

interface ArcConfiguration {
  edge: ConnectionDirection;
  corner: ConnectionDirection;
  sweep: boolean;
  arcRadius: number;
}

class ConnectionDirections {
  items: ConnectionDirection[] = [
    "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "top-left",
  ] as const;

  offsetMap: {[key: ConnectionDirection]: Position} = {
    top: {x: 0, y: -1},
    "top-right": {x: 1, y: -1},
    right: {x: 1, y: 0},
    "bottom-right": {x: 1, y: 1},
    bottom: {x: 0, y: 1},
    "bottom-left": {x: -1, y: 1},
    left: {x: -1, y: 0},
    "top-left": {x: -1, y: -1},
  };
  centerOffset: Position = {x: 0.5, y: 0.5};

  positionByDirectionMap: {[key: ConnectionDirection]: Position} = {
    top: {x: 0.5, y: 0},
    bottom: {x: 0.5, y: 1},
    left: {x: 0, y: 0.5},
    right: {x: 1, y: 0.5},
    "top-left": {x: 0, y: 0},
    "top-right": {x: 1, y: 0},
    "bottom-right": {x: 1, y: 1},
    "bottom-left": {x: 0, y: 1},
  };

  oppositeMap: { [key: ConnectionDirection]: ConnectionDirection } =
    Object.fromEntries(this.items.map((direction, index) => [direction, (this.items)[(index + 4) % 8]]));

  connectableDirections: {[key: ConnectionDirection]: ConnectionDirection[]} =
    Object.fromEntries(this.items.map((direction, index) => [
      direction,
      [(this.items)[(index + 3) % 8], (this.items)[(index + 4) % 8], (this.items)[(index + 5) % 8]],
    ] as const));

  otherConnectionsByOffset: {[key: ConnectionDirection]: {[key: number]: ConnectionDirection[]}} =
    Object.fromEntries(this.items.map((direction, index) => [
      direction,
      Object.fromEntries(_.range(0, 5).map(offset => [
        offset,
        Array.from(new Set([(this.items)[(8 + index + offset) % 8], (this.items)[(8 + index - offset) % 8]])).sort(),
      ] as const)),
    ] as const));

  areAllDirectionsNeighbours(directions: ConnectionDirection[]): boolean {
    return directions.every(first => directions.some(second => first !== second && this.areTwoDirectionsNeighbours(first, second)));
  }

  areTwoDirectionsNeighbours(first: ConnectionDirection, second: ConnectionDirection): boolean {
    return [
      ...this.otherConnectionsByOffset[first][1],
      ...this.otherConnectionsByOffset[first][2],
    ].includes(second);
  }

  getTilePositionInDirection(position: Position, direction: ConnectionDirection): Position {
    const offset = this.offsetMap[direction];
    return {
      x: position.x + offset.x,
      y: position.y + offset.y,
    };
  }
}

export const connectionDirections = new ConnectionDirections();

export class Connection {
  start: ConnectionDirection | null;
  end: ConnectionDirection | null;
  path: SVGPathElement;
  length: number;
  arcConfiguration: ArcConfiguration | null;
  reverseInterpolation: boolean;
  startPoint: Position;
  endPoint: Position;

  constructor(start: ConnectionDirection | null, end: ConnectionDirection | null) {
    this.start = start;
    this.end = end;
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    this.arcConfiguration = connections.arcConfigurationMap[this.start]?.[this.end] ?? null;
    this.path = this.makeConnectionPath();
    this.length = this.path.getTotalLength();
    this.reverseInterpolation = this.end === this.arcConfiguration?.edge;
    this.startPoint = this.interpolate(0);
    this.endPoint = this.interpolate(this.length);
  }

  makeConnectionPath(): SVGPathElement {
    if (this.arcConfiguration) {
      return this.makeArcPath();
    } else {
      return this.makeLinePath();
    }
  }

  makeArcPath(): SVGPathElement {
    const {edge, corner, sweep, arcRadius} = this.arcConfiguration;
    const edgePosition = connectionDirections.positionByDirectionMap[edge];
    const cornerPosition = connectionDirections.positionByDirectionMap[corner];
    const d = [
      `M ${edgePosition.x} ${edgePosition.y}`,
      `A ${arcRadius} ${arcRadius} 0 0 ${sweep ? 1 : 0} ${cornerPosition.x} ${cornerPosition.y}`,
    ].join(" ");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    return path;
  }

  makeLinePath(): SVGPathElement {
    const firstPosition = this.start ? connectionDirections.positionByDirectionMap[this.start] : connectionDirections.centerOffset;
    const secondPosition = this.end ? connectionDirections.positionByDirectionMap[this.end] : connectionDirections.centerOffset;
    const d = [
      `M ${firstPosition.x} ${firstPosition.y}`,
      `L ${secondPosition.x} ${secondPosition.y}`,
    ].join(" ");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    return path;
  }

  interpolate(progress: number): Position {
    const effectiveProgress: number =
      this.reverseInterpolation
        ? (this.length - progress)
        : progress;
    return this.path.getPointAtLength(effectiveProgress);
  }
}

class Connections {
  getArcConfiguration(first: ConnectionDirection, second: ConnectionDirection): (ArcConfiguration | null) {
    if (!connectionDirections.otherConnectionsByOffset[first][3].includes(second)) {
      return null;
    }
    const [edge, corner] =
      first.includes("-")
        ? [second, first]
        : [first, second];
    return {
      edge,
      corner,
      sweep: (
        connectionDirections.items.indexOf(edge)
        - connectionDirections.items.indexOf(corner) + 8
      ) % 8 < 4,
      arcRadius: this.arcRadius,
    };
  }

  arcRadius: number = 1.5;

  arcConfigurationMap: {[key: ConnectionDirection]: {[key: ConnectionDirection]: ArcConfiguration}} =
    Object.fromEntries(
      connectionDirections.items
        .map(first => [first, Object.fromEntries(
          connectionDirections.items
            .map(second => [second, this.getArcConfiguration(first, second)])
            .filter(([, configuration]) => configuration) as [ConnectionDirection, ArcConfiguration][]
        )] as const)
        .filter(([, configurations]) => Object.entries(configurations).length)
    );

  map: {[key: ConnectionDirection | "null"]: {[key: ConnectionDirection | "null"]: Connection}} = {};

  fillMap() {
    Object.assign(this.map, Object.fromEntries(
      [null, ...connectionDirections.items].map(
        first => [first, Object.fromEntries([null, ...connectionDirections.items].filter(second => first !== second).map(
          second => [second, new Connection(first, second)] as const))] as const)));
  }
}

export const connections = new Connections();
connections.fillMap();
