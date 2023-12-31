import TouchSweep from "../node_modules/touchsweep/dist/touchsweep";
export var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Right"] = 1] = "Right";
    Direction[Direction["Down"] = 2] = "Down";
    Direction[Direction["Left"] = 3] = "Left";
})(Direction || (Direction = {}));
const SWIPE_THRESHOLD = 20;
export class KeyboardInputManager {
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
            new TouchSweep(gameContainer, {}, SWIPE_THRESHOLD);
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
