import styles from "@/components/Home.module.scss";
import {About, RGrid, RSerialisedGrids, RTrains} from "@/components";
import {Component, SyntheticEvent} from "react";
import * as rails from "@/rails";
import _ from "underscore";

interface HomeState {
  grid: rails.Grid,
  trains: {id: number, train: rails.Train | null}[],
  mode: "build" | "search",
}

export class Home extends Component<object, HomeState>{
  state: HomeState = {
    grid: rails.Grid.fromSize(20, 20),
    trains: _.range(4).map(index => ({id: index + 1, train: null})),
    mode: "build",
  };

  render() {
    const {grid, trains, mode} = this.state;
    return (
      <main className={styles.main}>
        <h1>Rail Rally</h1>
        <RSerialisedGrids grid={grid} onGridUpdate={this.onGridUpdate} />
        <button onClick={this.onNewGridClick}>New</button>
        <div>
          <label><input type={"radio"} value={"build"} checked={mode === "build"} onChange={this.onModeChange}/>Build</label>
          <label><input type={"radio"} value={"search"} checked={mode === "search"} onChange={this.onModeChange}/>Search</label>
        </div>
        <div>
          <label>Trains: {trains.length}</label>
          {" "}
          <button onClick={this.onRemoveTrainClick} disabled={!trains.length}>-</button>
          {" "}
          <button onClick={this.onAddTrainClick}>+</button>
        </div>
        <svg width={400} height={400} style={{backgroundColor: "white"}}>
          <RGrid grid={grid} mode={mode} />
          <RTrains grid={grid} trains={trains} onTrainUpdate={this.onTrainUpdate} />
        </svg>
        <About/>
      </main>
    );
  }

  onTrainUpdate = (id: number, train: rails.Train | null) => {
    this.setState<"trains">(({trains}) => ({
      trains: trains.map(entry => entry.id === id ? {id, train} : entry),
    }));
  };

  onGridUpdate = (grid: rails.Grid) => {
    this.setState<"grid">({grid});
    this.clearTrains();
  };

  onNewGridClick = () => {
    this.setState<"grid">({
      grid: rails.Grid.fromSize(20, 20),
    });
    this.clearTrains();
  };

  onAddTrainClick = () => {
    this.setState<"trains">(({trains}) => {
      const newMinId = Math.max(0, ...trains.map(({id}) => id)) + 1;
      return {
        trains: [...trains, {id: newMinId, train: null}],
      };
    });
  };

  onRemoveTrainClick = () => {
    this.setState<"trains">(({trains}) => {
      return {
        trains: trains.slice(1),
      };
    });
  };

  clearTrains() {
    this.setState<"trains">(({trains}) => {
      const newMinId = Math.max(0, ...trains.map(({id}) => id)) + 1;
      return {
        trains: _.range(trains.length).map(index => ({id: newMinId + index, train: null})),
      };
    });
  }

  onModeChange = ({target: {value}}: SyntheticEvent<HTMLInputElement, Event>) => {
    this.setState<"mode">({mode: value});
  };
}
