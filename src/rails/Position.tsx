export interface Position {
  x: number;
  y: number;
}

class Positions {
  getPointDistance(first: Position, second: Position): number {
    const dX = first.x - second.x, dY = first.y - second.y;
    return Math.sqrt(dX * dX + dY * dY);
  }

  interpolatePoint(start: Position, end: Position, progress: number): Position {
    return {
      x: start.x + (end.x - start.x) * progress,
      y: start.y + (end.y - start.y) * progress,
    };
  }

  add(first: Position, second: Position, firstScale: number = 1, secondScale: number = 1): Position {
    return {
      x: first.x * firstScale + second.x * secondScale,
      y: first.y * firstScale + second.y * secondScale,
    };
  }
}

export const positions = new Positions();
