import { Position } from "./position";
export class Tile {
    constructor(position, value) {
        this.position = position;
        this.value = value || 2;
        this.previousPosition = undefined;
        this.mergedFrom = null; // Tracks tiles that merged together
    }
    copy() {
        return new Tile(this.position.copy(), this.value);
    }
    savePosition() {
        this.previousPosition = this.position.copy();
    }
    updatePosition(position) {
        this.position = position;
    }
    serialize() {
        return {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            value: this.value,
        };
    }
}
export function buildTileFromSerialized(serialized) {
    return new Tile(new Position(serialized.position.x, serialized.position.y), serialized.value);
}
