import {Component, createRef} from "react";
import * as rails from "@/rails";

interface RSerialisedGridsProps {
  grid: rails.Grid,
  onGridUpdate: (grid: rails.Grid) => void,
}

type SerialisedGrids = { id: number, name: string, serialised: rails.SerialisedGrid }[];

interface RSerialisedGridsState {
  serialisedGrids: SerialisedGrids,
}

export class RSerialisedGrids extends Component<RSerialisedGridsProps, RSerialisedGridsState> {
  state: RSerialisedGridsState = {
    serialisedGrids: this.loadSerialisedGrids(),
  };

  serialisedGridsSelectRef = createRef<HTMLSelectElement>();

  render() {
    const {serialisedGrids} = this.state;
    return (
      <div>
        Available:
        <select ref={this.serialisedGridsSelectRef}>
          {serialisedGrids.map(({id, name}) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
        <button onClick={this.onLoadClick} disabled={!serialisedGrids.length}>Load</button>
        <button onClick={this.onSaveNewClick}>Save new</button>
        <button onClick={this.onReplaceClick} disabled={!serialisedGrids.length}>Replace</button>
        <button onClick={this.onDeleteClick} disabled={!serialisedGrids.length}>Delete</button>
      </div>
    );
  }

  onLoadClick = () => {
    const idStr = this.serialisedGridsSelectRef.current?.value;
    if (!idStr) {
      return;
    }
    const id = parseInt(idStr, 10);
    const serialised = this.state.serialisedGrids.find(entry => entry.id === id)?.serialised;
    if (!serialised) {
      return;
    }
    this.props.onGridUpdate(rails.Grid.deserialise(serialised));
  };

  onSaveNewClick = () => {
    const name = prompt("Enter the grid's name");
    if (!name) {
      return;
    }
    this.setState<"serialisedGrids">(({serialisedGrids}) => ({
      serialisedGrids: [
        ...serialisedGrids, {
          id: Math.max(0, ...serialisedGrids.map(({id}) => id)) + 1,
          name,
          serialised: this.props.grid.serialise(),
        },
      ],
    }), this.persistSerialisedGrids);
  };

  onReplaceClick = () => {
    const idStr = this.serialisedGridsSelectRef.current?.value;
    if (!idStr) {
      return;
    }
    const id = parseInt(idStr, 10);
    const serialised = this.state.serialisedGrids.find(entry => entry.id === id)?.serialised;
    if (!serialised) {
      return;
    }
    this.setState<"serialisedGrids">(({serialisedGrids}) => ({
      serialisedGrids: serialisedGrids.map(entry => (
        entry.id === id
          ? {...entry, serialised: this.props.grid.serialise()}
          : entry
      )),
    }), this.persistSerialisedGrids);
  };

  onDeleteClick = () => {
    const idStr = this.serialisedGridsSelectRef.current?.value;
    if (!idStr) {
      return;
    }
    const id = parseInt(idStr, 10);
    const serialised = this.state.serialisedGrids.find(entry => entry.id === id)?.serialised;
    if (!serialised) {
      return;
    }
    this.setState<"serialisedGrids">(({serialisedGrids}) => ({
      serialisedGrids: serialisedGrids.filter(entry => entry.id !== id),
    }), this.persistSerialisedGrids);
  };

  loadSerialisedGrids(): {id: number, name: string, serialised: rails.SerialisedGrid}[] {
    if (!window.localStorage.serialisedGrids) {
      return [];
    }
    return JSON.parse(window.localStorage.serialisedGrids);
  }

  persistSerialisedGrids = () => {
    try {
      window.localStorage.serialisedGrids = JSON.stringify(this.state.serialisedGrids);
    } catch (e) {
      alert(`Could not save serialised grids in local storage: ${e}`);
    }
  };
}