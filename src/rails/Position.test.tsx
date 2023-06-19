import {positions} from "./Position";

describe("Positions", () => {
  describe("checkSegmentIntersection", () => {
    it("detects X pattern", () => {
      expect(positions.checkSegmentIntersection({x: 0, y: 0}, {x: 1, y: 1}, {x: 0, y: 1}, {x: 1, y: 0})).toBe(true);
    });
    it("detects cross pattern", () => {
      expect(positions.checkSegmentIntersection({x: 0.5, y: 1}, {x: 0.5, y: 0}, {x: 0, y: 0.5}, {x: 1, y: 0.5})).toBe(true);
    });
    it("detects equal segments", () => {
      expect(positions.checkSegmentIntersection({x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 0}, {x: 1, y: 0})).toBe(true);
    });
    it("detects overlapping segments", () => {
      expect(positions.checkSegmentIntersection({x: 0, y: 0}, {x: 1, y: 0}, {x: 0.5, y: 0}, {x: 1.5, y: 0})).toBe(true);
    });
    it("detects line touching the middle", () => {
      expect(positions.checkSegmentIntersection({x: 0, y: 0}, {x: 1, y: 0}, {x: 0.5, y: 1}, {x: 0.5, y: 0})).toBe(true);
    });
    it("detects segments touching at the end", () => {
      expect(positions.checkSegmentIntersection({x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}, {x: 0, y: 0})).toBe(true);
    });

    it("ignores non-touching X pattern", () => {
      expect(positions.checkSegmentIntersection({x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y: 0})).toBe(false);
    });
    it("ignores non-touching cross pattern", () => {
      expect(positions.checkSegmentIntersection({x: 0.5, y: 1}, {x: 0.5, y: 0}, {x: 1, y: 0.5}, {x: 2, y: 0.5})).toBe(false);
    });
    it("ignores parallel segments on same line", () => {
      expect(positions.checkSegmentIntersection({x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0})).toBe(false);
    });
    it("ignores parallel segments with same X coordinates", () => {
      expect(positions.checkSegmentIntersection({x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1})).toBe(false);
    });
    it("ignores parallel segments with different X coordinates", () => {
      expect(positions.checkSegmentIntersection({x: 0, y: 0}, {x: 1, y: 0}, {x: 0.5, y: 1}, {x: 1.5, y: 1})).toBe(false);
    });
  });
});
