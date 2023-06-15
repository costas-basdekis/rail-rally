export const connectionDirections: {
  items: ConnectionDirection[],
  oppositeMap: { [key: ConnectionDirection]: ConnectionDirection },
} = {
  items: [
    "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "top-left",
  ] as const,
  oppositeMap: {
    top: "bottom",
    "top-right": "bottom-left",
    right: "left",
    "bottom-right": "top-left",
    bottom: "top",
    "bottom-left": "top-right",
    "left": "right",
    "top-left": "bottom-right",
  },
};
export type ConnectionDirection = typeof connectionDirections.items[number];
