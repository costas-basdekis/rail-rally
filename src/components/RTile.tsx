import {Component} from "react";
import * as rails from "@/rails";
import classNames from "classnames";
import "./RTile.scss";

interface RTileProps {
  tile: rails.Tile,
  selected: boolean,
  connectable: boolean,
  onTileClick: (tile: rails.Tile) => void,
}

export interface Position {
  x: number;
  y: number;
}

export class RTile extends Component<RTileProps, {}> {
  static positionByDirectionMap: Map<rails.ConnectionDirection, Position> = new Map([
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

  // shouldComponentUpdate(): boolean {
  //   return true;
  // }

  render() {
    const {tile, selected, connectable} = this.props;
    return <g transform={`translate(${tile.x * 20}, ${tile.y * 20})`} onClick={this.onSelectTile}>
      <rect x={0} y={0} width={20} height={20} className={classNames("tile", {selected, connectable})} stroke={"black"} />
      {tile.internalConnections.map(([first, second]) => {
        const firstPosition = RTile.positionByDirectionMap.get(first)!;
        const secondPosition = RTile.positionByDirectionMap.get(second)!;
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
        const position = RTile.positionByDirectionMap.get(direction)!;
        return (
          <line
            key={direction}
            x1={(this.centerPosition.x * 0.8 + position.x * 0.2) * 20} y1={(this.centerPosition.y * 0.8 + position.y * 0.2) * 20}
            x2={position.x * 20} y2={position.y * 20}
            stroke={"black"}
          />
        );
      })}
    </g>;
  }

  onSelectTile = () => {
    this.props.onTileClick(this.props.tile);
  };
}
