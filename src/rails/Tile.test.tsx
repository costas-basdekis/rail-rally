import {Tile} from "./Tile";

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
});
