import { manhattanDistance, sleep } from "./utils.js";

export class Tile {
    static list = [];

    static removeAll() {
        $(".tile").remove();
        Tile.list = [];
    }

    constructor({ puzzle, correctPos, text }) {
        this.text = text;
        this.puzzle = puzzle;
        this.correctPos = correctPos;
        this.element = $("<div></div>")
            .addClass("tile")
            .appendTo("#puzzle");
        this.moveTo(correctPos);

        $("<button></button>")
            .addClass("tileContent")
            .text(text)
            .appendTo(this.element)
            .click(() => this.handleClick());
        Tile.list.push(this);
    }

    moveTo({ x, y }) {
        this.element.css("--x", x).css("--y", y);
    }

    handleClick() {
        if (this.puzzle.scrambling) return;
        const pos = this.pos;
        if (manhattanDistance(pos, this.puzzle.emptyPos) == 1) {
            this.moveTo(this.puzzle.emptyPos);
            this.puzzle.emptyPos = pos;
            setTimeout(() => this.puzzle.checkSolved(), 150);
        }
    }

    get pos() {
        const x = parseInt(this.element.css("--x"));
        const y = parseInt(this.element.css("--y"));
        return { x, y };
    }

    get isCorrect() {
        return (
            this.pos.x == this.correctPos.x &&
            this.pos.y == this.correctPos.y
        );
    }
}
