import {Component} from "react";
import * as rails from "@/rails";
import classNames from "classnames";
import "./RTile.scss";

interface RTileProps {
  editable?: boolean | undefined,
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
  centerPosition: Position = {x: 0.5, y: 0.5};

  // shouldComponentUpdate(): boolean {
  //   return true;
  // }

  render() {
    const {tile, selected, connectable, editable} = this.props;
    return <g transform={`translate(${tile.x * 20}, ${tile.y * 20})`} onClick={(editable ?? true) ? this.onSelectTile : undefined}>
      <rect x={0} y={0} width={20} height={20} className={classNames("tile", {selected, connectable, editable: editable ?? true})} />
      {tile.internalConnections.map(([first, second]) => {
        const firstPosition = rails.connectionDirections.positionByDirectionMap.get(first)!;
        const secondPosition = rails.connectionDirections.positionByDirectionMap.get(second)!;
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
        const position = rails.connectionDirections.positionByDirectionMap.get(direction)!;
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
