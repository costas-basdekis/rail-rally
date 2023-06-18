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

  getArcConfiguration(first: ConnectionDirection, second: ConnectionDirection): (ArcConfiguration | null) {
    if (!this.otherConnectionsByOffset[first][3].includes(second)) {
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
        this.items.indexOf(edge)
        - this.items.indexOf(corner) + 8
      ) % 8 < 4,
      arcRadius: this.arcRadius,
    };
  }

  arcRadius: number = 1.5;

  positionByDirectionMap: Map<ConnectionDirection, Position> = new Map([
    ["top", {x: 0.5, y: 0}],
    ["bottom", {x: 0.5, y: 1}],
    ["left", {x: 0, y: 0.5}],
    ["right", {x: 1, y: 0.5}],
    ["top-left", {x: 0, y: 0}],
    ["top-right", {x: 1, y: 0}],
    ["bottom-right", {x: 1, y: 1}],
    ["bottom-left", {x: 0, y: 1}],
  ]);

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

  arcConfigurationMap: {[key: ConnectionDirection]: {[key: ConnectionDirection]: ArcConfiguration}} =
    Object.fromEntries(
      this.items
        .map(first => [first, Object.fromEntries(
          this.items
            .map(second => [second, this.getArcConfiguration(first, second)])
            .filter(([, configuration]) => configuration) as [ConnectionDirection, ArcConfiguration][]
        )] as const)
        .filter(([, configurations]) => Object.entries(configurations).length)
    );

  getConnectionLength(first: ConnectionDirection | null, second: ConnectionDirection | null): number {
    if (!this.connectionLengthCache[first]?.[second]) {
      this.connectionLengthCache[first] = this.connectionLengthCache[first] ?? {};
      this.connectionLengthCache[first][second] = this.calculateConnectionLength(first, second);
    }
    return this.connectionLengthCache[first][second];
  }
  connectionLengthCache: {[key: ConnectionDirection | null]: {[key: ConnectionDirection | null]: number}} = {};

  calculateConnectionLength(first: ConnectionDirection | null, second: ConnectionDirection | null): number {
    const path: SVGPathElement = this.getConnectionPath(first, second);
    return path.getTotalLength();
  }

  interpolateConnection(first: ConnectionDirection | null, second: ConnectionDirection | null, progress: number): Position {
    const path = this.getConnectionPath(first, second);
    const arcConfiguration = this.arcConfigurationMap[first]?.[second];
    let effectiveProgress: number;
    if (arcConfiguration) {
      if (arcConfiguration.edge === first) {
        effectiveProgress = progress;
      } else {
        effectiveProgress = this.getConnectionLength(first, second) - progress;
      }
    } else {
      effectiveProgress = progress;
    }
    return path.getPointAtLength(effectiveProgress);
  }

  getConnectionPath(first: ConnectionDirection | null, second: ConnectionDirection | null): SVGPathElement {
    if (!this.connectionPathCache[first]?.[second]) {
      this.connectionPathCache[first] = this.connectionPathCache[first] ?? {};
      this.connectionPathCache[first][second] = this.makeConnectionPath(first, second);
    }
    return this.connectionPathCache[first][second];
  }
  connectionPathCache: {[key: ConnectionDirection | null]: {[key: ConnectionDirection | null]: SVGPathElement}} = {};

  makeConnectionPath(first: ConnectionDirection | null, second: ConnectionDirection | null): SVGPathElement {
    const arcConfiguration = this.arcConfigurationMap[first]?.[second];
    if (arcConfiguration) {
      return this.makeArcPath(arcConfiguration);
    } else {
      return this.makeLinePath(first, second);
    }
  }

  makeArcPath(arcConfiguration): SVGPathElement {
    const {edge, corner, sweep, arcRadius} = arcConfiguration;
    const edgePosition = this.positionByDirectionMap.get(edge)!
    const cornerPosition = this.positionByDirectionMap.get(corner)!
    const d = [
      `M ${edgePosition.x} ${edgePosition.y}`,
      `A ${arcRadius} ${arcRadius} 0 0 ${sweep ? 1 : 0} ${cornerPosition.x} ${cornerPosition.y}`,
    ].join(" ");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    return path;
  }

  makeLinePath(first: ConnectionDirection | null, second: ConnectionDirection | null): SVGPathElement {
    const firstPosition = first ? this.positionByDirectionMap.get(first)! : this.centerOffset;
    const secondPosition = second ? this.positionByDirectionMap.get(second)! : this.centerOffset;
    const d = [
      `M ${firstPosition.x} ${firstPosition.y}`,
      `L ${secondPosition.x} ${secondPosition.y}`,
    ].join(" ");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    return path;
  }

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
