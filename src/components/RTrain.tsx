import {Component} from "react";
import * as rails from "@/rails";
import "./RTrain.scss";

interface RTrainProps {
  train: rails.Train,
}

export class RTrain extends Component<RTrainProps, {}> {
  render() {
    const {train} = this.props;

    return <>
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
}
