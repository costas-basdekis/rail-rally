import {Component} from "react";
import * as rails from "@/rails";

interface RTileProps {
  tile: rails.Tile,
}

export interface Position {
  x: number;
  y: number;
}

export class RTile extends Component<RTileProps, {}> {
  positionByDirectionMap: Map<rails.ConnectionDirection, Position> = new Map([
    ["top", {x: 0.5, y: 0}],
    ["bottom", {x: 0.5, y: 1}],
    ["left", {x: 0, y: 0.5}],
    ["right", {x: 1, y: 0.5}],
    ["top-left", {x: 0, y: 0}],
    ["top-right", {x: 1, y: 0}],
    ["bottom-right", {x: 1, y: 1}],
    ["bottom-left", {x: 0, y: 1}],
  ]);
  centerPosition: Position = {x: 0.5, y: 0.5};

  render() {
    const {tile} = this.props;
    return <g>
      <rect x={0} y={0} width={20} height={20} fill={"none"} stroke={"black"} />
      {tile.internalConnections.map(([first, second]) => {
        const firstPosition = this.positionByDirectionMap.get(first)!;
        const secondPosition = this.positionByDirectionMap.get(second)!;
        return (
          <line
            key={`${first}:${second}`}
            x1={firstPosition.x * 20} y1={firstPosition.y * 20}
            x2={secondPosition.x * 20} y2={secondPosition.y * 20}
            stroke={"black"}
          />
        );
      })}
      {tile.deadEndInternalConnections.map(direction => {
        const position = this.positionByDirectionMap.get(direction)!;
        return (
          <line
            key={direction}
            x1={this.centerPosition.x * 20} y1={this.centerPosition.y * 20}
            x2={position.x * 20} y2={position.y * 20}
            stroke={"black"}
          />
        );
      })}
    </g>;
  }
}
