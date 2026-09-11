const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

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

let width = 0;
let height = 0;

let level = 1;
let score = 0;
let coins = 0;
let lives = 3;

let playing = false;

let ball = {
    x: 0,
    y: 0,
    radius: 8,
    dx: 3,
    dy: -4
};

let paddle = {
    x: 0,
    y: 0,
    width: 90,
    height: 13,
    speed: 7
};

let bricks = [];

let animationId = null;

let touchX = null;

function resizeCanvas() {

    const ratio = window.devicePixelRatio || 1;

    width = canvas.clientWidth;
    height = canvas.clientHeight;

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );

    paddle.y =
        height - 35;

    if (!playing) {
        paddle.x =
            width / 2 -
            paddle.width / 2;
    }
}

window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();

function startGame() {

    hideScreens();

    level = 1;
    score = 0;
    coins = 0;
    lives = 3;

    createLevel();

    playing = true;

    updateHUD();

    gameLoop();
}

function createLevel() {

    bricks = [];

    const rows =
        Math.min(
            3 + Math.floor(level / 2),
            8
        );

    const columns = 6;

    const gap = 5;

    const brickWidth =
        (width - 30 - gap * (columns - 1))
        / columns;

    const brickHeight = 22;

    for (let r = 0; r < rows; r++) {

        for (let c = 0; c < columns; c++) {

            bricks.push({
                x:
                    15 +
                    c *
                    (brickWidth + gap),

                y:
                    18 +
                    r *
                    (brickHeight + gap),

                width:
                    brickWidth,

                height:
                    brickHeight,

                alive: true
            });
        }
    }

    paddle.width =
        Math.max(
            70,
            105 - level * 1.5
        );

    paddle.x =
        width / 2 -
        paddle.width / 2;

    resetBall();
}

function resetBall() {

    ball.x =
        width / 2;

    ball.y =
        height - 65;

    const speed =
        3.5 +
        level * 0.12;

    ball.dx =
        Math.random() > 0.5
            ? speed
            : -speed;

    ball.dy =
        -speed;
}

function gameLoop() {

    if (!playing) {
        return;
    }

    update();

    draw();

    animationId =
        requestAnimationFrame(
            gameLoop
        );
}

function update() {

    movePaddle();

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (
        ball.x - ball.radius <= 0 ||
        ball.x + ball.radius >= width
    ) {

        ball.dx *= -1;

        ball.x =
            Math.max(
                ball.radius,
                Math.min(
                    width - ball.radius,
                    ball.x
                )
            );
    }

    if (
        ball.y - ball.radius <= 0
    ) {

        ball.dy *= -1;
    }

    if (
        ball.y + ball.radius >=
        paddle.y &&
        ball.y - ball.radius <=
        paddle.y + paddle.height &&
        ball.x >= paddle.x &&
        ball.x <=
        paddle.x + paddle.width &&
        ball.dy > 0
    ) {

        const hit =
            (
                ball.x -
                (
                    paddle.x +
                    paddle.width / 2
                )
            ) /
            (
                paddle.width / 2
            );

        ball.dx =
            hit * 5;

        ball.dy =
            -Math.abs(ball.dy);
    }

    if (
        ball.y - ball.radius >
        height
    ) {

        loseLife();

        return;
    }

    checkBricks();
}

function movePaddle() {

    if (touchX !== null) {

        const rect =
            canvas.getBoundingClientRect();

        const x =
            touchX -
            rect.left;

        paddle.x =
            x -
            paddle.width / 2;

        touchX = null;
    }

    paddle.x =
        Math.max(
            0,
            Math.min(
                width - paddle.width,
                paddle.x
            )
        );
}

function checkBricks() {

    for (
        let i = 0;
        i < bricks.length;
        i++
    ) {

        const brick =
            bricks[i];

        if (!brick.alive) {
            continue;
        }

        if (
            ball.x + ball.radius >
                brick.x &&
            ball.x - ball.radius <
                brick.x + brick.width &&
            ball.y + ball.radius >
                brick.y &&
            ball.y - ball.radius <
                brick.y + brick.height
        ) {

            brick.alive = false;

            score += 10;

            if (
                score % 50 === 0
            ) {
                coins++;
            }

            ball.dy *= -1;

            updateHUD();

            updateProgress();

            break;
        }
    }

    const remaining =
        bricks.filter(
            brick => brick.alive
        ).length;

    if (remaining === 0) {

        completeLevel();
    }
}

