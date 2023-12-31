/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ (() => {

(function () {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
            window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
}());


/***/ }),
/* 2 */
/***/ (() => {

Function.prototype.bind = Function.prototype.bind || function (target) {
    var self = this;
    return function (args) {
        if (!(args instanceof Array)) {
            args = [args];
        }
        self.apply(target, args);
    };
};


/***/ }),
/* 3 */
/***/ (() => {

(function () {
    if (typeof window.Element === "undefined" ||
        "classList" in document.documentElement) {
        return;
    }
    var prototype = Array.prototype, push = prototype.push, splice = prototype.splice, join = prototype.join;
    class DOMTokenList {
        constructor(el) {
            this.el = el;
            // The className needs to be trimmed and split on whitespace
            // to retrieve a list of classes.
            let classes = el.className.replace(/^\s+|\s+$/g, "").split(/\s+/);
            for (var i = 0; i < classes.length; i++) {
                push.call(this, classes[i]);
            }
            this.length = classes.length;
        }
        add(token) {
            if (this.contains(token))
                return;
            push.call(this, token);
            this.length += 1;
            this.el.className = this.toString();
        }
        contains(token) {
            return this.el.className.indexOf(token) != -1;
        }
        item(index) {
            return this[index] || null;
        }
        remove(token) {
            if (!this.contains(token))
                return;
            for (var i = 0; i < this.length; i++) {
                if (this[i] == token)
                    break;
            }
            splice.call(this, i, 1);
            this.length -= 1;
            this.el.className = this.toString();
        }
        toString() {
            return join.call(this, " ");
        }
        toggle(token) {
            let containsToken = this.contains(token);
            if (!containsToken) {
                this.add(token);
            }
            else {
                this.remove(token);
            }
            return containsToken;
        }
    }
    window.DOMTokenList = DOMTokenList;
    function defineElementGetter(obj, prop, getter) {
        if (Object.defineProperty) {
            Object.defineProperty(obj, prop, {
                get: getter,
            });
        }
        else {
            obj.__defineGetter__(prop, getter);
        }
    }
    defineElementGetter(HTMLElement.prototype, "classList", function () {
        return new DOMTokenList(this);
    });
})();


/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _game_manager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/* harmony import */ var _html_actuator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9);
/* harmony import */ var _keyboard_input_manager__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(10);
/* harmony import */ var _local_storage_manager__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(12);




// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
    new _game_manager__WEBPACK_IMPORTED_MODULE_0__.GameManager(4, _keyboard_input_manager__WEBPACK_IMPORTED_MODULE_2__.KeyboardInputManager, _html_actuator__WEBPACK_IMPORTED_MODULE_1__.HTMLActuator, _local_storage_manager__WEBPACK_IMPORTED_MODULE_3__.LocalStorageManager);
});


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GameManager: () => (/* binding */ GameManager)
/* harmony export */ });
/* harmony import */ var _grid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
/* harmony import */ var _position__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7);
/* harmony import */ var _tile__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8);



class GameManager {
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
            this.grid = (0,_grid__WEBPACK_IMPORTED_MODULE_0__.buildGridFromSerialized)(previousState.grid); // Reload grid
            this.score = previousState.score;
            this.over = previousState.over;
            this.won = previousState.won;
            this.shouldKeepPlaying = previousState.shouldKeepPlaying;
        }
        else {
            this.grid = new _grid__WEBPACK_IMPORTED_MODULE_0__.Grid(this.size);
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
                let tile = new _tile__WEBPACK_IMPORTED_MODULE_2__.Tile(position, value);
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
            position = new _position__WEBPACK_IMPORTED_MODULE_1__.Position(x, y);
            tile = this.grid.cellContent(position);
            if (tile) {
                let positions = this.findFarthestPositionAndOneAfter(position, vector);
                let next = this.grid.cellContent(positions.next);
                // Only one merger per row traversal?
                if (next && next.value === tile.value && !next.mergedFrom) {
                    let merged = new _tile__WEBPACK_IMPORTED_MODULE_2__.Tile(positions.next, tile.value * 2);
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
            position = new _position__WEBPACK_IMPORTED_MODULE_1__.Position(previous.x + vector.x, previous.y + vector.y);
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
                tile = this.grid.cellContent(new _position__WEBPACK_IMPORTED_MODULE_1__.Position(x, y));
                if (tile) {
                    for (let direction = 0; direction < 4; direction++) {
                        let vector = this.getVector(direction);
                        let position = new _position__WEBPACK_IMPORTED_MODULE_1__.Position(x + vector.x, y + vector.y);
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


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Grid: () => (/* binding */ Grid),
/* harmony export */   buildGridFromSerialized: () => (/* binding */ buildGridFromSerialized)
/* harmony export */ });
/* harmony import */ var _position__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7);
/* harmony import */ var _tile__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8);


class Grid {
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
                let position = new _position__WEBPACK_IMPORTED_MODULE_0__.Position(x, y);
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
function buildGridFromSerialized(serialized) {
    let grid = new Grid(serialized.size);
    serialized.tiles.forEach((serializedTile) => {
        let tile = (0,_tile__WEBPACK_IMPORTED_MODULE_1__.buildTileFromSerialized)(serializedTile);
        grid.insertTile(tile);
    });
    return grid;
}


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Position: () => (/* binding */ Position)
/* harmony export */ });
class Position {
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


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Tile: () => (/* binding */ Tile),
/* harmony export */   buildTileFromSerialized: () => (/* binding */ buildTileFromSerialized)
/* harmony export */ });
/* harmony import */ var _position__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7);

