import {Component} from "react";
import {RTile} from "@/components/RTile";
import * as rails from "@/rails";

interface RGridProps {
  grid: rails.Grid,
  editable?: boolean | undefined,
}

interface RGridState {
  selectedTile: rails.Tile | null,
  connectableTiles: rails.Tile[],
}

export class RGrid extends Component<RGridProps, RGridState> {
  state: RGridState = {
    selectedTile: null,
    connectableTiles: [],
  };

  render() {
    const {grid, editable} = this.props;
    const {selectedTile, connectableTiles} = this.state;
    return [
      ...Array.from(grid.tiles()).map(tile => (
        <RTile.Background
          key={`${tile.positionStr}-background`}
          editable={editable}
          tile={tile}
          selected={selectedTile === tile}
          connectable={connectableTiles.includes(tile)}
          onTileClick={this.onTileClick}
        />
      )),
      ...Array.from(grid.tiles()).map(tile => (
        <RTile.Connections
          key={`${tile.positionStr}-connections`}
          tile={tile}
        />
      )),
    ];
  }

  onTileClick = (tile: rails.Tile) => {
    this.setState<"selectedTile" | "connectableTiles">(({selectedTile, connectableTiles}) => {
      const {grid} = this.props;
      if (tile === selectedTile) {
        return {
          selectedTile: null,
          connectableTiles: [],
        };
      }
      if (!selectedTile) {
        return {
          selectedTile: tile,
          connectableTiles: tile.getConnectableTiles(grid),
        };
      }
      if (connectableTiles.includes(tile)) {
        grid.connect([selectedTile, tile]);
        return {
          selectedTile: tile,
          connectableTiles: tile.getConnectableTiles(grid),
        };
      }
      return {
        selectedTile: tile,
        connectableTiles: tile.getConnectableTiles(grid),
      };
    });
  };
}
