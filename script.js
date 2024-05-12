var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight-110;

var paused = false;
var lostlife = false;
var gameover = false;
var wongame = false;
var pressedStart = false;
var pressedRestart = false;
var muted = false;
var intvl;

var textColor = "#002769";

/* ball */
var ballRadius = 10;
var x = randomBallPosition(ballRadius, canvas.width-ballRadius)
var y = canvas.height-40;

var randomDirection = [2, -2]

var dx = randomBallDirection(randomDirection);
var dy = -2;

var bcolor =  "#002769";

/* paddle */
var paddleHeight = 12;
var paddleWidth = 100;
var paddleX = (canvas.width-paddleWidth) / 2;

var rightPressed = false;
var leftPressed = false

/* bricks */
var brickRowCount = 8;
var brickColumnCount = 10;
var totalBricks = brickRowCount * brickColumnCount;
var brickWidth = 70;
var brickHeight = 20;
var brickPadding = 10;
var brickOffsetTop = 50;
var allBricksWidth =  brickColumnCount * brickWidth;
var allBricksPadding = brickColumnCount * brickPadding;
var brickOffsetLeft = canvas.width/2 - allBricksWidth/2 - allBricksPadding/2;

// add bricks in array (not drawn yet)
var bricks = [];
for(var c=0; c<brickColumnCount; c++) {
    bricks[c] = [];
    for(var r=0; r<brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

/* score */
var score = 0;

/* lives */
var lives = 3;

// randomize ball position
function randomBallPosition(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

// randomize ball direction
function randomBallDirection(items) {
    return items[Math.floor(Math.random()*items.length)];
}

// draw Start button
function drawStartBtn(){
    ctx.beginPath();
    // inside
    ctx.fillStyle = "grey";
    ctx.fillRect(canvas.width/2-(200/2), canvas.height/2, 200, 75);
    // border
    ctx.strokeStyle = "black";
    ctx.strokeRect(canvas.width/2-(200/2), canvas.height/2, 200, 75);
    // Start
    ctx.fillStyle = "#f0e118";
    ctx.font = "28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Mulai", canvas.width/2, canvas.height/2 + (75/2) + 10);
}

// draw Restart button
function drawRestartBtn(){
    ctx.beginPath();
    ctx.fillStyle = "grey";
    ctx.fillRect(canvas.width/2-(200/2), canvas.height/2, 200, 75);
    ctx.strokeStyle = "black";
    ctx.strokeRect(canvas.width/2-(200/2), canvas.height/2, 200, 75);
    ctx.fillStyle = "#f0e118";
    ctx.font = "28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Mulai Kembali", canvas.width/2, canvas.height/2 + (75/2) + 10);
}

// draw ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = bcolor;
    ctx.fill();
    ctx.closePath();
}

// draw paddle
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height-paddleHeight-10, paddleWidth, paddleHeight);
    ctx.fillStyle = "#62b300";
    ctx.fill();
    ctx.closePath();
}

