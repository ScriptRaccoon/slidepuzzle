export class Timer {
    constructor() {
        this.counter = 0;
        this.interval = null;
    }

    getScore() {
        return this.counter / 10;
    }

    reset() {
        clearInterval(this.interval);
        $("#timer").css("opacity", 0);
        this.counter = 0;
    }

    start() {
        this.counter = 0;
        $("#timer").css("opacity", 1).text(0);
        this.interval = setInterval(() => {
            this.counter++;
            $("#timer").text((this.counter / 10).toFixed(1));
        }, 100);
    }
}
