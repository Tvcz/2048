export enum Direction {
  Up = 0,
  Right = 1,
  Down = 2,
  Left = 3,
}

export class KeyboardInputManager {
  events: Map<KeyboardEvent, (data: any) => void>;
  eventTouchstart: string;
  eventTouchmove: string;
  eventTouchend: string;

  constructor() {
    this.events = new Map();

    if (window.PointerEvent) {
      //Internet Explorer 10 style
      this.eventTouchstart = "MSPointerDown";
      this.eventTouchmove = "MSPointerMove";
      this.eventTouchend = "MSPointerUp";
    } else {
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

  emit(event, data?) {
    let callbacks = this.events[event];
    if (callbacks) {
      callbacks.forEach(function (callback) {
        callback(data);
      });
    }
  }

  listen = function () {
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
      let modifiers =
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
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
    let gameContainer = document.getElementsByClassName("game-container")[0];

    gameContainer.addEventListener(this.eventTouchstart, function (event) {
      if (
        (!window.PointerEvent && event.touches.length > 1) ||
        event.targetTouches.length > 1
      ) {
        return; // Ignore if touching with more than 1 finger
      }

      if (window.PointerEvent) {
        touchStartClientX = event.pageX;
        touchStartClientY = event.pageY;
      } else {
        touchStartClientX = event.touches[0].clientX;
        touchStartClientY = event.touches[0].clientY;
      }

      event.preventDefault();
    });

    gameContainer.addEventListener(this.eventTouchmove, function (event) {
      event.preventDefault();
    });

    gameContainer.addEventListener(this.eventTouchend, function (event) {
      if (
        (!window.PointerEvent && event.touches.length > 0) ||
        event.targetTouches.length > 0
      ) {
        return; // Ignore if still touching with one or more fingers
      }

      let touchEndClientX, touchEndClientY;

      if (window.PointerEvent) {
        touchEndClientX = event.pageX;
        touchEndClientY = event.pageY;
      } else {
        touchEndClientX = event.changedTouches[0].clientX;
        touchEndClientY = event.changedTouches[0].clientY;
      }

      let dx = touchEndClientX - touchStartClientX;
      let absDx = Math.abs(dx);

      let dy = touchEndClientY - touchStartClientY;
      let absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) > 10) {
        // (right : left) : (down : up)
        self.emit(
          "move",
          absDx > absDy
            ? dx > 0
              ? Direction.Right
              : Direction.Left
            : dy > 0
            ? Direction.Down
            : Direction.Up
        );
      }
    });
  };

  restart(event: Event) {
    event.preventDefault();
    this.emit("restart");
  }

  keepPlaying(event: Event) {
    event.preventDefault();
    this.emit("keepPlaying");
  }

  bindButtonPress = function (selector, fn) {
    let button = document.querySelector(selector);
    button.addEventListener("click", fn.bind(this));
    button.addEventListener(this.eventTouchend, fn.bind(this));
  };
}
