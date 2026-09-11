const game = document.getElementById("game");
const road = document.getElementById("road");
const player = document.getElementById("player");

const livesBox = document.getElementById("lives");
const scoreBox = document.getElementById("score");
const coinsBox = document.getElementById("coins");
const levelBox = document.getElementById("level");
const progressBox = document.getElementById("progress");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOver");
const levelCompleteScreen = document.getElementById("levelComplete");
const winScreen = document.getElementById("winScreen");

const TOTAL_LEVELS = 20;
const LEVEL_SCORE = 100;

let level = 1;
let score = 0;
let coins = 0;
let lives = 3;

let playing = false;

let playerX = 0;

let enemies = [];

let spawnTimer = 0;
let coinTimer = 0;

let lastTime = 0;

let roadSpeed = 0.25;

let leftPressed = false;
let rightPressed = false;


function startGame() {

    hideScreens();

    level = 1;
    score = 0;
    coins = 0;
    lives = 3;

    clearObjects();

    playerX = 50;

    player.style.left = playerX + "%";

    spawnTimer = 0;
    coinTimer = 0;

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


    movePlayer(delta);

    moveRoad(delta);

    spawnTimer += delta;

    coinTimer += delta;


    const enemyDelay = Math.max(
        650,
        1200 - level * 28
    );


    if (spawnTimer >= enemyDelay) {

        createEnemy();

        spawnTimer = 0;
    }


    if (coinTimer >= 1700) {

        createCoin();

        coinTimer = 0;
    }


    for (
        let i = enemies.length - 1;
        i >= 0;
        i--
    ) {

        const object = enemies[i];

        object.y +=
            object.speed * delta;

        object.element.style.top =
            object.y + "px";


        if (
            object.type === "coin"
        ) {

            object.element.style.transform =
                "rotate(" +
                object.y * 2 +
                "deg)";
        }


        if (
            checkPlayerCollision(
                object
            )
        ) {

            if (
                object.type === "coin"
            ) {

                coins++;

                score += 5;

                updateHUD();

                removeObject(i);

                continue;

            } else {

                removeObject(i);

                loseLife();

                continue;
            }
        }


        if (
            !object.counted &&
            object.y > road.clientHeight
        ) {

            object.counted = true;

            if (
                object.type === "enemy"
            ) {

                score += 10;

                updateHUD();

                checkLevel();
            }

            removeObject(i);
        }
    }


    requestAnimationFrame(gameLoop);
}


function movePlayer(delta) {

    let movement = 0;

    if (leftPressed) {
        movement -= 0.22 * delta;
    }

    if (rightPressed) {
        movement += 0.22 * delta;
    }

    playerX += movement;

    playerX = Math.max(
        9,
        Math.min(91, playerX)
    );

    player.style.left =
        playerX + "%";
}


function moveRoad(delta) {

    const amount =
        roadSpeed *
        delta;

    document.querySelectorAll(
        ".roadLine"
    ).forEach(line => {

        let current =
            parseFloat(
                line.style.top ||
                getComputedStyle(line).top
            );

        current += amount;

        if (current > road.clientHeight) {
            current = -90;
        }

        line.style.top =
            current + "px";
    });
}


function createEnemy() {

    const enemy =
        document.createElement("div");

    enemy.className = "enemy";

    const cars = [
        "🚙",
        "🚕",
        "🚓",
        "🚐"
    ];

    enemy.textContent =
        cars[
            Math.floor(
                Math.random() *
                cars.length
            )
        ];


    const lane =
        Math.floor(
            Math.random() * 3
        );


    enemy.style.left =
        (16 + lane * 34) + "%";


    enemy.style.top =
        "-90px";


    road.appendChild(enemy);


    enemies.push({

        element: enemy,

        y: -90,

        type: "enemy",

        speed:
            roadSpeed +
            0.12 +
            level * 0.012,

        counted: false
    });
}


function createCoin() {

    const coin =
        document.createElement("div");

    coin.className = "coin";

    coin.textContent = "🪙";


    const lane =
        Math.floor(
            Math.random() * 3
        );


    coin.style.left =
        (17 + lane * 34) + "%";


    coin.style.top =
        "-60px";


    road.appendChild(coin);


    enemies.push({

        element: coin,

        y: -60,

        type: "coin",

        speed:
            roadSpeed +
            0.08,

        counted: false
    });
}


function checkPlayerCollision(object) {

    const a =
        player.getBoundingClientRect();

    const b =
        object.element.getBoundingClientRect();


    return (
        a.left + 8 < b.right - 8 &&
        a.right - 8 > b.left + 8 &&
        a.top + 8 < b.bottom - 8 &&
        a.bottom - 8 > b.top + 8
    );
}


function loseLife() {

    if (!playing) {
        return;
    }

    lives--;

    updateHUD();

    player.style.transform =
        "translateX(-50%) scale(0.8)";

    setTimeout(() => {

        player.style.transform =
            "translateX(-50%) scale(1)";

    }, 150);


    if (navigator.vibrate) {
        navigator.vibrate(80);
    }


    if (lives <= 0) {

        gameOver();

        return;
    }
}


function checkLevel() {

    const start =
        (level - 1) *
        LEVEL_SCORE;

    const current =
        score - start;


    const percent =
        Math.min(
            100,
            current
        );


    progressBox.style.width =
        percent + "%";


    if (
        current >= LEVEL_SCORE
    ) {

        completeLevel();
    }
}


function completeLevel() {

    playing = false;

    clearObjects();

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


    clearObjects();

    playerX = 50;

    player.style.left =
        playerX + "%";


    spawnTimer = 0;
    coinTimer = 0;


    progressBox.style.width =
        "0%";


    updateHUD();


    playing = true;

    lastTime =
        performance.now();

    requestAnimationFrame(gameLoop);
}


function gameOver() {

    playing = false;

    clearObjects();

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

    clearObjects();

    document.getElementById(
        "winScore"
    ).textContent = score;

    winScreen.classList.remove(
        "hidden"
    );
}


function removeObject(index) {

    const object =
        enemies[index];

    if (!object) {
        return;
    }

    object.element.remove();

    enemies.splice(index, 1);
}


function clearObjects() {

    enemies.forEach(object => {
        object.element.remove();
    });

    enemies = [];
}


function updateHUD() {

    scoreBox.textContent =
        score;

    coinsBox.textContent =
        coins;

    levelBox.textContent =
        level +
        " / " +
        TOTAL_LEVELS;


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

    clearObjects();

    hideScreens();

    startScreen.classList.remove(
        "hidden"
    );
}


game.addEventListener(
    "pointerdown",
    event => {

        if (
            event.target.tagName ===
            "BUTTON"
        ) {
            return;
        }

        const rect =
            road.getBoundingClientRect();

        const x =
            event.clientX -
            rect.left;

        if (
            x < rect.width / 2
        ) {

            playerX -= 8;

        } else {

            playerX += 8;
        }


        playerX = Math.max(
            9,
            Math.min(91, playerX)
        );


        player.style.left =
            playerX + "%";
    }
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "ArrowLeft"
        ) {
            leftPressed = true;
        }

        if (
            event.key === "ArrowRight"
        ) {
            rightPressed = true;
        }
    }
);


document.addEventListener(
    "keyup",
    event => {

        if (
            event.key === "ArrowLeft"
        ) {
            leftPressed = false;
        }

        if (
            event.key === "ArrowRight"
        ) {
            rightPressed = false;
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
