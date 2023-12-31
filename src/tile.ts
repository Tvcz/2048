import { Position } from "./position";
import { SerializedTile } from "./types";

export class Tile {
  position: Position;
  value: number;
  previousPosition: Position | undefined;
  mergedFrom: Tile[] | null; // Tracks tiles that merged together

  constructor(position: Position, value: number) {
    this.position = position;
    this.value = value || 2;

    this.previousPosition = undefined;
    this.mergedFrom = null; // Tracks tiles that merged together
  }

  copy(): Tile {
    return new Tile(this.position.copy(), this.value);
  }

  savePosition(): void {
    this.previousPosition = this.position.copy();
  }

  updatePosition(position: Position): void {
    this.position = position;
  }

  serialize(): SerializedTile {
    return {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      value: this.value,
    };
  }
}

export function buildTileFromSerialized(serialized: SerializedTile): Tile {
  return new Tile(
    new Position(serialized.position.x, serialized.position.y),
    serialized.value
  );
}
