import { Tile } from "./Tile.js";
import { manhattanDistance, randEl, sleep } from "./utils.js";

export class Puzzle {
    constructor({ size }) {
        this.size = size;
        this.emptyPos = { x: this.size.x - 1, y: this.size.y - 1 };
        this.scrambling = false;
        this.adjustDOM();
        this.enableMenu();
        this.createTiles();
        this.lastMovedTile = null;
    }

    adjustDOM() {
        $("#puzzle")
            .css("--size_x", this.size.x)
            .css("--size_y", this.size.y);
        const count = this.size.x * this.size.y - 1;
        $("h1").text(`${count} Puzzle`);
        document.title = `${count} Puzzle`;
        $("#input_x").val(this.size.x);
        $("#input_y").val(this.size.y);
    }

    enableMenu() {
        $("#scrambleBtn").click(() => {
            if (this.scrambling) {
                this.scrambling = false;
            } else {
                this.prepareScramble();
                this.scramble();
            }
        });
        $("#resetBtn").click(() => this.reset());
        $("#sizeBtn").click(() => $("#sizeControls").slideToggle());
        $("#input_x").change(() => this.changeSize("x"));
        $("#input_y").change(() => this.changeSize("y"));
    }

    changeSize(coord) {
        if (this.scrambling) return;
        this.size[coord] = parseInt($(`#input_${coord}`).val());
        this.emptyPos = { x: this.size.x - 1, y: this.size.y - 1 };
        this.adjustDOM();
        this.createTiles();
    }

    createTiles() {
        Tile.removeAll();
        for (let y = 0; y < this.size.y; y++) {
            for (let x = 0; x < this.size.x; x++) {
                if (x != this.emptyPos.x || y != this.emptyPos.y)
                    new Tile({
                        puzzle: this,
                        correctPos: { x, y },
                        text: 1 + x + this.size.x * y,
                    });
            }
        }
    }

    prepareScramble() {
        this.scrambling = true;
        $("#resetBtn, #sizeBtn, input").prop("disabled", true);
        $("#scrambleBtn").text("Stop");
        $("#puzzle").addClass("scrambling");
        $("#sizeControls").slideUp();
    }

    stopScramble() {
        this.scrambling = false;
        $("#resetBtn, #sizeBtn, input").prop("disabled", false);
        $("#scrambleBtn").text("Scramble");
        $("#puzzle").removeClass("scrambling");
    }

    async scramble(iterations = this.size.x * this.size.y * 10) {
        if (iterations <= 0 || !this.scrambling) {
            this.stopScramble();
            return;
        }
        const tilesAround = Tile.list.filter(
            (tile) =>
                manhattanDistance(tile.pos, this.emptyPos) == 1 &&
                tile != this.lastMovedTile
        );
        const tile = randEl(tilesAround);
        const pos = tile.pos;
        tile.moveTo(this.emptyPos);
        await sleep(50);
        this.emptyPos = pos;
        this.lastMovedTile = tile;
        this.scramble(iterations - 1);
    }

    reset() {
        for (const tile of Tile.list) {
            tile.moveTo(tile.correctPos);
        }
        this.emptyPos = { x: this.size.x - 1, y: this.size.y - 1 };
    }

    checkSolved() {
        const solved = Tile.list.every((tile) => tile.isCorrect);
        if (solved) {
            $("#solveMessage").css("opacity", 1);
            setTimeout(() => {
                $("#solveMessage").css("opacity", 0);
            }, 2500);
        }
    }
}
