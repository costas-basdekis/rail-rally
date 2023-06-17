import {Component} from "react";

interface IntervalProps {
  method: () => void,
  timeout: number,
  startOnMount?: boolean | undefined,
  restartGuard?: unknown,
}

export class Interval extends Component<IntervalProps, {}> {
  interval: number | null = null;

  componentDidMount() {
    if ((this.props.startOnMount ?? true) && (this.props.restartGuard === undefined || this.props.restartGuard)) {
      this.startInterval();
    }
  }

  componentDidUpdate(prevProps: Readonly<IntervalProps>) {
    if (this.props.restartGuard !== prevProps.restartGuard && this.props.restartGuard !== undefined) {
      if (this.props.restartGuard) {
        this.startInterval();
      } else {
        this.stopInterval();
      }
    }
  }

  componentWillUnmount() {
    this.stopInterval();
  }

  render() {
    return <></>;
  }

  startInterval(soft: boolean = true) {
    if (soft && this.interval) {
      return;
    }
    this.stopInterval();
    this.interval = window.setInterval(this.method, this.props.timeout);
  }

  stopInterval() {
    if (!this.interval) {
      return;
    }
    window.clearInterval(this.interval);
    this.interval = null;
  }

  method = () => {
    if (!this.interval) {
      return;
    }
    if (!this.props.restartGuard && this.props.restartGuard !== undefined) {
      this.stopInterval();
      return;
    }
    this.props.method();
  };
}
