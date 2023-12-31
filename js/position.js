export class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return this.x + "|" + this.y;
    }
    addVector(vector) {
        return new Position(this.x + vector.x, this.y + vector.y);
    }
    copy() {
        return new Position(this.x, this.y);
    }
}
