import {Component} from "react";
import * as rails from "@/rails";
import classNames from "classnames";
import "./RTile.scss";

class RTileBackground extends Component<RTileProps, {}> {
  render() {
    const {tile, selected, connectable, editable} = this.props;
    return (
      <rect
        x={0} y={0}
        width={20} height={20}
        className={classNames("tile", {selected, connectable, editable: editable ?? true})}
        transform={`translate(${tile.x * 20}, ${tile.y * 20})`}
        onClick={(editable ?? true) ? this.onSelectTile : undefined}
      />
    );
  }

  onSelectTile = () => {
    this.props.onTileClick(this.props.tile);
  };
}

class RTileConnections extends Component<{tile: rails.Tile}, {}> {
  render() {
    const {tile} = this.props;
    return (
      <g transform={`translate(${tile.x * 20}, ${tile.y * 20})`}>
        {tile.internalConnections.map(([first, second]) => {
          const connection = rails.connections.map[first][second];
          if (!connection.arcConfiguration) {
            const firstPosition = rails.connectionDirections.positionByDirectionMap[first];
            const secondPosition = rails.connectionDirections.positionByDirectionMap[second];
            return (
              <line
                key={`${first}:${second}`}
                x1={firstPosition.x * 20} y1={firstPosition.y * 20}
                x2={secondPosition.x * 20} y2={secondPosition.y * 20}
                stroke={"black"}
              />
            );
          }
          const {edge, corner, sweep, arcRadius} = connection.arcConfiguration;
          const edgePosition = rails.connectionDirections.positionByDirectionMap[edge]
          const cornerPosition = rails.connectionDirections.positionByDirectionMap[corner]
          return (
            <path
              key={`${first}:${second}`}
              d={[
                `M ${edgePosition.x * 20} ${edgePosition.y * 20}`,
                `A ${20 * arcRadius} ${20 * arcRadius} 0 0 ${sweep ? 1 : 0} ${cornerPosition.x * 20} ${cornerPosition.y * 20}`,
              ].join(" ")}
              stroke={"black"}
              fill={"none"}
            />
          );
        })}
        {tile.deadEndInternalConnections.map(direction => {
          const position = rails.connectionDirections.positionByDirectionMap[direction];
          return (
            <line
              key={direction}
              x1={(rails.connectionDirections.centerOffset.x * 0.8 + position.x * 0.2) * 20} y1={(rails.connectionDirections.centerOffset.y * 0.8 + position.y * 0.2) * 20}
              x2={position.x * 20} y2={position.y * 20}
              stroke={"black"}
            />
          );
        })}
      </g>
    );
  }
}

interface RTileProps {
  editable?: boolean | undefined,
  tile: rails.Tile,
  selected: boolean,
  connectable: boolean,
  onTileClick: (tile: rails.Tile) => void,
}

export class RTile extends Component<RTileProps, {}> {
  static Background: typeof RTileBackground = RTileBackground;
  static Connections: typeof RTileConnections = RTileConnections;

  render() {
    const {tile} = this.props;
    return <>
      <RTileBackground {...this.props} />
      <RTileConnections tile={tile} />
    </>;
  }
}
