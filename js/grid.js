import { Position } from "./position.js";
import { buildTileFromSerialized } from "./tile.js";
export class Grid {
    constructor(size) {
        this.size = size;
        this.cells = new Map();
        this.tiles = [];
    }
    // Find the first available random position
    randomAvailablePosition() {
        let positions = this.availablePositions();
        if (positions.length) {
            return positions[Math.floor(Math.random() * positions.length)];
        }
    }
    // Get all the available cells in the grid
    availablePositions() {
        let positions = [];
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
    cellsAvailable() {
        return !!this.availablePositions().length;
    }
    // Check if the specified cell is taken
    positionAvailable(position) {
        return this.cellContent(position) == null;
    }
    // get the tile at the specified cell position, or null if empty
    cellContent(position) {
        if (this.withinBounds(position)) {
            return this.cells.get(position.toString()) || null;
        }
        else {
            return null;
        }
    }
    // Inserts a tile at its position
    insertTile(tile) {
        this.cells.set(tile.position.toString(), tile);
        if (!this.tiles.find((t) => t == tile)) {
            this.tiles.push(tile);
        }
    }
    // Remove a tile from the grid
    removeTile(tile) {
        this.cells.delete(tile.position.toString());
        this.tiles = this.tiles.filter((t) => t != tile);
    }
    withinBounds(position) {
        return (position.x >= 0 &&
            position.x < this.size &&
            position.y >= 0 &&
            position.y < this.size);
    }
    serialize() {
        let tiles = this.tiles.map((tile) => {
            return tile.serialize();
        });
        return {
            size: this.size,
            tiles: tiles,
        };
    }
    // Runs the specified callback for every cell in the grid
    eachTile(callback) {
        this.cells.forEach((tile) => {
            callback(tile);
        });
    }
    moveTile(tile, position) {
        this.cells.delete(tile.position.toString());
        this.cells.set(position.toString(), tile);
        tile.updatePosition(position);
    }
}
export function buildGridFromSerialized(serialized) {
    let grid = new Grid(serialized.size);
    serialized.tiles.forEach((serializedTile) => {
        let tile = buildTileFromSerialized(serializedTile);
        grid.insertTile(tile);
    });
    return grid;
}