class Tile {
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
function buildTileFromSerialized(serialized) {
    return new Tile(new _position__WEBPACK_IMPORTED_MODULE_0__.Position(serialized.position.x, serialized.position.y), serialized.value);
}


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HTMLActuator: () => (/* binding */ HTMLActuator)
/* harmony export */ });
/* harmony import */ var _position__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7);

class HTMLActuator {
    constructor() {
        let tileContainer = document.querySelector(".tile-container");
        let scoreContainer = document.querySelector(".score-container");
        let bestContainer = document.querySelector(".best-container");
        let messageContainer = document.querySelector(".game-message");
        if (tileContainer == null ||
            scoreContainer == null ||
            bestContainer == null ||
            messageContainer == null) {
            throw new Error("One of the required elements is missing");
        }
        this.tileContainer = tileContainer;
        this.scoreContainer = scoreContainer;
        this.bestContainer = bestContainer;
        this.messageContainer = messageContainer;
        this.score = 0;
    }
    actuate(grid, metadata) {
        var self = this;
        window.requestAnimationFrame(function () {
            self.clearContainer(self.tileContainer);
            grid.eachTile((tile) => {
                if (tile !== undefined) {
                    self.addTile(tile);
                }
            });
            self.updateScore(metadata.score);
            self.updateBestScore(metadata.bestScore);
            if (metadata.terminated) {
                if (metadata.over) {
                    self.message(false); // You lose
                }
                else if (metadata.won) {
                    self.message(true); // You win!
                }
            }
        });
    }
    // Continues the game (both restart and keep playing)
    continueGame() {
        this.clearMessage();
    }
    clearContainer(container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }
    addTile(tile) {
        var self = this;
        var wrapper = document.createElement("div");
        var inner = document.createElement("div");
        var position = tile.previousPosition || tile.position;
        var positionClass = this.positionClass(position);
        // We can't use classlist because it somehow glitches when replacing classes
        var classes = ["tile", "tile-" + tile.value, positionClass];
        if (tile.value > 2048)
            classes.push("tile-super");
        this.applyClasses(wrapper, classes);
        inner.classList.add("tile-inner");
        inner.textContent = `${tile.value}`;
        if (tile.previousPosition) {
            // Make sure that the tile gets rendered in the previous position first
            window.requestAnimationFrame(function () {
                classes[2] = self.positionClass(tile.position);
                self.applyClasses(wrapper, classes); // Update the position
            });
        }
        else if (tile.mergedFrom) {
            classes.push("tile-merged");
            this.applyClasses(wrapper, classes);
            // Render the tiles that merged
            tile.mergedFrom.forEach(function (merged) {
                self.addTile(merged);
            });
        }
        else {
            classes.push("tile-new");
            this.applyClasses(wrapper, classes);
        }
        // Add the inner part of the tile to the wrapper
        wrapper.appendChild(inner);
        // Put the tile on the board
        this.tileContainer.appendChild(wrapper);
    }
    applyClasses(element, classes) {
        element.setAttribute("class", classes.join(" "));
    }
    normalizePosition(position) {
        return new _position__WEBPACK_IMPORTED_MODULE_0__.Position(position.x + 1, position.y + 1);
    }
    positionClass(position) {
        position = this.normalizePosition(position);
        return "tile-position-" + position.x + "-" + position.y;
    }
    updateScore(score) {
        this.clearContainer(this.scoreContainer);
        var difference = score - this.score;
        this.score = score;
        this.scoreContainer.textContent = `${this.score}`;
        if (difference > 0) {
            var addition = document.createElement("div");
            addition.classList.add("score-addition");
            addition.textContent = "+" + difference;
            this.scoreContainer.appendChild(addition);
        }
    }
    updateBestScore(bestScore) {
        this.bestContainer.textContent = bestScore;
    }
    message(won) {
        var type = won ? "game-won" : "game-over";
        var message = won ? "You win!" : "Game over!";
        this.messageContainer.classList.add(type);
        this.messageContainer.getElementsByTagName("p")[0].textContent = message;
    }
    clearMessage() {
        // IE only takes one value to remove at a time.
        this.messageContainer.classList.remove("game-won");
        this.messageContainer.classList.remove("game-over");
    }
}


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Direction: () => (/* binding */ Direction),
/* harmony export */   KeyboardInputManager: () => (/* binding */ KeyboardInputManager)
/* harmony export */ });
/* harmony import */ var _node_modules_touchsweep_dist_touchsweep__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(11);
/* harmony import */ var _node_modules_touchsweep_dist_touchsweep__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_touchsweep_dist_touchsweep__WEBPACK_IMPORTED_MODULE_0__);