function loseLife() {

    lives--;

    updateHUD();

    if (navigator.vibrate) {
        navigator.vibrate(80);
    }

    if (lives <= 0) {

        gameOver();

        return;
    }

    resetBall();
}

function updateProgress() {

    const total =
        bricks.length;

    const destroyed =
        bricks.filter(
            brick => !brick.alive
        ).length;

    const percent =
        (
            destroyed /
            total
        ) * 100;

    progressBox.style.width =
        percent + "%";
}

function completeLevel() {

    if (!playing) {
        return;
    }

    playing = false;

    cancelAnimationFrame(
        animationId
    );

    document.getElementById(
        "completedLevel"
    ).textContent =
        level;

    document.getElementById(
        "levelScore"
    ).textContent =
        score;

    levelCompleteScreen.classList.remove(
        "hidden"
    );
}

function nextLevel() {

    levelCompleteScreen.classList.add(
        "hidden"
    );

    if (
        level >= 20
    ) {

        winGame();

        return;
    }

    level++;

    if (lives < 3) {
        lives++;
    }

    progressBox.style.width =
        "0%";

    createLevel();

    updateHUD();

    playing = true;

    gameLoop();
}

function gameOver() {

    playing = false;

    cancelAnimationFrame(
        animationId
    );

    document.getElementById(
        "finalScore"
    ).textContent =
        score;

    document.getElementById(
        "finalLevel"
    ).textContent =
        level;

    gameOverScreen.classList.remove(
        "hidden"
    );
}

function winGame() {

    playing = false;

    cancelAnimationFrame(
        animationId
    );

    document.getElementById(
        "winScore"
    ).textContent =
        score;

    winScreen.classList.remove(
        "hidden"
    );
}

function draw() {

    ctx.clearRect(
        0,
        0,
        width,
        height
    );

    drawBricks();

    drawPaddle();

    drawBall();
}

function drawBricks() {

    bricks.forEach(
        brick => {

            if (!brick.alive) {
                return;
            }

            ctx.fillStyle =
                "#4f8cff";

            ctx.fillRect(
                brick.x,
                brick.y,
                brick.width,
                brick.height
            );

            ctx.strokeStyle =
                "#dbeafe";

            ctx.lineWidth = 2;

            ctx.strokeRect(
                brick.x,
                brick.y,
                brick.width,
                brick.height
            );
        }
    );
}

function drawPaddle() {

    ctx.fillStyle =
        "#fbbf24";

    ctx.beginPath();

    ctx.roundRect(
        paddle.x,
        paddle.y,
        paddle.width,
        paddle.height,
        7
    );

    ctx.fill();
}

function drawBall() {

    ctx.fillStyle =
        "#ffffff";

    ctx.beginPath();

    ctx.arc(
        ball.x,
        ball.y,
        ball.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();
}

function updateHUD() {

    scoreBox.textContent =
        score;

    coinsBox.textContent =
        coins;

    levelBox.textContent =
        level + " / 20";

    let hearts = "";

    for (
        let i = 0;
        i < 3;
        i++
    ) {

        hearts +=
            i < lives
                ? "❤️"
                : "🖤";
    }

    livesBox.textContent =
        hearts;
}

function hideScreens() {

    startScreen.classList.add(
        "hidden"
    );

    gameOverScreen.classList.add(
        "hidden"
    );

    levelCompleteScreen.classList.add(
        "hidden"
    );

    winScreen.classList.add(
        "hidden"
    );
}

function goHome() {

    playing = false;

    cancelAnimationFrame(
        animationId
    );

    hideScreens();

    startScreen.classList.remove(
        "hidden"
    );
}

canvas.addEventListener(
    "pointermove",
    event => {

        if (!playing) {
            return;
        }

        touchX = event.clientX;
    }
);

canvas.addEventListener(
    "pointerdown",
    event => {

        if (!playing) {
            return;
        }

        touchX = event.clientX;
    }
);

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "ArrowLeft"
        ) {

            paddle.x -=
                paddle.speed;
        }

        if (
            event.key === "ArrowRight"
        ) {

            paddle.x +=
                paddle.speed;
        }
    }
);

startBtn.onclick =
    startGame;

restartBtn.onclick =
    startGame;

nextLevelBtn.onclick =
    nextLevel;

homeBtn.onclick =
    goHome;

playAgainBtn.onclick =
    startGame;

winHomeBtn.onclick =
    goHome;

updateHUD();
