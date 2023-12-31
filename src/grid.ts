import { Position } from "./position.js";
import { Tile, buildTileFromSerialized } from "./tile.js";
import { SerializedGrid, SerializedTile } from "./types.js";

export class Grid {
  size: number;
  tiles: Tile[];
  cells: Map<String, Tile>;

  constructor(size: number) {
    this.size = size;
    this.cells = new Map();
    this.tiles = [];
  }

  // Find the first available random position
  randomAvailablePosition(): Position {
    let positions = this.availablePositions();
    if (positions.length) {
      return positions[Math.floor(Math.random() * positions.length)];
    }
  }

  // Get all the available cells in the grid
  availablePositions(): Position[] {
    let positions: Position[] = [];
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        let position = new Position(x, y);
        if (!this.cells.has(position.toString())) {
          positions.push(position);
        }
      }
    }
    return positions;
  }

  // Check if there are any cells available
  cellsAvailable(): boolean {
    return !!this.availablePositions().length;
  }

  // Check if the specified cell is taken
  positionAvailable(position: Position): boolean {
    return this.cellContent(position) == null;
  }

  // get the tile at the specified cell position, or null if empty
  cellContent(position: Position) {
    if (this.withinBounds(position)) {
      return this.cells.get(position.toString()) || null;
    } else {
      return null;
    }
  }

  // Inserts a tile at its position
  insertTile(tile: Tile) {
    console.log(
      "Inserting tile: " +
        JSON.stringify(tile) +
        " at position: " +
        JSON.stringify(tile.position)
    );
    this.cells.set(tile.position.toString(), tile);
    if (!this.tiles.find((t) => t == tile)) {
      this.tiles.push(tile);
    }
  }

  // Remove a tile from the grid
  removeTile(tile: Tile) {
    this.cells.delete(tile.position.toString());
    this.tiles = this.tiles.filter((t) => t != tile);
  }

  withinBounds(position: Position) {
    return (
      position.x >= 0 &&
      position.x < this.size &&
      position.y >= 0 &&
      position.y < this.size
    );
  }

  serialize(): SerializedGrid {
    let tiles: SerializedTile[] = this.tiles.map((tile) => {
      return tile.serialize();
    });

    return {
      size: this.size,
      tiles: tiles,
    };
  }

  // Runs the specified callback for every cell in the grid
  eachTile(callback: (tile: Tile) => void) {
    this.cells.forEach((tile) => {
      callback(tile);
    });
  }

  moveTile(tile: Tile, position: Position) {
    this.cells.delete(tile.position.toString());
    this.cells.set(position.toString(), tile);
    tile.updatePosition(position);
  }
}

export function buildGridFromSerialized(serialized: SerializedGrid): Grid {
  let grid = new Grid(serialized.size);
  serialized.tiles.forEach((serializedTile) => {
    let tile = buildTileFromSerialized(serializedTile);
    grid.insertTile(tile);
  });
  return grid;
}