var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Right"] = 1] = "Right";
    Direction[Direction["Down"] = 2] = "Down";
    Direction[Direction["Left"] = 3] = "Left";
})(Direction || (Direction = {}));
const SWIPE_THRESHOLD = 20;
class KeyboardInputManager {
    constructor() {
        this.listen = function () {
            let self = this;
            let map = {
                ArrowUp: Direction.Up,
                ArrowRight: Direction.Right,
                ArrowDown: Direction.Down,
                ArrowLeft: Direction.Left,
                k: Direction.Up,
                l: Direction.Right,
                j: Direction.Down,
                h: Direction.Left,
                w: Direction.Up,
                d: Direction.Right,
                s: Direction.Down,
                a: Direction.Left,
            };
            // Respond to direction keys
            document.addEventListener("keydown", function (event) {
                let modifiers = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
                let mapped = map[event.key];
                if (!modifiers) {
                    if (mapped !== undefined) {
                        event.preventDefault();
                        self.emit("move", mapped);
                    }
                }
                // R key restarts the game
                if (!modifiers && event.key === "r") {
                    self.restart.call(self, event);
                }
            });
            // Respond to button presses
            this.bindButtonPress(".retry-button", this.restart);
            this.bindButtonPress(".restart-button", this.restart);
            this.bindButtonPress(".keep-playing-button", this.keepPlaying);
            // Respond to swipe events
            let touchStartClientX, touchStartClientY;
            let gameContainer = document.querySelector(".game-container");
            if (!gameContainer) {
                throw new Error("No game container found");
            }
            gameContainer.addEventListener(this.eventTouchstart, function (event) {
                if ((!window.PointerEvent && event.touches.length > 1) ||
                    event.targetTouches.length > 1) {
                    return; // Ignore if touching with more than 1 finger
                }
                if (window.PointerEvent) {
                    touchStartClientX = event.pageX;
                    touchStartClientY = event.pageY;
                }
                else {
                    touchStartClientX = event.touches[0].clientX;
                    touchStartClientY = event.touches[0].clientY;
                }
                event.preventDefault();
            });
            gameContainer.addEventListener(this.eventTouchmove, function (event) {
                event.preventDefault();
            });
            gameContainer.addEventListener(this.eventTouchend, function (event) {
                if ((!window.PointerEvent && event.touches.length > 0) ||
                    event.targetTouches.length > 0) {
                    return; // Ignore if still touching with one or more fingers
                }
                let touchEndClientX, touchEndClientY;
                if (window.PointerEvent) {
                    touchEndClientX = event.pageX;
                    touchEndClientY = event.pageY;
                }
                else {
                    touchEndClientX = event.changedTouches[0].clientX;
                    touchEndClientY = event.changedTouches[0].clientY;
                }
                let dx = touchEndClientX - touchStartClientX;
                let absDx = Math.abs(dx);
                let dy = touchEndClientY - touchStartClientY;
                let absDy = Math.abs(dy);
                if (Math.max(absDx, absDy) > 10) {
                    // (right : left) : (down : up)
                    self.emit("move", absDx > absDy
                        ? dx > 0
                            ? Direction.Right
                            : Direction.Left
                        : dy > 0
                            ? Direction.Down
                            : Direction.Up);
                }
            });
            new (_node_modules_touchsweep_dist_touchsweep__WEBPACK_IMPORTED_MODULE_0___default())(gameContainer, {}, SWIPE_THRESHOLD);
            gameContainer.addEventListener("swipeleft", () => {
                self.emit("move", Direction.Left);
            });
            gameContainer.addEventListener("swiperight", () => {
                self.emit("move", Direction.Right);
            });
            gameContainer.addEventListener("swipeup", () => {
                self.emit("move", Direction.Up);
            });
            gameContainer.addEventListener("swipedown", () => {
                self.emit("move", Direction.Down);
            });
        };
        this.bindButtonPress = function (selector, fn) {
            let button = document.querySelector(selector);
            button.addEventListener("click", fn.bind(this));
            button.addEventListener(this.eventTouchend, fn.bind(this));
        };
        this.events = new Map();
        if (window.PointerEvent) {
            //Internet Explorer 10 style
            this.eventTouchstart = "MSPointerDown";
            this.eventTouchmove = "MSPointerMove";
            this.eventTouchend = "MSPointerUp";
        }
        else {
            this.eventTouchstart = "touchstart";
            this.eventTouchmove = "touchmove";
            this.eventTouchend = "touchend";
        }
        this.listen();
    }
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    emit(event, data) {
        let callbacks = this.events[event];
        if (callbacks) {
            callbacks.forEach(function (callback) {
                callback(data);
            });
        }
    }
    restart(event) {
        event.preventDefault();
        this.emit("restart");
    }
    keepPlaying(event) {
        event.preventDefault();
        this.emit("keepPlaying");
    }
}


