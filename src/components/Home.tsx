import styles from "@/components/Home.module.scss";
import {About, RTile} from "@/components";
import {Component} from "react";
import * as rails from "@/rails";

interface HomeState {
  tile: rails.Tile;
}

export class Home extends Component<{}, HomeState>{
  state: HomeState = {
    tile: rails.Tile.empty(),
  };

  render() {
    const {tile} = this.state;
    return (
      <main className={styles.main}>
        <h1>Rail Rally</h1>
        <svg width={400} height={400} style={{backgroundColor: "white"}}>
          <RTile tile={tile}/>
        </svg>
        <About/>
      </main>
    );
  }
}