// draw bricks
function drawBricks() {
    for(var c=0; c<brickColumnCount; c++) {
        for(var r=0; r<brickRowCount; r++) {
            if(bricks[c][r].status == 1) {
                var brickX = (c*(brickWidth+brickPadding))+brickOffsetLeft;
                var brickY = (r*(brickHeight+brickPadding))+brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#62b300";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// main function to draw everything and run the game
function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBall();
    drawPaddle();
    drawBricks();
    collisionDetection();
    drawScore();
    drawLives();

    if (!pressedStart){
        drawStartBtn();
        drawVolume();
    }

    // bound ball when hit left or right of canvas
    if(x + dx > canvas.width-ballRadius || x + dx < ballRadius) {
        dx = -dx;
        playBoundsHit();
    }
    // bound ball when hit top of canvas
    if(y + dy < ballRadius) {
        dy = -dy;
        playBoundsHit();
    }
    // stop game if ball hits bottom
    else if (y + dy > canvas.height-ballRadius-(paddleHeight/2)-10) {
        // if ball hits paddle
        if (x > paddleX && x < paddleX + paddleWidth){

            playPaddleHit();

            dy = -dy;

            // make the ball faster
            dx += 0.2;
            dy -= 0.2;

        }
        else {
            lives--;
            playLostLife();
            // draw Game Over screen if all lives are lost
            if (!lives){
                playGameOver();
                gameover = true;
                pressedStart = false;
                showGameOver();
            }
            // if lost a life, show Lost Life screen
            else {
                paused = true;
                lostlife = true;
                var num = 3;
                intvl = setInterval(function int(){
                    counter(num--);
                    return int
                }(),1000);
                x = randomBallPosition(ballRadius, canvas.width-ballRadius)
                y = canvas.height-30;
                dx = randomBallDirection(randomDirection);
                dy = -2;
                paddleX = (canvas.width-paddleWidth)/2;
            }
            
        }
    }

    x += dx;
    y += dy;

    // move paddle right
    if(rightPressed) {
        paddleX += 7;
        // prevent paddle from going outside canvas
        if (paddleX + paddleWidth > canvas.width){
            paddleX = canvas.width - paddleWidth;
        }
    }
    // move paddle left
    else if(leftPressed) {
        paddleX -= 7;
        // prevent paddle from going outside canvas
        if (paddleX < 0){
            paddleX = 0;
        }
    }

    if (gameover){
        return;
    }

    if (wongame){
        return;
    }

    if(!paused) {
        if (pressedStart){
            requestAnimationFrame(draw);
        }
    }
    else {
        if (!lostlife){
            if (pressedStart){
                drawVolume();
                drawPause();
            }
        }
    }
    
}

// countdown when lose life
function counter(num) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    showLostLive();
    ctx.font="40px Comic Sans MS";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText("Lanjut dalam: "+num, canvas.width/2, canvas.height/2+80);
    if(num == 0){
        clearInterval(intvl);
        paused = false;
        lostlife = false;
        draw();
    }
}

// show Lost Life text
function showLostLive(){
    ctx.beginPath();
    ctx.font = "24px Georgia";
    ctx.fillStyle = "grey";
    ctx.textAlign = "center";
    ctx.fillText("Tidak! Kamu baru saja kehilangan nyawa!", canvas.width/2, canvas.height/2-40);
    ctx.fillText("Sisa: " + lives, canvas.width/2, canvas.height/2);
}

// show Game Over text
function showGameOver(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.font = "28px Georgia";
    ctx.fillStyle = "grey";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2-60);
    ctx.fillText("Skor Total: " + score, canvas.width/2, canvas.height/2-20);
    drawRestartBtn();
    
}

// show Winning text
function showWinning(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.font = "28px Georgia";
    ctx.fillStyle = "grey";
    ctx.textAlign = "center";
    ctx.fillText("SELAMAT, semua balok sudah hancur!", canvas.width/2, canvas.height/2-60);
    ctx.fillText("Skor Total: " + score, canvas.width/2, canvas.height/2-20);
    drawRestartBtn();
    playWinGame();
}

// draw Game Paused text on pause
function drawPause(){
    ctx.beginPath();
    ctx.font = "50px Georgia";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText("Game di pause", canvas.width/2, canvas.height/2);
}

// function to pause/continue game
function togglePause() {
    paused = !paused;
    lostlife = false;
    clearInterval(intvl);
    draw();
}

// function to handle keyboard specific presses
function keyDownHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }

    // pause game when press 'P'
    if (e.keyCode == 80){
        if (pressedStart){
            togglePause();
        } 
    }
 
    // press 1 for slow-motion
    if (e.key == 1){
        if (dx>0){
            dx = 0.2
        }
        else {
            dx = -0.2
        }
        if (dy>0){
            dy = 0.2
        }
        else {
            dy = -0.2
        }
    }
    // press 2 for normal speed
    if (e.key == 2){
        if (dx>0){
            dx = 2
        }
        else {
            dx = -2
        }
        if (dy>0){
            dy = 2
        }
        else {
            dy = -2
        }
    }
    // press 3 for fast speed
    if (e.key == 3){
        if (dx>0){
            dx = 6
        }
        else {
            dx = -6
        }
        if (dy>0){
            dy = 6
        }
        else {
            dy = -6
        }
    }
}

function keyUpHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}

// function to handle mouse movement on screen
function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth/2;
    }

    // change cursor on start button
    if (pressedStart && pressedRestart){
        $('html,body').css('cursor', 'default');
        return;
    }
    var rect = myCanvas.getBoundingClientRect();
    var relativeX = e.clientX - rect.left;
    var relativeY = e.clientY - rect.top;
    if(relativeX >= canvas.width/2-(200/2)-5 && relativeX <= canvas.width/2-(200/2)+200-7
    && relativeY >= canvas.height/2 && relativeY <= canvas.height/2+75
    ) {
        $('html,body').css('cursor', 'pointer');
    }
    else {
        $('html,body').css('cursor', 'default');
    }
}

