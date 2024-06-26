const cvs = document.getElementById("board");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score");
const linesElement = document.getElementById("lines");
const levelElement = document.getElementById("level");
const ROW = 20;
const COL = (COLUMN = 10);
const SQ = (squareSize = 27);
const VACANT = "black"; // color of an empty square

// draw a square
function drawSquare(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * SQ, y * SQ, SQ, SQ);

  ctx.strokeStyle = "BLACK";
  ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

// create the board

let board = [];
for (r = 0; r < ROW; r++) {
  board[r] = [];
  for (c = 0; c < COL; c++) {
    board[r][c] = VACANT;
  }
}

// draw the board
function drawBoard() {
  for (r = 0; r < ROW; r++) {
    for (c = 0; c < COL; c++) {
      drawSquare(c, r, board[r][c]);
    }
  }
}

drawBoard();

const cvs2 = document.getElementById("next");
const ctx2 = cvs2.getContext("2d");

// const nextRow = 6;
// const nextCol = 6;
const nextSq = 25;

function drawNextSquare(x, y, color) {
  ctx2.fillStyle = color;
  ctx2.fillRect(x, y, nextSq, nextSq);

  ctx2.strokeStyle = "BLACK";
  ctx2.strokeRect(x, y, nextSq, nextSq);
}

// Draw next piece on the small canvas
function drawNextTetromino(nextPiece) {
  // Clear the next board
  ctx2.clearRect(0, 0, cvs2.width, cvs2.height);
  // Calculate the starting position to center the next piece
  let startX = Math.floor(
    (cvs2.width -
      nextPiece.tetromino[nextPiece.tetrominoN][0].length * nextSq) /
      2
  );
  let startY = Math.floor(
    (cvs2.height - nextPiece.tetromino[nextPiece.tetrominoN].length * nextSq) /
      2
  );

  // Draw the next piece on the small canvas
  // Draw the next piece on the small canvas
  for (let r = 0; r < nextPiece.tetromino[nextPiece.tetrominoN].length; r++) {
    for (
      let c = 0;
      c < nextPiece.tetromino[nextPiece.tetrominoN][r].length;
      c++
    ) {
      if (nextPiece.tetromino[nextPiece.tetrominoN][r][c]) {
        drawNextSquare(
          startX + c * nextSq,
          startY + r * nextSq,
          nextPiece.color
        );
      }
    }
  }
}

// the pieces and their colors
const PIECES = [
  [Z, "teal"],
  [S, "darkgreen"],
  [T, "khaki"],
  [O, "crimson"],
  [L, "hotpink"],
  [I, "ivory"],
  [J, "coral"],
];

// generate random pieces
function randomPiece() {
  let r = (randomN = Math.floor(Math.random() * PIECES.length)); // 0 -> 6
  return new Piece(PIECES[r][0], PIECES[r][1]);
}

let p = randomPiece();
let ply = randomPiece();
drawNextTetromino(ply);

// The Object Piece
function Piece(tetromino, color) {
  this.tetromino = tetromino;
  this.color = color;

  this.tetrominoN = 0; // we start from the first pattern
  this.activeTetromino = this.tetromino[this.tetrominoN];

  // we need to control the pieces
  this.x = 3;
  this.y = -1;
}

// fill function
Piece.prototype.fill = function (color) {
  for (r = 0; r < this.activeTetromino.length; r++) {
    for (c = 0; c < this.activeTetromino.length; c++) {
      // we draw only occupied squares
      if (this.activeTetromino[r][c]) {
        drawSquare(this.x + c, this.y + r, color);
      }
    }
  }
};

// draw a piece to the board
Piece.prototype.draw = function () {
  this.fill(this.color);
};

// undraw a piece
Piece.prototype.unDraw = function () {
  this.fill(VACANT);
};

// move Down the piece
Piece.prototype.moveDown = function () {
  if (!this.collision(0, 1, this.activeTetromino)) {
    this.unDraw();
    this.y++;
    this.draw();
  } else {
    // we lock the piece and generate a new one
    this.lock();
    p = ply;
    ply = randomPiece();
    drawNextTetromino(ply);
  }
};

// move Right the piece
Piece.prototype.moveRight = function () {
  if (!this.collision(1, 0, this.activeTetromino)) {
    this.unDraw();
    this.x++;
    this.draw();
  }
};

// move Left the piece
Piece.prototype.moveLeft = function () {
  if (!this.collision(-1, 0, this.activeTetromino)) {
    this.unDraw();
    this.x--;
    this.draw();
  }
};

// rotate the piece
Piece.prototype.rotate = function () {
  let nextPattern =
    this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
  let kick = 0;

  if (this.collision(0, 0, nextPattern)) {
    if (this.x > COL / 2) {
      // it's the right wall
      kick = -1; // we need to move the piece to the left
    } else {
      // it's the left wall
      kick = 1; // we need to move the piece to the right
    }
  }

  if (!this.collision(kick, 0, nextPattern)) {
    this.unDraw();
    this.x += kick;
    this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length; // (0+1)%4 => 1
    this.activeTetromino = this.tetromino[this.tetrominoN];
    this.draw();
  }
};

