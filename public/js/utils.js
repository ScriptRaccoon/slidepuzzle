function randInt(a, b) {
    return a + Math.floor(Math.random() * (b - a));
}

export function randEl(list) {
    return list[randInt(0, list.length)];
}

export function manhattanDistance(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export async function sleep(duration) {
    return new Promise((res) => setTimeout(res, duration));
}
