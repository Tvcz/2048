import { Grid } from "./grid.js";
import { Position } from "./position.js";
import { Tile } from "./tile.js";

export class HTMLActuator {
  tileContainer: Element;
  scoreContainer: Element;
  bestContainer: Element;
  messageContainer: Element;
  score: number;

  constructor() {
    let tileContainer = document.querySelector(".tile-container");
    let scoreContainer = document.querySelector(".score-container");
    let bestContainer = document.querySelector(".best-container");
    let messageContainer = document.querySelector(".game-message");

    if (
      tileContainer == null ||
      scoreContainer == null ||
      bestContainer == null ||
      messageContainer == null
    ) {
      throw new Error("One of the required elements is missing");
    }

    this.tileContainer = tileContainer;
    this.scoreContainer = scoreContainer;
    this.bestContainer = bestContainer;
    this.messageContainer = messageContainer;

    this.score = 0;
  }

  actuate(grid: Grid, metadata) {
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
        } else if (metadata.won) {
          self.message(true); // You win!
        }
      }
    });
  }

  // Continues the game (both restart and keep playing)
  continueGame() {
    this.clearMessage();
  }

  clearContainer(container: Element) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  addTile(tile: Tile) {
    var self = this;

    var wrapper = document.createElement("div");
    var inner = document.createElement("div");
    var position = tile.previousPosition || tile.position;
    var positionClass = this.positionClass(position);

    // We can't use classlist because it somehow glitches when replacing classes
    var classes = ["tile", "tile-" + tile.value, positionClass];

    if (tile.value > 2048) classes.push("tile-super");

    this.applyClasses(wrapper, classes);

    inner.classList.add("tile-inner");
    inner.textContent = `${tile.value}`;

    if (tile.previousPosition) {
      // Make sure that the tile gets rendered in the previous position first
      window.requestAnimationFrame(function () {
        classes[2] = self.positionClass(tile.position);
        self.applyClasses(wrapper, classes); // Update the position
      });
    } else if (tile.mergedFrom) {
      classes.push("tile-merged");
      this.applyClasses(wrapper, classes);

      // Render the tiles that merged
      tile.mergedFrom.forEach(function (merged) {
        self.addTile(merged);
      });
    } else {
      classes.push("tile-new");
      this.applyClasses(wrapper, classes);
    }

    // Add the inner part of the tile to the wrapper
    wrapper.appendChild(inner);

    // Put the tile on the board
    this.tileContainer.appendChild(wrapper);
  }

  applyClasses(element: HTMLDivElement, classes: string[]) {
    element.setAttribute("class", classes.join(" "));
  }

  normalizePosition(position: Position): Position {
    return new Position(position.x + 1, position.y + 1);
  }

  positionClass(position: Position): string {
    position = this.normalizePosition(position);
    return "tile-position-" + position.x + "-" + position.y;
  }

  updateScore(score: number) {
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

  message(won: boolean) {
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
