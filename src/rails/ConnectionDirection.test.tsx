import {connectionDirections} from "./ConnectionDirection";
import exp = require("constants");

describe("ConnectionDirection", () => {
  describe("connectionDirections", () => {
    describe("items", () => {
      it("has 8 distinct items", () => {
        expect(new Set(connectionDirections.items).size).toBe(8);
      });
    });
    describe("oppositeMap", () => {
      it("is correct", () => {
        expect(connectionDirections.oppositeMap).toEqual({
          top: "bottom",
          "top-right": "bottom-left",
          right: "left",
          "bottom-right": "top-left",
          bottom: "top",
          "bottom-left": "top-right",
          "left": "right",
          "top-left": "bottom-right",
        });
      });
      it("has keys to be equal to items", () => {
        expect(Array.from(Object.keys(connectionDirections.oppositeMap)).sort()).toEqual(Array.from(connectionDirections.items).sort());
      });
      it("has values to be equal to items", () => {
        expect(Array.from(Object.values(connectionDirections.oppositeMap)).sort()).toEqual(Array.from(connectionDirections.items).sort());
      });
    });
    describe("connectableDirections", () => {
      it("is correct", () => {
        expect(connectionDirections.connectableDirections).toEqual({
          top: ["bottom-right", "bottom", "bottom-left"],
          "top-right": ["bottom", "bottom-left", "left"],
          right: ["bottom-left", "left", "top-left"],
          "bottom-right": ["left", "top-left", "top"],
          bottom: ["top-left", "top", "top-right"],
          "bottom-left": ["top", "top-right", "right"],
          "left": ["top-right", "right", "bottom-right"],
          "top-left": ["right", "bottom-right", "bottom"],
        });
      });
    });
    describe("otherConnectionsByOffset", () => {
      it("top is correct", () => {
        expect(connectionDirections.otherConnectionsByOffset["top"]).toEqual({
          0: ["top"],
          1: ["top-left", "top-right"],
          2: ["left", "right"],
          3: ["bottom-left", "bottom-right"],
          4: ["bottom"],
        });
      });
      it("left is correct", () => {
        expect(connectionDirections.otherConnectionsByOffset["left"]).toEqual({
          0: ["left"],
          1: ["bottom-left", "top-left"],
          2: ["bottom", "top"],
          3: ["bottom-right", "top-right"],
          4: ["right"],
        });
      });
    });
  });
});
