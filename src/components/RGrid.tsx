import {Component} from "react";
import {RTile} from "@/components/RTile";
import * as rails from "@/rails";
// noinspection TypeScriptCheckImport
import Iterator from "core-js-pure/actual/iterator";

interface RGridProps {
  grid: rails.Grid,
  editable?: boolean | undefined,
  mode: "build" | "search",
}

interface RGridState {
  selectedTile: rails.Tile | null,
  connectableTiles: rails.Tile[],
  searchStart: rails.Tile | null,
  searchEnd: rails.Tile | null,
  searchPath: rails.Path | null,
}

export class RGrid extends Component<RGridProps, RGridState> {
  state: RGridState = {
    selectedTile: null,
    connectableTiles: [],
    searchStart: null,
    searchEnd: null,
    searchPath: null,
  };

  componentDidUpdate(prevProps: Readonly<RGridProps>) {
    if (prevProps.mode !== this.props.mode) {
      switch (this.props.mode) {
        case "build":
          this.setState<"searchStart" | "searchEnd" | "searchPath">({searchStart: null, searchEnd: null, searchPath: null});
          break;
        case "search":
          this.setState<"connectableTiles">({connectableTiles: []});
          break;
      }
    }
  }

  render() {
    const {grid, editable, mode} = this.props;
    const {selectedTile, connectableTiles, searchStart, searchEnd} = this.state;
    return [
      ...Iterator.from(grid.tiles()).map(tile => (
        <RTile.Background
          key={`${tile.positionStr}-background`}
          editable={editable}
          tile={tile}
          selected={mode === "build" ? selectedTile === tile : [searchStart, searchEnd].includes(tile)}
          connectable={connectableTiles.includes(tile)}
          onTileClick={this.onTileClick}
        />
      )),
      ...Iterator.from(grid.tiles()).map(tile => (
        <RTile.Connections
          key={`${tile.positionStr}-connections`}
          tile={tile}
        />
      )),
    ];
  }

  onTileClick = (tile: rails.Tile) => {
    switch (this.props.mode) {
      case "build":
        this.onBuildTileClick(tile);
        break;
      case "search":
        this.onSearchTileClick(tile);
        break;
    }
  }
  onBuildTileClick = (tile: rails.Tile) => {
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

  private onSearchTileClick(tile: rails.Tile) {
    this.setState<"searchStart" | "searchEnd" | "searchPath">(({searchStart, searchEnd}) => {
      if (!searchStart || searchEnd) {
        return {searchStart: tile, searchEnd: null, searchPath: null};
      } else {
        const searchPath = rails.PathFinder.findBestPath(this.props.grid, searchStart, tile);
        console.log(searchPath);
        return {searchStart, searchEnd: tile, searchPath: searchPath};
      }
    });
  }
}
