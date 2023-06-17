import styles from "@/components/Home.module.scss";
import {About, RGrid, RSerialisedGrids, RTrain} from "@/components";
import {Component} from "react";
import * as rails from "@/rails";

interface HomeState {
  grid: rails.Grid,
  train: rails.Train | null,
}

export class Home extends Component<object, HomeState>{
  state: HomeState = {
    grid: rails.Grid.fromSize(20, 20),
    train: null,
  };

  render() {
    const {grid, train} = this.state;
    return (
      <main className={styles.main}>
        <h1>Rail Rally</h1>
        <RSerialisedGrids grid={grid} onGridUpdate={this.onGridUpdate} />
        <button onClick={this.onNewGridClick}>New</button>
        <svg width={400} height={400} style={{backgroundColor: "white"}}>
          <RGrid grid={grid} />
          <RTrain grid={grid} train={train} onTrainUpdate={this.onTrainUpdate} />
        </svg>
        <About/>
      </main>
    );
  }

  onTrainUpdate = (train: rails.Train | null) => {
    this.setState<"train">({train});
  };

  onGridUpdate = (grid: rails.Grid) => {
    this.setState<"grid">({grid});
  };

  onNewGridClick = () => {
    this.setState<"grid">({grid: rails.Grid.fromSize(20, 20), train: null});
  };
}
