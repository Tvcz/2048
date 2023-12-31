import { Grid, buildGridFromSerialized } from "./grid";
import { Position } from "./position";
import { Tile } from "./tile";
export class GameManager {
    constructor(size, InputManager, Actuator, StorageManager) {
        this.size = size; // Size of the grid
        this.inputManager = new InputManager();
        this.storageManager = new StorageManager();
        this.actuator = new Actuator();
        this.startTiles = 2;
        this.inputManager.on("move", this.move.bind(this));
        this.inputManager.on("restart", this.restart.bind(this));
        this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));
        this.setup();
    }
    // Restart the game
    restart() {
        this.storageManager.clearGameState();
        this.actuator.continueGame(); // Clear the game won/lost message
        this.setup();
    }
    // Keep playing after winning (allows going over 2048)
    keepPlaying() {
        this.shouldKeepPlaying = true;
        this.actuator.continueGame(); // Clear the game won/lost message
    }
    // Return true if the game is lost, or has won and the user hasn't kept playing
    isGameTerminated() {
        return this.over || (this.won && !this.keepPlaying);
    }
    // Set up the game
    setup() {
        let previousState = this.storageManager.getGameState();
        // Reload the game from a previous game if present
        if (previousState) {
            this.grid = buildGridFromSerialized(previousState.grid); // Reload grid
            this.score = previousState.score;
            this.over = previousState.over;
            this.won = previousState.won;
            this.shouldKeepPlaying = previousState.shouldKeepPlaying;
        }
        else {
            this.grid = new Grid(this.size);
            this.score = 0;
            this.over = false;
            this.won = false;
            this.shouldKeepPlaying = false;
            // Add the initial tiles
            this.addStartTiles();
        }
        // Update the actuator
        this.actuate();
    }
    // Set up the initial tiles to start the game with
    addStartTiles() {
        for (let i = 0; i < this.startTiles; i++) {
            this.addRandomTile();
        }
    }
    // Adds a tile in a random position
    addRandomTile() {
        if (this.grid.cellsAvailable()) {
            let value = Math.random() < 0.9 ? 2 : 4;
            let position = this.grid.randomAvailablePosition();
            if (position !== undefined) {
                let tile = new Tile(position, value);
                this.grid.insertTile(tile);
            }
        }
    }
    // Sends the updated grid to the actuator
    actuate() {
        if (Number(this.storageManager.getBestScore()) < this.score) {
            this.storageManager.setBestScore(this.score);
        }
        // Clear the state when the game is over (game over only, not win)
        if (this.over) {
            this.storageManager.clearGameState();
        }
        else {
            this.storageManager.setGameState(this.serialize());
        }
        this.actuator.actuate(this.grid, {
            score: this.score,
            over: this.over,
            won: this.won,
            bestScore: this.storageManager.getBestScore(),
            terminated: this.isGameTerminated(),
        });
    }
    // Represent the current game as an object
    serialize() {
        return {
            grid: this.grid.serialize(),
            score: this.score,
            over: this.over,
            won: this.won,
            shouldKeepPlaying: this.shouldKeepPlaying,
        };
    }
    // Save all tile positions and remove merger info
    prepareTiles() {
        this.grid.eachTile(function (tile) {
            if (tile) {
                tile.mergedFrom = null;
                tile.savePosition();
            }
        });
    }
    // Move a tile and its representation
    moveTile(tile, position) {
        this.grid.moveTile(tile, position);
    }
    // Move tiles on the grid in the specified direction
    move(direction) {
        if (this.isGameTerminated())
            return; // Don't do anything if the game's over
        let position, tile;
        let vector = this.getVector(direction);
        let traversals = this.buildTraversals(vector);
        let moved = false;
        // Save the current tile positions and remove merger information
        this.prepareTiles();
        let traversalsHandler = (x, y) => {
            position = new Position(x, y);
            tile = this.grid.cellContent(position);
            if (tile) {
                let positions = this.findFarthestPositionAndOneAfter(position, vector);
                let next = this.grid.cellContent(positions.next);
                // Only one merger per row traversal?
                if (next && next.value === tile.value && !next.mergedFrom) {
                    let merged = new Tile(positions.next, tile.value * 2);
                    merged.mergedFrom = [tile, next];
                    this.grid.insertTile(merged);
                    this.grid.removeTile(tile);
                    // Converge the two tiles' positions
                    tile.updatePosition(positions.next);
                    // Update the score
                    this.score += merged.value;
                    // increases the size of the grid if the merged value is an odd power
                    // of 2
                    // if ((merged.value / 4) % 2 === 0) {
                    // The mighty 2048 tile
                    if (merged.value === 2048)
                        this.won = true;
                }
                else {
                    this.moveTile(tile, positions.farthest);
                }
                if (!this.positionsEqual(position, tile.position)) {
                    moved = true; // The tile moved from its original cell!
                }
            }
        };
        // Traverse the grid in the right direction and move tiles
        traversals.x.forEach(function (x) {
            traversals.y.forEach(function (y) {
                traversalsHandler(x, y);
            });
        });
        if (moved) {
            this.addRandomTile();
            if (!this.movesAvailable()) {
                this.over = true; // Game over!
            }
            this.actuate();
        }
    }
    // Get the vector representing the chosen direction
    getVector(direction) {
        // Vectors representing tile movement
        let map = {
            0: { x: 0, y: -1 }, // Up
            1: { x: 1, y: 0 }, // Right
            2: { x: 0, y: 1 }, // Down
            3: { x: -1, y: 0 }, // Left
        };
        return map[direction];
    }
    // Build a list of positions to traverse in the right order
    buildTraversals(vector) {
        let traversals = { x: [], y: [] };
        for (let pos = 0; pos < this.size; pos++) {
            traversals.x.push(pos);
            traversals.y.push(pos);
        }
        // Always traverse from the farthest cell in the chosen direction
        if (vector.x === 1)
            traversals.x = traversals.x.reverse();
        if (vector.y === 1)
            traversals.y = traversals.y.reverse();
        return traversals;
    }
    findFarthestPositionAndOneAfter(position, vector) {
        let previous;
        // Progress towards the vector direction until an obstacle is found
        do {
            previous = position;
            position = new Position(previous.x + vector.x, previous.y + vector.y);
        } while (this.grid.withinBounds(position) &&
            this.grid.positionAvailable(position));
        return {
            farthest: previous,
            next: position, // Used to check if a merge is required
        };
    }
    movesAvailable() {
        return this.grid.cellsAvailable() || this.tileMatchesAvailable();
    }
    // Check for available matches between tiles (more expensive check)
    tileMatchesAvailable() {
        let tile;
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                tile = this.grid.cellContent(new Position(x, y));
                if (tile) {
                    for (let direction = 0; direction < 4; direction++) {
                        let vector = this.getVector(direction);
                        let position = new Position(x + vector.x, y + vector.y);
                        let other = this.grid.cellContent(position);
                        if (other && other.value === tile.value) {
                            return true; // These two tiles can be merged
                        }
                    }
                }
            }
        }
        return false;
    }
    positionsEqual(first, second) {
        return first.x === second.x && first.y === second.y;
    }
}
