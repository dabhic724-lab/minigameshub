/* ==================================
   FRUIT CATCH
   GAME 1
================================== */


/* =========================
   ELEMENTS
========================= */

const game = document.getElementById("game");

const basket = document.getElementById("basket");

const livesText = document.getElementById("lives");
const scoreText = document.getElementById("score");
const coinsText = document.getElementById("coins");
const levelText = document.getElementById("level");

const progress = document.getElementById("progress");

const startScreen =
    document.getElementById("startScreen");

const gameOverScreen =
    document.getElementById("gameOver");

const levelCompleteScreen =
    document.getElementById("levelComplete");

const winScreen =
    document.getElementById("winScreen");


/* =========================
   BUTTONS
========================= */

document.getElementById("startBtn")
    .addEventListener("click", startGame);

document.getElementById("restartBtn")
    .addEventListener("click", restartGame);

document.getElementById("nextLevelBtn")
    .addEventListener("click", nextLevel);

document.getElementById("homeBtn")
    .addEventListener("click", showHome);

document.getElementById("playAgainBtn")
    .addEventListener("click", restartGame);

document.getElementById("winHomeBtn")
    .addEventListener("click", showHome);


/* =========================
   VARIABLES
========================= */

let score = 0;

let coins = 0;

let lives = 3;

let level = 1;

const MAX_LEVEL = 20;

let levelStartScore = 0;

let fruits = [];

let running = false;

let lastTime = 0;

let spawnTimer = 0;


/* =========================
   FRUITS
========================= */

const fruitList = [
    "🍎",
    "🍊",
    "🍓",
    "🍇",
    "🍉",
    "🍒",
    "🍋"
];


/* =========================
   START GAME
========================= */

function startGame() {

    startScreen.classList.add("hidden");

    resetGame();

    running = true;

    lastTime = performance.now();

    requestAnimationFrame(gameLoop);
}


/* =========================
   RESET GAME
========================= */

function resetGame() {

    score = 0;

    coins = 0;

    lives = 3;

    level = 1;

    levelStartScore = 0;

    spawnTimer = 0;

    removeAllFruits();

    basket.style.left = "50%";

    basket.style.transform =
        "translateX(-50%)";

    updateUI();
}


/* =========================
   RESTART
========================= */

function restartGame() {

    gameOverScreen.classList.add("hidden");

    winScreen.classList.add("hidden");

    levelCompleteScreen.classList.add("hidden");

    resetGame();

    running = true;

    lastTime = performance.now();

    requestAnimationFrame(gameLoop);
}


/* =========================
   GAME LOOP
========================= */

function gameLoop(time) {

    if (!running) {
        return;
    }

    const delta =
        time - lastTime;

    lastTime = time;

    spawnTimer += delta;


    /* =========================
       SPAWN SPEED
    ========================= */

    const spawnRate =
        Math.max(
            280,
            850 - level * 25
        );


    if (spawnTimer >= spawnRate) {

        spawnFruit();

        spawnTimer = 0;
    }


    /* =========================
       MOVE FRUITS
    ========================= */

    for (
        let i = fruits.length - 1;
        i >= 0;
        i--
    ) {

        const fruit = fruits[i];

        fruit.y +=
            fruit.speed * delta;

        fruit.element.style.top =
            fruit.y + "px";


        /* CATCH */

        if (checkCollision(fruit)) {

            catchFruit(i);

            continue;
        }


        /* MISSED */

        if (
            fruit.y >
            window.innerHeight + 70
        ) {

            missFruit(i);
        }
    }


    requestAnimationFrame(gameLoop);
}


/* =========================
   CREATE FRUIT
========================= */

function spawnFruit() {

    const element =
        document.createElement("div");

    element.className = "fruit";

    element.textContent =
        fruitList[
            Math.floor(
                Math.random() *
                fruitList.length
            )
        ];


    const x =
        Math.random() *
        (window.innerWidth - 50);


    element.style.left =
        x + "px";

    element.style.top =
        "-60px";


    game.appendChild(element);


    /* =========================
       DIFFICULTY
    ========================= */

    const speed =
        0.20 +
        level * 0.025 +
        Math.random() * 0.12;


    fruits.push({

        element: element,

        x: x,

        y: -60,

        speed: speed
    });
}


/* =========================
   COLLISION
========================= */

function checkCollision(fruit) {

    const basketRect =
        basket.getBoundingClientRect();

    const fruitRect =
        fruit.element.getBoundingClientRect();


    return !(
        fruitRect.right <
        basketRect.left ||

        fruitRect.left >
        basketRect.right ||

        fruitRect.bottom <
        basketRect.top ||

        fruitRect.top >
        basketRect.bottom
    );
}