let score = 0;
let lines = 0;
let level = 0;
window.onload = function () {
  var audio = document.getElementById("gameAudio");
  audio.play();
  drop(); // Start the game loop after music starts playing
};
Piece.prototype.lock = function () {
  for (r = 0; r < this.activeTetromino.length; r++) {
    for (c = 0; c < this.activeTetromino.length; c++) {
      // we skip the vacant squares
      if (!this.activeTetromino[r][c]) {
        continue;
      }
      // pieces to lock on top = game over
      if (this.y + r < 0) {
        // alert("Game Over");
        // stop request animation frame
        gameOver = true;
        // Stop game music
        var audio = document.getElementById("gameAudio");
        audio.pause();
        // Play game over music
        var gameOverAudio = document.getElementById("gameOverAudio");
        gameOverAudio.play();
        alert("Game Over");
        break;
      }
      // we lock the piece
      board[this.y + r][this.x + c] = this.color;
    }
  }
  // remove full rows
  for (r = 0; r < ROW; r++) {
    let isRowFull = true;
    for (c = 0; c < COL; c++) {
      isRowFull = isRowFull && board[r][c] != VACANT;
    }
    if (isRowFull) {
      // if the row is full
      // we move down all the rows above it
      for (y = r; y > 1; y--) {
        for (c = 0; c < COL; c++) {
          board[y][c] = board[y - 1][c];
        }
      }
      // the top row board[0][..] has no row above it
      for (c = 0; c < COL; c++) {
        board[0][c] = VACANT;
      }
      // increment the score, lines and level
      score += 10;
      lines += 1;
      if (score % 10 === 0) {
        level += 1;
      }
    }
  }
  // update the board
  drawBoard();

  // update the score,lines and level
  scoreElement.innerHTML = score;
  linesElement.innerHTML = lines;
  levelElement.innerHTML = level;
};

// collision function
Piece.prototype.collision = function (x, y, piece) {
  for (r = 0; r < piece.length; r++) {
    for (c = 0; c < piece.length; c++) {
      // if the square is empty, we skip it
      if (!piece[r][c]) {
        continue;
      }
      // coordinates of the piece after movement
      let newX = this.x + c + x;
      let newY = this.y + r + y;

      // conditions
      if (newX < 0 || newX >= COL || newY >= ROW) {
        return true;
      }
      // skip newY < 0; board[-1] will crush our game
      if (newY < 0) {
        continue;
      }
      // check if there is a locked piece already in place
      if (board[newY][newX] != VACANT) {
        return true;
      }
    }
  }
  return false;
};

let isHard1 = false;
const isEasy = document.getElementById("Easy");
const isHard = document.getElementById("Hard");
isHard.addEventListener("click", function (event) {
  isHard1 = true;
});
isEasy.addEventListener("click", function (event) {
  isHard1 = false;
});
// CONTROL the piece

document.addEventListener("keydown", CONTROL);

function CONTROL(event) {
  if (event.keyCode == 37) {
    p.moveLeft();
    dropStart = Date.now();
  } else if (event.keyCode == 38 && isHard1 === false) {
    p.rotate();
    dropStart = Date.now();
  } else if (event.keyCode == 39) {
    p.moveRight();
    dropStart = Date.now();
  } else if (event.keyCode == 40) {
    p.moveDown();
  }
}

// drop the piece every 1sec

let dropStart = Date.now();
let gameOver = false;
function drop() {
  let now = Date.now();
  let delta = now - dropStart;
  let dropSpeed = 1000 - (level - 1) * 100;

  if (delta > dropSpeed) {
    if (p !== null) p.moveDown();
    dropStart = Date.now();
  }
  if (!gameOver) {
    requestAnimationFrame(drop);
  }
}

function play1() {
  var audio = document.getElementById("gameAudio");
  audio.play();
  p = ply;
  ply = randomPiece();
  drawNextTetromino(ply);
}

function pause() {
  var audio = document.getElementById("gameAudio");
  audio.pause();
  ply = p;
  p = null;
}

function restart() {
  var audio = document.getElementById("gameAudio");
  audio.currentTime = 0; // Reset audio to the beginning
  audio.play();
  window.location.reload();
}

// document.getElementById("play").addEventListener("click", play1);
// document.getElementById("pause").addEventListener("click", pause);
// document.getElementById("restart").addEventListener("click", restart);

drop();

document.addEventListener("dblclick", function (event) {
  event.preventDefault();
});

function rotatePiece() {
  p.rotate();
  dropStart = Date.now();
}

function moveLeft() {
  p.moveLeft();
  dropStart = Date.now();
}

function moveDown() {
  p.moveDown();
}

function moveRight() {
  p.moveRight();
  dropStart = Date.now();
}
