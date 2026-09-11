const game = document.getElementById("game");
const bird = document.getElementById("bird");

const livesBox = document.getElementById("lives");
const scoreBox = document.getElementById("score");
const coinsBox = document.getElementById("coins");
const levelBox = document.getElementById("level");
const progressBox = document.getElementById("progress");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOver");
const levelCompleteScreen = document.getElementById("levelComplete");
const winScreen = document.getElementById("winScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const nextLevelBtn = document.getElementById("nextLevelBtn");
const homeBtn = document.getElementById("homeBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const winHomeBtn = document.getElementById("winHomeBtn");

const TOTAL_LEVELS = 20;
const LEVEL_POINTS = 100;

let level = 1;
let score = 0;
let coins = 0;
let lives = 3;

let birdY = 0;
let birdVelocity = 0;

let playing = false;
let lastTime = 0;
let spawnTimer = 0;

let obstacles = [];

const gravity = 0.00175;
const flapPower = -0.58;

function startGame() {
    hideScreens();

    level = 1;
    score = 0;
    coins = 0;
    lives = 3;

    clearObstacles();

    birdY = window.innerHeight * 0.48;
    birdVelocity = 0;
    spawnTimer = 0;

    updateBird();
    updateHUD();

    playing = true;
    lastTime = performance.now();

    requestAnimationFrame(gameLoop);
}

function gameLoop(time) {
    if (!playing) {
        return;
    }

    let delta = time - lastTime;

    lastTime = time;

    delta = Math.min(delta, 35);

    birdVelocity += gravity * delta;
    birdY += birdVelocity * delta;

    updateBird();

    spawnTimer += delta;

    const spawnDelay = Math.max(
        850,
        1450 - level * 25
    );

    if (spawnTimer >= spawnDelay) {
        createObstacle();
        spawnTimer = 0;
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        const item = obstacles[i];

        item.x -= item.speed * delta;

        item.top.style.left = item.x + "px";
        item.bottom.style.left = item.x + "px";
        item.coin.style.left = item.x + 13 + "px";

        if (checkCollision(item)) {
            removeObstacle(i);
            loseLife();
            continue;
        }

        if (
            !item.passed &&
            item.x + 68 < window.innerWidth * 0.23
        ) {
            item.passed = true;
            score += 10;

            if (score % 30 === 0) {
                coins++;
            }

            updateHUD();
            updateProgress();
        }

        if (item.x < -100) {
            removeObstacle(i);
        }
    }

    if (
        birdY < 65 ||
        birdY > window.innerHeight - 75
    ) {
        loseLife();
    }

    requestAnimationFrame(gameLoop);
}

function updateBird() {
    bird.style.top = birdY + "px";
}

function flap() {
    if (!playing) {
        return;
    }

    birdVelocity = flapPower;
}

function createObstacle() {
    const height = window.innerHeight;

    const gap = Math.max(
        125,
        205 - level * 3
    );

    const minHeight = 95;

    const maxHeight = Math.max(
        minHeight + 10,
        height - gap - 150
    );

    const topHeight =
        Math.random() *
        (maxHeight - minHeight) +
        minHeight;

    const bottomHeight =
        height - topHeight - gap;

    const top = document.createElement("div");
    const bottom = document.createElement("div");
    const coin = document.createElement("div");

    top.className = "pipe pipeTop";
    bottom.className = "pipe pipeBottom";
    coin.className = "coin";

    coin.textContent = "🪙";

    top.style.height = topHeight + "px";
    bottom.style.height = bottomHeight + "px";

    const startX = window.innerWidth + 20;

    top.style.left = startX + "px";
    bottom.style.left = startX + "px";

    coin.style.left = startX + 13 + "px";

    coin.style.top =
        topHeight + gap / 2 - 21 + "px";

    game.appendChild(top);
    game.appendChild(bottom);
    game.appendChild(coin);

    obstacles.push({
        x: startX,
        speed: 0.19 + level * 0.013,
        top: top,
        bottom: bottom,
        coin: coin,
        passed: false
    });
}

function checkCollision(item) {
    const birdRect =
        bird.getBoundingClientRect();

    const topRect =
        item.top.getBoundingClientRect();

    const bottomRect =
        item.bottom.getBoundingClientRect();

    return (
        overlap(birdRect, topRect) ||
        overlap(birdRect, bottomRect)
    );
}

function overlap(a, b) {
    return (
        a.left < b.right &&
        a.right > b.left &&
        a.top < b.bottom &&
        a.bottom > b.top
    );
}

function loseLife() {
    if (!playing) {
        return;
    }

    playerHit();

    lives--;

    updateHUD();

    if (navigator.vibrate) {
        navigator.vibrate(70);
    }

    if (lives <= 0) {
        gameOver();
        return;
    }

    birdY = window.innerHeight * 0.48;
    birdVelocity = 0;

    updateBird();
}

function playerHit() {
    bird.style.transform = "scale(0.8)";

    setTimeout(() => {
        bird.style.transform = "scale(1)";
    }, 120);
}

function updateProgress() {
    const levelStart =
        (level - 1) * LEVEL_POINTS;

    const current =
        score - levelStart;

    const percent =
        Math.min(100, current);

    progressBox.style.width =
        percent + "%";

    if (current >= LEVEL_POINTS) {
        completeLevel();
    }
}

function completeLevel() {
    playing = false;

    clearObstacles();

    document.getElementById(
        "completedLevel"
    ).textContent = level;

    document.getElementById(
        "levelScore"
    ).textContent = score;

    levelCompleteScreen.classList.remove(
        "hidden"
    );
}

function nextLevel() {
    levelCompleteScreen.classList.add(
        "hidden"
    );

    if (level >= TOTAL_LEVELS) {
        winGame();
        return;
    }

    level++;

    if (lives < 3) {
        lives++;
    }

    clearObstacles();

    birdY = window.innerHeight * 0.48;
    birdVelocity = 0;
    spawnTimer = 0;

    progressBox.style.width = "0%";

    updateBird();
    updateHUD();

    playing = true;
    lastTime = performance.now();

    requestAnimationFrame(gameLoop);
}

function gameOver() {
    playing = false;

    clearObstacles();

    document.getElementById(
        "finalScore"
    ).textContent = score;

    document.getElementById(
        "finalLevel"
    ).textContent = level;

    gameOverScreen.classList.remove(
        "hidden"
    );
}

function winGame() {
    playing = false;

    clearObstacles();

    document.getElementById(
        "winScore"
    ).textContent = score;

    winScreen.classList.remove(
        "hidden"
    );
}

function removeObstacle(index) {
    const item = obstacles[index];

    if (!item) {
        return;
    }

    item.top.remove();
    item.bottom.remove();
    item.coin.remove();

    obstacles.splice(index, 1);
}

function clearObstacles() {
    obstacles.forEach(item => {
        item.top.remove();
        item.bottom.remove();
        item.coin.remove();
    });

    obstacles = [];
}

function updateHUD() {
    scoreBox.textContent = score;
    coinsBox.textContent = coins;

    levelBox.textContent =
        level + " / " + TOTAL_LEVELS;

    let hearts = "";

    for (let i = 0; i < 3; i++) {
        hearts +=
            i < lives ? "❤️" : "🖤";
    }

    livesBox.textContent = hearts;
}

function hideScreens() {
    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    levelCompleteScreen.classList.add("hidden");
    winScreen.classList.add("hidden");
}

function goHome() {
    playing = false;

    clearObstacles();

    hideScreens();

    startScreen.classList.remove(
        "hidden"
    );
}

game.addEventListener(
    "pointerdown",
    event => {
        if (event.target.tagName === "BUTTON") {
            return;
        }

        flap();
    }
);

document.addEventListener(
    "keydown",
    event => {
        if (
            event.code === "Space" ||
            event.code === "ArrowUp"
        ) {
            event.preventDefault();
            flap();
        }
    }
);

document.addEventListener(
    "touchmove",
    event => {
        if (playing) {
            event.preventDefault();
        }
    },
    {
        passive: false
    }
);

startBtn.onclick = startGame;
restartBtn.onclick = startGame;
nextLevelBtn.onclick = nextLevel;
homeBtn.onclick = goHome;
playAgainBtn.onclick = startGame;
winHomeBtn.onclick = goHome;

birdY = window.innerHeight * 0.48;

updateBird();
updateHUD();
