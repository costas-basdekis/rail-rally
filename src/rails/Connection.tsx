import {Position, positions} from "@/rails/Position";
import {ConnectionDirection, connectionDirections} from "@/rails/ConnectionDirection";

interface ArcConfiguration {
  edge: ConnectionDirection;
  corner: ConnectionDirection;
  sweep: boolean;
  arcRadius: number;
}

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
    const d = this.makePathD(1);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    return path;
  }

  makePathD(scale: number): string {
    if (this.arcConfiguration) {
      return this.makeArcPathD(scale);
    } else {
      return this.makeLinePathD(scale);
    }
  }

  makeArcPathD(scale: number): string {
    const {edge, corner, sweep, arcRadius} = this.arcConfiguration;
    const edgePosition = connectionDirections.positionByDirectionMap[edge];
    const cornerPosition = connectionDirections.positionByDirectionMap[corner];
    return [
      `M ${edgePosition.x * scale} ${edgePosition.y * scale}`,
      `A ${arcRadius * scale} ${arcRadius * scale} 0 0 ${sweep ? 1 : 0} ${cornerPosition.x * scale} ${cornerPosition.y * scale}`,
    ].join(" ");
  }

  makeLinePathD(scale: number): string {
    let firstPosition = this.start ? connectionDirections.positionByDirectionMap[this.start] : connectionDirections.centerOffset;
    let secondPosition = this.end ? connectionDirections.positionByDirectionMap[this.end] : connectionDirections.centerOffset;
    // For dead-end, move the center end a bit further from the center
    if (!this.start) {
      firstPosition = positions.add(firstPosition, secondPosition, 0.8, 0.2);
    } else if (!this.end) {
      secondPosition = positions.add(firstPosition, secondPosition, 0.2, 0.8);
    }
    return [
      `M ${firstPosition.x * scale} ${firstPosition.y * scale}`,
      `L ${secondPosition.x * scale} ${secondPosition.y * scale}`,
    ].join(" ");
  }

  interpolate(progress: number): Position {
    const effectiveProgress: number =
      this.reverseInterpolation
        ? (this.length - progress)
        : progress;
    const {x, y} = this.path.getPointAtLength(effectiveProgress);
    return {x, y};
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

  arcConfigurationMap: { [key: ConnectionDirection]: { [key: ConnectionDirection]: ArcConfiguration } } =
    Object.fromEntries(
      connectionDirections.items
        .map(first => [first, Object.fromEntries(
          connectionDirections.items
            .map(second => [second, this.getArcConfiguration(first, second)])
            .filter(([, configuration]) => configuration) as [ConnectionDirection, ArcConfiguration][]
        )] as const)
        .filter(([, configurations]) => Object.entries(configurations).length)
    );

  map: { [key: ConnectionDirection | "null"]: { [key: ConnectionDirection | "null"]: Connection } } = {};

  fillMap() {
    Object.assign(this.map, Object.fromEntries(
      [null, ...connectionDirections.items].map(
        first => [first, Object.fromEntries([null, ...connectionDirections.items].filter(second => first !== second).map(
          second => [second, new Connection(first, second)] as const))] as const)));
  }
}

export const connections = new Connections();
connections.fillMap();
