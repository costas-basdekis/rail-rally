import {Component} from "react";
import * as rails from "@/rails";
import {Interval} from "@/components/Interval";
import {RTrain} from "@/components/RTrain";

type IdentifiedTrains = { id: number, train: rails.Train | null }[];

interface RTrainsProps {
  grid: rails.Grid,
  trains: IdentifiedTrains,
  onTrainUpdate: (id: number, train: rails.Train | null) => void,
}

export class RTrains extends Component<RTrainsProps, {}> {
  render() {
    const {trains} = this.props;

    return <>
      <Interval method={this.recheckTrains} timeout={1000} restartGuard={trains.some(({train}) => train === null)} />
      <Interval method={this.progressTrains} timeout={100} restartGuard={trains.some(({train}) => train !== null)} />
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

  progressTrains = () => {
    let trainsToUpdate: IdentifiedTrains = this.props.trains;
    trainsToUpdate = this.animateTrains(trainsToUpdate);
    trainsToUpdate = this.removeCollidedTrains(trainsToUpdate);
    this.updateTrains(trainsToUpdate);
  };

  animateTrains(trains: IdentifiedTrains): IdentifiedTrains {
    const {grid} = this.props;
    return trains
      .filter(({train}) => train)
      .map(({id, train}) => ({
        id,
        train: train!.animate(grid),
      }));
  }

  removeCollidedTrains(trains: IdentifiedTrains): IdentifiedTrains {
    const collidedTrains: rails.Train[] = rails.trains.getCollidedTrains(trains.map(({train}) => train!));
    if (!collidedTrains.length) {
      return trains;
    }
    return trains.map(({id, train}) => ({
      id,
      train: (!train || collidedTrains.includes(train)) ? null : train,
    }));
  }

  updateTrains(trains: IdentifiedTrains) {
    for (const {id, train} of trains) {
      this.props.onTrainUpdate(id, train);
    }
  }
}
