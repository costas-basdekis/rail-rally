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

  checkSegmentIntersection(firstStart: Position, firstEnd: Position, secondStart: Position, secondEnd: Position): boolean {
    const first = this.add(firstEnd, firstStart, 1, -1);
    const second = this.add(secondEnd, secondStart, 1, -1);

    const crossFirstSecond = this.crossProduct(first, second);
    if (crossFirstSecond === 0) {
      const firstLength = this.getPointDistance(firstStart, firstEnd);
      return (
        (firstLength === (this.getPointDistance(firstStart, secondStart) + this.getPointDistance(secondStart, firstEnd)))
        || (firstLength === (this.getPointDistance(firstStart, secondEnd) + this.getPointDistance(secondEnd, firstEnd)))
      );
    }
    const startsDifference = this.add(firstStart, secondStart, 1, -1);
    const firstParameter = this.crossProduct(first, startsDifference) / crossFirstSecond;
    const secondParameter = this.crossProduct(second, startsDifference) / crossFirstSecond;

    return firstParameter >= 0 && firstParameter <= 1 && secondParameter >= 0 && secondParameter <= 1;
  }

  crossProduct(first: Position, second: Position): number {
    return first.x * second.y - second.x * first.y;
  }
}

export const positions = new Positions();
