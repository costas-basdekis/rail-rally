import styles from "@/components/Home.module.scss";
import {About, RTile} from "@/components";
import {Component} from "react";
import * as rails from "@/rails";

interface HomeState {
  grid: rails.Grid,
  selectedTile: rails.Tile | null,
  connectableTiles: rails.Tile[],
}

export class Home extends Component<object, HomeState>{
  state: HomeState = {
    grid: rails.Grid.fromSize(20, 20),
    selectedTile: null,
    connectableTiles: [],
  };

  render() {
    const {grid, selectedTile, connectableTiles} = this.state;
    return (
      <main className={styles.main}>
        <h1>Rail Rally</h1>
        <svg width={400} height={400} style={{backgroundColor: "white"}}>
          {Array.from(grid.tiles()).map(tile => (
            <RTile
              key={`${tile.x},${tile.y}`}
              tile={tile}
              selected={selectedTile === tile}
              connectable={connectableTiles.includes(tile)}
              onTileClick={this.onTileClick}
            />
          ))}
        </svg>
        <About/>
      </main>
    );
  }

  onTileClick = (tile: rails.Tile) => {
    this.setState<"selectedTile" | "connectableTiles">(({grid, selectedTile, connectableTiles}) => {
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
