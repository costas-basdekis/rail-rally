export const connectionDirections = [
  "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "top-left",
] as const;
export type ConnectionDirection = typeof connectionDirections[number];

export class Tile {
  internalConnections: [ConnectionDirection, ConnectionDirection][];
  deadEndInternalConnections: ConnectionDirection[];
  externalConnections: ConnectionDirection[];

  constructor(internalConnections: [ConnectionDirection, ConnectionDirection][], deadEndInternalConnections: ConnectionDirection[]) {
    this.internalConnections = internalConnections;
    this.deadEndInternalConnections = deadEndInternalConnections;
    this.externalConnections = Array.from(new Set([
      ...internalConnections.flat(),
      ...deadEndInternalConnections.flat(),
    ])).sort();
  }
}
