import { Tile } from "./Tile.js";
import { manhattanDistance, randEl, sleep } from "./utils.js";

const scrambleSpeed = 25;

export class Puzzle {
    constructor({ size }) {
        this.size = size;
        this.emptyPos = { x: this.size.x - 1, y: this.size.y - 1 };
        this.scrambling = false;
        this.adjustDOM();
        this.enableMenu();
        this.createTiles();
        this.lastMovedTile = null;
        this.challenge = false;
        this.timer = 0;
        this.score = 0;
    }

    adjustDOM() {
        $("#puzzle")
            .css("--size_x", this.size.x)
            .css("--size_y", this.size.y);
        const title = `${this.size.x}×${this.size.y} Puzzle`;
        $("h1").html(title);
        document.title = title;
        $("#input_x").val(this.size.x);
        $("#input_y").val(this.size.y);
    }

    enableMenu() {
        $("#scrambleBtn").click(() => {
            if (this.challenge) return;
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
        $("#challengeBtn").click(() => {
            this.startChallenge();
        });
        $("#restartBtn").click(() => {
            $("#solveDisplay").css("opacity", 0);
            setTimeout(() => {
                $("#solveDisplay").css("visibility", "hidden");
            }, 200);
        });
    }

    changeSize(coord) {
        if (this.scrambling || this.challenge) return;
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
        $("#resetBtn, #sizeBtn, #challengeBtn, input").prop(
            "disabled",
            true
        );
        $("#scrambleBtn").text("Stop");
        $("#puzzle").addClass("scrambling");
        $("#sizeControls").slideUp();
    }

    stopScramble() {
        this.scrambling = false;
        if (!this.challenge)
            $("#resetBtn, #sizeBtn, #challengeBtn, input").prop(
                "disabled",
                false
            );
        $("#scrambleBtn").text("Scramble");
        $("#puzzle").removeClass("scrambling");
    }

    async scramble(wait = 25) {
        while (this.scrambling) {
            const tilesAround = Tile.list.filter(
                (tile) =>
                    manhattanDistance(tile.pos, this.emptyPos) == 1 &&
                    tile != this.lastMovedTile
            );
            const tile = randEl(tilesAround);
            const pos = tile.pos;
            tile.moveTo(this.emptyPos);
            if (wait > 0) await sleep(wait);
            this.emptyPos = pos;
            this.lastMovedTile = tile;
        }
        this.stopScramble();
    }

    reset() {
        for (const tile of Tile.list) {
            tile.moveTo(tile.correctPos);
        }
        this.emptyPos = { x: this.size.x - 1, y: this.size.y - 1 };
        if (this.challenge) {
            clearInterval(this.timerInterval);
            this.challenge = false;
            $("#timer").css("opacity", 0);
            this.timer = 0;
            $("button, input").prop("disabled", false);
        }
    }

    checkSolved() {
        const solved = Tile.list.every((tile) => tile.isCorrect);
        if (solved) {
            $("#solveDisplay")
                .css("visibility", "visible")
                .css("opacity", 1);
            if (this.challenge) {
                $("#scoreMessage").show();
                $("#solveMessage").hide();
                $("button, input").prop("disabled", false);
            } else {
                $("#scoreMessage").hide();
                $("#solveMessage").show();
            }
            this.stopChallenge();
        }
    }

    startChallenge() {
        if (this.challenge) return;
        this.challenge = true;
        this.timer = 0;
        $("#timer").css("opacity", 1).text(this.timer);
        $("#scrambleBtn, #sizeBtn, #challengeBtn").prop(
            "disabled",
            true
        );
        this.prepareScramble();
        this.scramble(1);
        setTimeout(() => {
            this.scrambling = false;
            this.timerInterval = setInterval(() => {
                this.timer++;
                $("#timer").text((this.timer / 10).toFixed(1));
            }, 100);
            $("#resetBtn").prop("disabled", false);
        }, this.size.x * this.size.y * 500);
    }

    stopChallenge() {
        if (!this.challenge) return;
        clearInterval(this.timerInterval);
        this.score = this.timer / 10;
        const highScore = this.getHighScore();
        $("#scoreMessage").html(
            `${this.size.x}×${
                this.size.y
            }-Score: ${this.score.toFixed(
                1
            )}<br>Best: ${highScore.toFixed(1)}`
        );
        this.saveHighScore(highScore);
        this.challenge = false;
        $("#timer").css("opacity", 0);
        this.timer = 0;
    }

    getHighScore() {
        const sizeString = JSON.stringify(this.size);
        let previousScore = localStorage.getItem(sizeString);
        if (previousScore) {
            previousScore = parseInt(previousScore);
            return Math.min(this.score, previousScore);
        } else {
            return this.score;
        }
    }

    saveHighScore(highScore) {
        if (highScore == 0) return;
        const sizeString = JSON.stringify(this.size);
        localStorage.setItem(sizeString, highScore);
    }
}
