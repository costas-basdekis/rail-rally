import {Component} from "react";
import * as rails from "@/rails";
import "./RTrain.scss";
import {Interval} from "@/components/Interval";

interface RTrainProps {
  grid: rails.Grid,
  id: number
  train: rails.Train | null,
  onTrainUpdate: (id: number, train: rails.Train) => void,
}

export class RTrain extends Component<RTrainProps, {}> {
  render() {
    const {train} = this.props;
    const intervals = <>
      <Interval method={this.recheckTrain} timeout={1000} restartGuard={!train} />
      <Interval method={this.animateTrain} timeout={100} restartGuard={!!train} />
    </>;
    if (!train) {
      return intervals;
    }

    return <>
      {intervals}
      {train.cars.map((car, index) => (
        <circle key={index} cx={car.pointPosition.x * 20} cy={car.pointPosition.y * 20} r={3} className={"train"} />
      ))}
      {train.cars.length > 1 ? (
        <polyline
          className={"train-line"}
          points={train.cars.map(car => `${car.pointPosition.x * 20},${car.pointPosition.y * 20}`).join(" ")}
        />
      ) : null}
    </>;
  }

  recheckTrain = () => {
    const {grid} = this.props;
    const train = rails.Train.startNew(grid)?.addCars(3, 1);
    if (!train) {
      return;
    }
    this.props.onTrainUpdate(this.props.id, train);
  };

  animateTrain = () => {
    const {grid, train} = this.props;

    this.props.onTrainUpdate(this.props.id, train!.animate(grid));
  };
}
