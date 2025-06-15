const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const playerScoreEl = document.getElementById("playerScore");
const aiScoreEl = document.getElementById("aiScore");
const gameOverEl = document.getElementById("gameOver");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_RADIUS = 8;
const WIN_SCORE = 5;

let leftPaddle, rightPaddle, ball;
let playerScore = 0, aiScore = 0;
let running = false;
let gameOver = false;

function resetGameVars() {
    leftPaddle = {
        x: 10,
        y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        color: "#4CAF50"
    };

    rightPaddle = {
        x: WIDTH - PADDLE_WIDTH - 10,
        y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        color: "#F44336"
    };

    ball = {
        x: WIDTH / 2,
        y: HEIGHT / 2,
        vx: Math.random() < 0.5 ? 4 : -4,
        vy: 2 * (Math.random() - 0.5),
        radius: BALL_RADIUS,
        color: "#FFC107"
    };
}

resetGameVars();

canvas.addEventListener("mousemove", function (e) {
    if (!running) return;
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    leftPaddle.y = mouseY - leftPaddle.height / 2;
    if (leftPaddle.y < 0) leftPaddle.y = 0;
    if (leftPaddle.y + leftPaddle.height > HEIGHT) leftPaddle.y = HEIGHT - leftPaddle.height;
});

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function drawScores() {
    playerScoreEl.textContent = "玩家: " + playerScore;
    aiScoreEl.textContent = "AI: " + aiScore;
}

function aiMove() {
    let center = rightPaddle.y + rightPaddle.height / 2;
    if (ball.y < center - 8) {
        rightPaddle.y -= 3;
    } else if (ball.y > center + 8) {
        rightPaddle.y += 3;
    }
    if (rightPaddle.y < 0) rightPaddle.y = 0;
    if (rightPaddle.y + rightPaddle.height > HEIGHT) rightPaddle.y = HEIGHT - rightPaddle.height;
}

function update() {
    if (!running || gameOver) return;

    ball.x += ball.vx;
    ball.y += ball.vy;

    // 上下墙壁碰撞
    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= HEIGHT) {
        ball.vy = -ball.vy;
    }

    // 左挡板碰撞
    if (
        ball.x - ball.radius <= leftPaddle.x + leftPaddle.width &&
        ball.y + ball.radius >= leftPaddle.y &&
        ball.y - ball.radius <= leftPaddle.y + leftPaddle.height
    ) {
        ball.x = leftPaddle.x + leftPaddle.width + ball.radius;
        ball.vx = -ball.vx;
        let collidePoint = (ball.y - (leftPaddle.y + leftPaddle.height / 2)) / (leftPaddle.height / 2);
        ball.vy = 5 * collidePoint;
    }

    // 右挡板碰撞
    if (
        ball.x + ball.radius >= rightPaddle.x &&
        ball.y + ball.radius >= rightPaddle.y &&
        ball.y - ball.radius <= rightPaddle.y + rightPaddle.height
    ) {
        ball.x = rightPaddle.x - ball.radius;
        ball.vx = -ball.vx;
        let collidePoint = (ball.y - (rightPaddle.y + rightPaddle.height / 2)) / (rightPaddle.height / 2);
        ball.vy = 5 * collidePoint;
    }

    // 球超出左右边界，记分与重置
    if (ball.x - ball.radius < 0) {
        aiScore++;
        checkWin();
        resetGameVars();
        running = !gameOver;
    }
    if (ball.x + ball.radius > WIDTH) {
        playerScore++;
        checkWin();
        resetGameVars();
        running = !gameOver;
    }

    aiMove();
    drawScores();
}

function checkWin() {
    if (playerScore >= WIN_SCORE) {
        showGameOver("🎉 恭喜你获胜！");
    } else if (aiScore >= WIN_SCORE) {
        showGameOver("😵 AI 获胜，继续加油！");
    }
}

function showGameOver(msg) {
    gameOver = true;
    running = false;
    gameOverEl.textContent = msg;
    gameOverEl.classList.remove("hidden");
}

function resetAll() {
    playerScore = 0;
    aiScore = 0;
    resetGameVars();
    drawScores();
    running = false;
    gameOver = false;
    gameOverEl.classList.add("hidden");
}

function render() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // 画中线
    ctx.strokeStyle = "#888";
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(WIDTH / 2, HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    drawRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height, leftPaddle.color);
    drawRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height, rightPaddle.color);
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

startBtn.onclick = function () {
    if (!gameOver) running = true;
};

resetBtn.onclick = function () {
    resetAll();
};

drawScores();
gameLoop();