/* =========================
   CATCH FRUIT
========================= */

function catchFruit(index) {

    const fruit =
        fruits[index];


    fruit.element.remove();

    fruits.splice(index, 1);


    score += 10;


    /* =========================
       COIN
    ========================= */

    if (score % 30 === 0) {

        coins++;
    }


    updateUI();

    checkLevel();
}


/* =========================
   MISS FRUIT
========================= */

function missFruit(index) {

    const fruit =
        fruits[index];


    fruit.element.remove();

    fruits.splice(index, 1);


    lives--;

    updateUI();


    if (lives <= 0) {

        gameOver();
    }
}


/* =========================
   CHECK LEVEL
========================= */

function checkLevel() {

    const currentLevelScore =
        score - levelStartScore;


    const percentage =
        Math.min(
            100,
            currentLevelScore
        );


    progress.style.width =
        percentage + "%";


    /* 100 POINTS = LEVEL */

    if (
        currentLevelScore >= 100
    ) {

        running = false;

        levelStartScore = score;


        document.getElementById(
            "completedLevel"
        ).textContent = level;


        document.getElementById(
            "levelScore"
        ).textContent = score;


        levelCompleteScreen
            .classList
            .remove("hidden");
    }
}


/* =========================
   NEXT LEVEL
========================= */

function nextLevel() {

    levelCompleteScreen
        .classList
        .add("hidden");


    /* LAST LEVEL */

    if (level >= MAX_LEVEL) {

        winGame();

        return;
    }


    level++;


    /* BONUS LIFE */

    if (lives < 3) {

        lives++;
    }


    removeAllFruits();


    progress.style.width =
        "0%";


    updateUI();


    running = true;

    lastTime = performance.now();

    requestAnimationFrame(gameLoop);
}


/* =========================
   GAME OVER
========================= */

function gameOver() {

    running = false;


    document.getElementById(
        "finalScore"
    ).textContent = score;


    document.getElementById(
        "finalLevel"
    ).textContent = level;


    gameOverScreen
        .classList
        .remove("hidden");
}


/* =========================
   WIN
========================= */

function winGame() {

    running = false;


    document.getElementById(
        "winScore"
    ).textContent = score;


    winScreen
        .classList
        .remove("hidden");
}


/* =========================
   HOME
========================= */

function showHome() {

    running = false;

    removeAllFruits();


    gameOverScreen
        .classList
        .add("hidden");

    levelCompleteScreen
        .classList
        .add("hidden");

    winScreen
        .classList
        .add("hidden");


    startScreen
        .classList
        .remove("hidden");
}


/* =========================
   REMOVE FRUITS
========================= */

function removeAllFruits() {

    fruits.forEach(
        fruit => {
            fruit.element.remove();
        }
    );

    fruits = [];
}


/* =========================
   UPDATE UI
========================= */

function updateUI() {

    scoreText.textContent =
        score;

    coinsText.textContent =
        coins;

    levelText.textContent =
        level + " / " + MAX_LEVEL;


    let hearts = "";


    for (
        let i = 0;
        i < 3;
        i++
    ) {

        if (i < lives) {

            hearts += "❤️";

        } else {

            hearts += "🖤";
        }
    }


    livesText.textContent =
        hearts;
}


/* =========================
   TOUCH CONTROL
========================= */

let dragging = false;


game.addEventListener(
    "touchstart",
    function(event) {

        dragging = true;

        moveBasket(
            event.touches[0].clientX
        );
    },
    {
        passive: false
    }
);


game.addEventListener(
    "touchmove",
    function(event) {

        if (!dragging) {
            return;
        }

        event.preventDefault();

        moveBasket(
            event.touches[0].clientX
        );
    },
    {
        passive: false
    }
);


game.addEventListener(
    "touchend",
    function() {

        dragging = false;
    }
);


/* =========================
   MOUSE CONTROL
========================= */

game.addEventListener(
    "mousemove",
    function(event) {

        if (event.buttons === 1) {

            moveBasket(
                event.clientX
            );
        }
    }
);


/* =========================
   MOVE BASKET
========================= */

function moveBasket(x) {

    const basketWidth =
        basket.offsetWidth;


    let newX =
        x - basketWidth / 2;


    newX =
        Math.max(
            0,
            Math.min(
                window.innerWidth -
                basketWidth,
                newX
            )
        );


    basket.style.left =
        newX + "px";


    basket.style.transform =
        "none";
}


/* =========================
   INITIALIZE
========================= */

updateUI();
