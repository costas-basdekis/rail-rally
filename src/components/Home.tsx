import styles from "@/components/Home.module.scss";
import {About, RTile} from "@/components";
import {Component} from "react";
import * as rails from "@/rails";

interface HomeState {
  grid: rails.Grid,
}

export class Home extends Component<{}, HomeState>{
  state: HomeState = {
    grid: rails.Grid.fromSize(20, 20),
  };

  render() {
    const {grid} = this.state;
    return (
      <main className={styles.main}>
        <h1>Rail Rally</h1>
        <svg width={400} height={400} style={{backgroundColor: "white"}}>
          {Array.from(grid.tiles()).map(tile => (
            <RTile key={`${tile.x},${tile.y}`} tile={tile} />
          ))}
        </svg>
        <About/>
      </main>
    );
  }
}
