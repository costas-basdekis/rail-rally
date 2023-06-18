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
    const car = train.cars[0];

    return <>
      {intervals}
      <circle cx={car.pointPosition.x * 20} cy={car.pointPosition.y * 20} r={3} className={"train"} />
      {car.tail.map((position, index) => (
        <circle key={index} cx={position.x * 20} cy={position.y * 20} r={2} className={"train"} />
      ))}
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
