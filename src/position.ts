export class Position {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  toString(): string {
    return this.x + "|" + this.y;
  }

  addVector(vector: { x: number; y: number }): Position {
    return new Position(this.x + vector.x, this.y + vector.y);
  }

  copy(): Position {
    return new Position(this.x, this.y);
  }
}
