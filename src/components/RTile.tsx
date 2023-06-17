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
  centerPosition: rails.Position = {x: 0.5, y: 0.5};

  render() {
    const {tile} = this.props;
    return (
      <g transform={`translate(${tile.x * 20}, ${tile.y * 20})`}>
        {tile.internalConnections.map(([first, second]) => {
          const [edge, corner] = first.includes("-")
            ? [second, first] as const
            : [first, second] as const;
          const arcConfiguration = rails.connectionDirections.arcMap[edge]?.[corner];
          if (!arcConfiguration) {
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
          }
          const {angle, sweep, offsetX, offsetY} = arcConfiguration;
          const edgePosition = rails.connectionDirections.positionByDirectionMap.get(edge)!
          const endX = (edgePosition.x + offsetX) * 20 + 20 * 1.5 * Math.cos(angle);
          const endY = (edgePosition.y + offsetY) * 20 + 20 * 1.5 * Math.sin(angle);
          return (
            <path
              key={`${first}:${second}`}
              d={[
                `M ${edgePosition.x * 20} ${edgePosition.y * 20}`,
                `A ${20 * 1.5} ${20 * 1.5} 0 0 ${sweep ? 1 : 0} ${endX} ${endY}`,
              ].join(" ")}
              stroke={"black"}
              fill={"none"}
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