// function to handle mouse clicks on screen
function mouseClickHandler(e) {

    var rect = myCanvas.getBoundingClientRect();

    var relativeX = e.clientX - rect.left;
    var relativeY = e.clientY - rect.top;

    // draw volume/mute icon if game is paused or not started yet
    if (paused || !pressedStart){
        if (relativeX >= canvas.width-40-35 && relativeX <= canvas.width+35 &&
            relativeY >= 5 && relativeY <= 40)  {
                muted = !muted;
                ctx.clearRect(canvas.width-40, 5, 35, 35)
                drawVolume();
            }
    }

    // skip timer when lost life on click and click inside canvas
    if (e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom){
            if (lostlife){
                togglePause();
            }
    }

    // not allow click event when game is running
    if (pressedStart && pressedRestart){
        return;
    }

    // start or restart game when press Start or Restart respectively
    if(relativeX >= canvas.width/2-(200/2)-5 && relativeX <= canvas.width/2-(200/2)+200-7
    && relativeY >= canvas.height/2 && relativeY <= canvas.height/2+75
    ) {

        if (gameover || wongame){
            document.location.reload();
        }
        else {
            $('html,body').css('cursor', 'default');
            pressedStart = true;
            pressedRestart = true;
            draw();
        }
    } 
}

// remove brick on collision with ball, play sound, increase score
// and check if game is won
function brickBroken(b) {
    b.status = 0;
    playBrickSound();
    score += 5;
    if (score == totalBricks * 5)
    {
        wongame = true;
        pressedRestart = false;
        showWinning();
    }
}

// checks for collision between bricks and the ball
function collisionDetection() {
    for(var c=0; c<brickColumnCount; c++) {
        for(var r=0; r<brickRowCount; r++) {
            var b = bricks[c][r];

            //for vertical collision
            if(b.status==1)
            {
                if(x>b.x-ballRadius&&x<b.x+brickWidth+ballRadius)
                {
                    if(dy>0)
                    {
                        if(y>=b.y-ballRadius&&y-dy<b.y-ballRadius)
                        {
                            dy = -dy;
                            brickBroken(b);
                        }
                    }
                    else
                    {
                        if(y<=b.y+brickHeight+ballRadius&&y-dy>b.y+brickHeight+ballRadius)
                        {
                            dy = -dy;
                            brickBroken(b);
                        }
                    }
                }
            }

            //for horizontal collision
            if(b.status==1)
            {
                if(y>b.y-ballRadius&&y<b.y+ballRadius+brickHeight)
                {
                    if(dx>0)
                    {
                        if(x>=b.x-ballRadius&&x-dx<b.x-ballRadius)
                        {
                            dx = -dx;
                            brickBroken(b);
                        }
                    }
                    else
                    {
                        if(x<=b.x+brickWidth+ballRadius&&x-dx>b.x+brickWidth+ballRadius)
                        {
                            dx = -dx;
                            brickBroken(b);
                        }
                    }
                }
            }
        }
    }
}

function playBrickSound() {
    if (!muted){
        var audio = new Audio('sounds/collect.wav');
        audio.play()
    }
}

function playLostLife() {
    if (!muted){
        var audio = new Audio('sounds/lostlife.wav');
        audio.play()
    }
}

function playGameOver() {
    if (!muted){
        var audio = new Audio('sounds/gameover.wav');
        audio.play()
    }
}

function playWinGame() {
    if (!muted){
        var audio = new Audio('sounds/wingame.wav');
        audio.play()
    }
}

function playBoundsHit() {
    if (!muted){
        var audio = new Audio('sounds/hitbounds.wav');
        audio.play()
    }
}

function playPaddleHit() {
    if (!muted){
        var audio = new Audio('sounds/hitpaddle.wav');
        audio.play()
    }
}

function drawScore() {
    ctx.beginPath();
    ctx.font = "26px Arial";
    ctx.fillStyle = textColor;
    ctx.textAlign = "start";
    ctx.fillText("Skor: " + score, 8, 30);
}

function drawLives() {
    ctx.beginPath();
    ctx.font = "26px Arial";
    ctx.fillStyle = textColor;
    ctx.textAlign = "start";
    ctx.fillText("Nyawa: " + lives, 8, 60);
}

function drawVolume(){
    sfxImg = new Image();
    if (muted){
        sfxImg.src = 'mute.png';
    }
    else {
        sfxImg.src = 'volume.png';
    }
    sfxImg.onload = function(){
        ctx.drawImage(sfxImg, canvas.width-40, 5, 35, 35);
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("click", mouseClickHandler, false);

// pause game dengan tab
document.addEventListener("visibilitychange", function() {
    if (document.hidden && pressedStart){
        paused = true;
    }
});

draw();