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
        {tile.internalConnections.map(([first, second]) => (
          <path
            key={`${first}:${second}`}
            d={rails.connections.map[first][second].makePathD(20)}
            stroke={"black"}
            fill={"none"}
          />
        ))}
        {tile.deadEndInternalConnections.map(direction => (
          <path
            key={direction}
            d={rails.connections.map[null][direction].makePathD(20)}
            stroke={"black"}
            fill={"none"}
          />
        ))}
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
