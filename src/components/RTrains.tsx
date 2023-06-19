import {Component} from "react";
import * as rails from "@/rails";
import {Interval} from "@/components/Interval";
import {RTrain} from "@/components/RTrain";

interface RTrainsProps {
  grid: rails.Grid,
  trains: {id: number, train: rails.Train | null}[],
  onTrainUpdate: (id: number, train: rails.Train) => void,
}

export class RTrains extends Component<RTrainsProps, {}> {
  render() {
    const {trains} = this.props;

    return <>
      <Interval method={this.recheckTrains} timeout={1000} restartGuard={trains.some(({train}) => train === null)} />
      <Interval method={this.animateTrains} timeout={100} restartGuard={trains.some(({train}) => train !== null)} />
      {trains.filter(({train}) => train).map(({id, train}) => (
        <RTrain key={id} train={train!} />
      ))}
    </>;
  }

  recheckTrains = () => {
    const {grid, trains} = this.props;
    for (const {id, train} of trains) {
      if (train) {
        continue;
      }
      const newTrain = rails.Train.startNew(grid)?.addCars(3, 1);
      if (!newTrain) {
        continue;
      }
      this.props.onTrainUpdate(id, newTrain);
    }
  };

  animateTrains = () => {
    const {grid, trains} = this.props;
    for (const {id, train} of trains) {
      if (!train) {
        continue;
      }
      this.props.onTrainUpdate(id, train!.animate(grid));
    }
  };
}
