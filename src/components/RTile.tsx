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
        onMouseEnter={this.props.onMouseEnter ? this.onMouseEnter : undefined}
        onMouseOut={this.props.onMouseOut ? this.onMouseOut : undefined}
      />
    );
  }

  onSelectTile = () => {
    this.props.onTileClick(this.props.tile);
  };

  onMouseEnter = () => {
    this.props?.onMouseEnter?.(this.props.tile);
  };

  onMouseOut = () => {
    this.props?.onMouseOut?.(this.props.tile);
  };
}

interface RTileConnectionsProps {
  tile: rails.Tile;
  highlightedConnections?: rails.PathNode[] | undefined;
}

class RTileConnections extends Component<RTileConnectionsProps, {}> {
  render() {
    const {tile} = this.props;
    return (
      <g transform={`translate(${tile.x * 20}, ${tile.y * 20})`}>
        {tile.internalConnections.map(([first, second]) => {
          const highlighted = this.isConnectionHighlighted(first, second);
          return (
            <path
              key={`${first}:${second}`}
              d={rails.connections.map[first][second].makePathD(20)}
              stroke={highlighted ? "green" : "black"}
              strokeWidth={highlighted ? 5 : 1}
              fill={"none"}
            />
          );
        })}
        {tile.deadEndInternalConnections.map(direction => {
          const highlighted = this.isConnectionHighlighted(null, direction);
          return (
            <path
              key={direction}
              d={rails.connections.map[null][direction].makePathD(20)}
              stroke={highlighted ? "green" : "black"}
              strokeWidth={highlighted ? 5 : 1}
              fill={"none"}
            />
          );
        })}
      </g>
    );
  }

  isConnectionHighlighted(first: rails.ConnectionDirection | null, second: rails.ConnectionDirection | null) {
    const directions = [first, second];
    return this.props.highlightedConnections?.some(({incomingDirection, outgoingDirection}) => {
      return directions.includes(incomingDirection) && directions.includes(outgoingDirection);
    });
  }
}

interface RTileProps {
  editable?: boolean | undefined,
  tile: rails.Tile,
  selected: boolean,
  connectable: boolean,
  onTileClick: (tile: rails.Tile) => void,
  onMouseEnter?: ((tile: rails.Tile) => void) | undefined,
  onMouseOut?: ((tile: rails.Tile) => void) | undefined,
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
