import {Component} from "react";
import * as rails from "@/rails";
import "./RTrain.scss";

interface RTrainProps {
  grid: rails.Grid,
  id: number
  train: rails.Train | null,
  onTrainUpdate: (id: number, train: rails.Train) => void,
}

export class RTrain extends Component<RTrainProps, {}> {
  recheckTrainInterval: number | null = null;
  animateTrainInterval: number | null = null;

  componentDidMount() {
    this.startRecheckTrain();
  }

  componentWillUnmount() {
    this.stopRecheckTrain();
    this.stopTrainAnimation();
  }

  render() {
    const {train} = this.props;
    if (!train) {
      return null;
    }

    return <>
      <circle cx={train.pointPosition.x * 20} cy={train.pointPosition.y * 20} r={3} className={"train"} />
      {train.tail.map((position, index) => (
        <circle key={index} cx={position.x * 20} cy={position.y * 20} r={2} className={"train"} />
      ))}
    </>;
  }

  startRecheckTrain(soft: boolean = true) {
    if (soft && this.recheckTrainInterval) {
      return;
    }
    this.stopRecheckTrain();
    this.recheckTrainInterval = window.setInterval(this.recheckTrain, 100);
  }

  stopRecheckTrain() {
    if (!this.recheckTrainInterval) {
      return;
    }
    window.clearInterval(this.recheckTrainInterval);
    this.recheckTrainInterval = null;
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
    this.props.onTrainUpdate(this.props.id, train);
    this.startTrainAnimation();
  };

  startTrainAnimation(soft: boolean = true) {
    if (soft && this.animateTrainInterval) {
      return;
    }
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

    this.props.onTrainUpdate(this.props.id, train.animate(grid));
  };
}
