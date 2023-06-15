import styles from "@/components/Home.module.scss";
import {About, RGrid} from "@/components";
import {Component} from "react";
import * as rails from "@/rails";

interface HomeState {
  grid: rails.Grid,
}

export class Home extends Component<object, HomeState>{
  state: HomeState = {
    grid: rails.Grid.fromSize(20, 20),
  };

  render() {
    const {grid} = this.state;
    return (
      <main className={styles.main}>
        <h1>Rail Rally</h1>
        <svg width={400} height={400} style={{backgroundColor: "white"}}>
          <RGrid grid={grid} />
        </svg>
        <About/>
      </main>
    );
  }
}
