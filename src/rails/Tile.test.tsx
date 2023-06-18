import {Grid, Tile} from "@/rails";

describe("Tile", () => {
  describe("addInternalConnection", () => {
    it("doesn't add connection with same start and end to empty tile", () => {
      const tile = Tile.empty().addInternalConnection(["bottom", "top"]);
      expect(() => tile.addInternalConnection(["bottom", "top"])).toThrow();
    });
    it("doesn't add connection with same start and end to empty tile, regardless of order", () => {
      const tile = Tile.empty().addInternalConnection(["bottom", "top"]);
      expect(() => tile.addInternalConnection(["top", "bottom"])).toThrow();
    });
    it("adds connection to empty tile", () => {
      expect(Tile.empty().addInternalConnection(["top", "bottom"])).toEqual(Tile.fromConnections([["top", "bottom"]]));
    });
    it("adds second connection to tile", () => {
      expect(Tile.empty().addInternalConnection(["top", "bottom"]).addInternalConnection(["top", "right"])).toEqual(Tile.fromConnections([["top", "bottom"], ["top", "right"]]));
    });
  });
  describe("getConnectionRefusalReason", () => {
    it("doesn't allow crossing 3 neighbour connections that are not cross to each other", () => {
      const grid = Grid.fromSize(3, 3);
      grid.connect([grid.get(1, 2), grid.get(1, 1)]);
      grid.connect([grid.get(0, 2), grid.get(1, 1)]);
      expect(grid.get(1, 1).getConnectionRefusalReason(grid.get(2, 1)))
        .toBe("there will be too many non-cross neighbour connections");
    });
    it("allows 3 non-crossing connections that are not cross to each other", () => {
      const grid = Grid.fromSize(3, 3);
      grid.connect([grid.get(1, 2), grid.get(1, 1)]);
      grid.connect([grid.get(0, 2), grid.get(1, 1)]);
      expect(grid.get(1, 1).getConnectionRefusalReason(grid.get(1, 0))).toBe(null);
      expect(grid.get(1, 1).getConnectionRefusalReason(grid.get(2, 0))).toBe(null);
    });
    it("allows 4 crossing connections", () => {
      const grid = Grid.fromSize(3, 3);
      grid.connect([grid.get(0, 1), grid.get(1, 1)]);
      grid.connect([grid.get(1, 1), grid.get(2, 1)]);
      expect(grid.get(1, 2).getConnectionRefusalReason(grid.get(1, 1))).toBe(null);
      expect(grid.get(1, 1).getConnectionRefusalReason(grid.get(1, 0))).toBe(null);
      grid.connect([grid.get(1, 2), grid.get(1, 1)]);
      expect(grid.get(1, 1).getConnectionRefusalReason(grid.get(1, 0))).toBe(null);
      grid.connect([grid.get(1, 1), grid.get(1, 0)]);
    });
  });
  describe("canDirectionsBeNeighbours", () => {
    it("doesn't allow crossing 3 neighbour connections that are not cross to each other", () => {
      expect(Tile.canDirectionsBeNeighbours(["bottom-left", "bottom", "right"])).toBe(false);
    });
    it("allows crossing 3 neighbour connections that are cross to each other", () => {
      expect(Tile.canDirectionsBeNeighbours(["left", "bottom", "right"])).toBe(true);
    });
    it("allows crossing 4 neighbour connections that are cross to each other", () => {
      expect(Tile.canDirectionsBeNeighbours(["left", "bottom", "right", "top"])).toBe(true);
    });
  });
});