/***/ }),
/* 11 */
/***/ (function(__unused_webpack_module, exports) {

(function (global, factory) {
     true ? factory(exports) :
    0;
})(this, (function (exports) { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol */


    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    exports.TouchSwipeEventType = void 0;
    (function (TouchSwipeEventType) {
        TouchSwipeEventType["up"] = "swipeup";
        TouchSwipeEventType["tap"] = "tap";
        TouchSwipeEventType["down"] = "swipedown";
        TouchSwipeEventType["move"] = "swipemove";
        TouchSwipeEventType["left"] = "swipeleft";
        TouchSwipeEventType["right"] = "swiperight";
    })(exports.TouchSwipeEventType || (exports.TouchSwipeEventType = {}));
    var defaultCoordinates = {
        endX: 0,
        endY: 0,
        moveX: 0,
        moveY: 0,
        startX: 0,
        startY: 0
    };
    var TouchSweep = /** @class */ (function () {
        function TouchSweep(element, data, threshold) {
            if (element === void 0) { element = document.body; }
            if (data === void 0) { data = {}; }
            if (threshold === void 0) { threshold = 40; }
            this.element = element;
            this.eventData = data;
            this.threshold = threshold;
            this.coords = defaultCoordinates;
            this.isMoving = false;
            this.moveCoords = { x: 0, y: 0 };
            this.onStart = this.onStart.bind(this);
            this.onMove = this.onMove.bind(this);
            this.onEnd = this.onEnd.bind(this);
            this.bind();
            return this; //NOSONAR
        }
        TouchSweep.prototype.bind = function () {
            var element = this.element;
            element.addEventListener('touchstart', this.onStart, { passive: true });
            element.addEventListener('touchmove', this.onMove, { passive: true });
            element.addEventListener('touchend', this.onEnd, { passive: true });
            element.addEventListener('mousedown', this.onStart, { passive: true });
            element.addEventListener('mousemove', this.onMove, { passive: true });
            element.addEventListener('mouseup', this.onEnd, { passive: true });
        };
        TouchSweep.prototype.unbind = function () {
            var element = this.element;
            // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener#matching_event_listeners_for_removal
            element.removeEventListener('touchstart', this.onStart, false);
            element.removeEventListener('touchmove', this.onMove, false);
            element.removeEventListener('touchend', this.onEnd, false);
            element.removeEventListener('mousedown', this.onStart, false);
            element.removeEventListener('mousemove', this.onMove, false);
            element.removeEventListener('mouseup', this.onEnd, false);
        };
        TouchSweep.prototype.getCoords = function (event) {
            var result = this.moveCoords;
            var isMouseEvent = 'pageX' in event;
            result.x = isMouseEvent ? event.pageX : event.changedTouches[0].screenX;
            result.y = isMouseEvent ? event.pageY : event.changedTouches[0].screenY;
            return result;
        };
        TouchSweep.prototype.resetCoords = function () {
            this.coords = defaultCoordinates;
        };
        // prettier-ignore
        TouchSweep.prototype.getEndEventName = function () {
            var threshold = this.threshold;
            var _a = this.coords, startX = _a.startX, startY = _a.startY, endX = _a.endX, endY = _a.endY;
            var distanceX = Math.abs(endX - startX);
            var distanceY = Math.abs(endY - startY);
            var isSwipeX = distanceX > distanceY;
            if (isSwipeX) {
                if (endX < startX && distanceX > threshold) {
                    return exports.TouchSwipeEventType.left;
                }
                if (endX > startX && distanceX > threshold) {
                    return exports.TouchSwipeEventType.right;
                }
            }
            else {
                if (endY < startY && distanceY > threshold) {
                    return exports.TouchSwipeEventType.up;
                }
                if (endY > startY && distanceY > threshold) {
                    return exports.TouchSwipeEventType.down;
                }
            }
            if (endY === startY && endX === startX) {
                return exports.TouchSwipeEventType.tap;
            }
            return '';
        };
        TouchSweep.prototype.dispatchEvent = function (type) {
            var event = new CustomEvent(type, {
                detail: __assign(__assign({}, this.eventData), { coords: this.coords })
            });
            this.element.dispatchEvent(event);
        };
        TouchSweep.prototype.dispatchEnd = function () {
            var eventName = this.getEndEventName();
            if (!eventName) {
                return;
            }
            this.dispatchEvent(eventName);
        };
        TouchSweep.prototype.onStart = function (event) {
            var _a = this.getCoords(event), x = _a.x, y = _a.y;
            this.isMoving = true;
            this.coords.startX = x;
            this.coords.startY = y;
        };
        TouchSweep.prototype.onMove = function (event) {
            if (!this.isMoving) {
                return;
            }
            var _a = this.getCoords(event), x = _a.x, y = _a.y;
            this.coords.moveX = x;
            this.coords.moveY = y;
            this.dispatchEvent(exports.TouchSwipeEventType.move);
        };
        TouchSweep.prototype.onEnd = function (event) {
            var _a = this.getCoords(event), x = _a.x, y = _a.y;
            this.isMoving = false;
            this.coords.endX = x;
            this.coords.endY = y;
            this.dispatchEnd();
            this.resetCoords();
        };
        return TouchSweep;
    }());

    exports.default = TouchSweep;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=touchsweep.js.map


/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LocalStorageManager: () => (/* binding */ LocalStorageManager)
/* harmony export */ });
class fakeStorage extends Storage {
    constructor() {
        super(...arguments);
        this.data = new Map();
    }
    setItem(id, val) {
        return (this._data[id] = String(val));
    }
    getItem(id) {
        return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
    }
    removeItem(id) {
        return delete this._data[id];
    }
    clear() {
        return (this._data = {});
    }
}
class LocalStorageManager {
    constructor() {
        this.bestScoreKey = "bestScore";
        this.gameStateKey = "gameState";
        var supported = this.localStorageSupported();
        this.storage = supported ? window.localStorage : new fakeStorage();
    }
    localStorageSupported() {
        var testKey = "test";
        try {
            var storage = window.localStorage;
            storage.setItem(testKey, "1");
            storage.removeItem(testKey);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    // Best score getters/setters
    getBestScore() {
        return Number(this.storage.getItem(this.bestScoreKey)) || 0;
    }
    setBestScore(score) {
        this.storage.setItem(this.bestScoreKey, `${score}`);
    }
    // Game state getters/setters and clearing
    getGameState() {
        var stateJSON = this.storage.getItem(this.gameStateKey);
        return stateJSON ? JSON.parse(stateJSON) : null;
    }
    setGameState(gameState) {
        this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
    }
    clearGameState() {
        this.storage.removeItem(this.gameStateKey);
    }
}


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _animframe_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _animframe_polyfill__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_animframe_polyfill__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _bind_polyfill__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony import */ var _bind_polyfill__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_bind_polyfill__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _classlist_polyfill__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);
/* harmony import */ var _classlist_polyfill__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_classlist_polyfill__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _application_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(4);





})();

/******/ })()
;