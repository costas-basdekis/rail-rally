import {Component} from "react";
import * as rails from "@/rails";
import "./RTrain.scss";

interface RTrainProps {
  grid: rails.Grid,
  train: rails.Train | null,
  onTrainUpdate: (train: rails.Train | null) => void,
}

export class RTrain extends Component<RTrainProps, {}> {
  recheckTrainInterval: number | null = null;
  animateTrainInterval: number | null = null;

  componentDidMount() {
    this.recheckTrainInterval = window.setInterval(this.recheckTrain, 1000);
  }

  componentWillUnmount() {
    if (this.recheckTrainInterval) {
      window.clearInterval(this.recheckTrainInterval);
      this.recheckTrainInterval = null;
    }
  }

  render() {
    const {train} = this.props;
    if (!train) {
      return null;
    }

    return (
      <circle cx={train.pointPosition.x * 20} cy={train.pointPosition.y * 20} r={3} className={"train"} />
    );
  }

  recheckTrain = () => {
    if (!this.recheckTrainInterval) {
      return;
    }
    if (this.props.train) {
      return;
    }
    const {grid} = this.props;
    const train = rails.Train.startNew(grid);
    if (!train) {
      return;
    }
    this.props.onTrainUpdate(train);
    this.startTrainAnimation();
  };

  startTrainAnimation() {
    this.stopTrainAnimation();
    this.animateTrainInterval = window.setInterval(this.animateTrain, 100);
  }

  stopTrainAnimation() {
    if (!this.animateTrainInterval) {
      return;
    }
    window.clearInterval(this.animateTrainInterval);
    this.animateTrainInterval = null;
  }

  animateTrain = () => {
    if (!this.animateTrainInterval) {
      return;
    }
    const {grid, train} = this.props;
    if (!train) {
      this.stopTrainAnimation();
      return;
    }

    this.props.onTrainUpdate(train.animate(grid));
  };
}
