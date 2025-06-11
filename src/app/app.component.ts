import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game">
      <h1>Tetris Game</h1>

      <div class="info">
        <span>Score: {{score}}</span>
        <span>Lines: {{lines}}</span>
        <span>Piece: {{currentPiece ? 'Active' : 'None'}}</span>
      </div>

      <div class="board">
        <div *ngFor="let row of getBoardWithPiece(); let y = index" class="row">
          <div *ngFor="let cell of row; let x = index"
               class="cell"
               [style.background-color]="cell || '#333'">
          </div>
        </div>
      </div>

      <div class="controls">
        <p>Arrow keys to move, Down to drop faster</p>
        <button (click)="togglePause()">{{paused ? 'Resume' : 'Pause'}}</button>
        <button (click)="restart()">New Game</button>
      </div>

      <div *ngIf="gameOver" class="overlay">
        <h2>Game Over!</h2>
        <p>Final Score: {{score}}</p>
        <button (click)="restart()">Try Again</button>
      </div>
    </div>
  `,
  styles: [`
    .game {
      text-align: center;
      padding: 20px;
      background: #222;
      color: white;
      min-height: 100vh;
      font-family: Arial;
    }

    .info {
      margin: 20px;
    }

    .info span {
      margin: 0 20px;
      font-size: 18px;
    }

    .board {
      display: inline-block;
      border: 3px solid #555;
      margin: 20px;
      background: #000;
    }

    .row {
      display: flex;
    }

    .cell {
      width: 25px;
      height: 25px;
      border: 1px solid #444;
    }

    .controls {
      margin: 20px;
    }

    .controls p {
      margin: 10px;
    }

    button {
      padding: 8px 16px;
      margin: 5px;
      font-size: 14px;
      cursor: pointer;
    }

    .overlay {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #000;
      border: 2px solid #f00;
      padding: 30px;
      border-radius: 5px;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  board: (string | null)[][] = [];
  currentPiece: any = null;
  score = 0;
  lines = 0;
  paused = false;
  gameOver = false;
  gameInterval: any;

  pieces = [
    { blocks: [[1,1,1,1]], color: '#00ffff' }, // I piece (horizontal only)
    { blocks: [[1,1],[1,1]], color: '#ffff00' }, // Square
    { blocks: [[1,1,1],[0,1,0]], color: '#ff00ff' }, // T piece (one orientation)
    { blocks: [[1,1,0],[0,1,1]], color: '#00ff00' } // S piece (one orientation)
  ];

  ngOnInit() {
    this.initGame();
  }

  ngOnDestroy() {
    if (this.gameInterval) clearInterval(this.gameInterval);
  }

  initGame() {
    // Create empty board with null values (not empty strings)
    this.board = [];
    for(let y = 0; y < 20; y++) {
      this.board[y] = [];
      for(let x = 0; x < 10; x++) {
        this.board[y][x] = null;
      }
    }

    this.spawnPiece();
    this.startGameLoop();
  }

  spawnPiece() {
    const pieceType = this.pieces[Math.floor(Math.random() * this.pieces.length)];
    this.currentPiece = {
      blocks: pieceType.blocks,
      color: pieceType.color,
      x: 4,
      y: 0
    };

    // Basic game over check
    if (this.checkCollision(this.currentPiece, this.currentPiece.x, this.currentPiece.y)) {
      this.gameOver = true;
      clearInterval(this.gameInterval);
    }
  }

  startGameLoop() {
    this.gameInterval = setInterval(() => {
      if (!this.paused && !this.gameOver) {
        this.dropPiece();
      }
    }, 800); // Fixed speed, no progression
  }

  @HostListener('window:keydown', ['$event'])
  handleKeys(event: KeyboardEvent) {
    if (this.gameOver || this.paused || !this.currentPiece) return;

    switch(event.key) {
      case 'ArrowLeft':
        if (!this.checkCollision(this.currentPiece, this.currentPiece.x - 1, this.currentPiece.y)) {
          this.currentPiece.x--;
        }
        break;
      case 'ArrowRight':
        if (!this.checkCollision(this.currentPiece, this.currentPiece.x + 1, this.currentPiece.y)) {
          this.currentPiece.x++;
        }
        break;
      case 'ArrowDown':
        this.dropPiece();
        break;
    }
  }

  dropPiece() {
    if (!this.currentPiece) return;

    if (!this.checkCollision(this.currentPiece, this.currentPiece.x, this.currentPiece.y + 1)) {
      this.currentPiece.y++;
    } else {
      // Piece can't move down, place it
      this.placePiece();
      this.clearLines();
      this.spawnPiece();
    }
  }

  // Basic collision detection - has some flaws but works
  checkCollision(piece: any, newX: number, newY: number): boolean {
    for(let y = 0; y < piece.blocks.length; y++) {
      for(let x = 0; x < piece.blocks[y].length; x++) {
        if (piece.blocks[y][x]) {
          const boardX = newX + x;
          const boardY = newY + y;

          // Check boundaries
          if (boardX < 0 || boardX >= 10 || boardY >= 20) {
            return true;
          }

          // Check existing pieces
          if (boardY >= 0 && this.board[boardY][boardX] !== null) {
            return true;
          }
        }
      }
    }
    return false;
  }

  placePiece() {
    if (!this.currentPiece) return;

    for(let y = 0; y < this.currentPiece.blocks.length; y++) {
      for(let x = 0; x < this.currentPiece.blocks[y].length; x++) {
        if (this.currentPiece.blocks[y][x]) {
          const boardX = this.currentPiece.x + x;
          const boardY = this.currentPiece.y + y;

          if (boardY >= 0 && boardY < 20 && boardX >= 0 && boardX < 10) {
            this.board[boardY][boardX] = this.currentPiece.color;
          }
        }
      }
    }
  }

  clearLines() {
    let linesCleared = 0;

    // Check each row from bottom to top
    for(let y = 19; y >= 0; y--) {
      let fullLine = true;
      let filledCount = 0;

      // Check if all cells in this row are filled (not null)
      for(let x = 0; x < 10; x++) {
        if (this.board[y][x] === null) {
          fullLine = false;
        } else {
          filledCount++;
        }
      }

      if (filledCount >= 8) {
      }

      if (fullLine) {
        this.board.splice(y, 1);
        this.board.unshift(new Array(10).fill(null));
        linesCleared++;
        y++;
      }
    }

    // Tetris scoring system
    if (linesCleared > 0) {
      this.lines += linesCleared;

      // Standard Tetris scoring
      let points = 0;
      switch(linesCleared) {
        case 1: points = 40; break;    // Single
        case 2: points = 100; break;   // Double
        case 3: points = 300; break;   // Triple
        case 4: points = 1200; break;  // Tetris
        default: points = linesCleared * 40; break;
      }

      this.score += points;
    }
  }

  togglePause() {
    this.paused = !this.paused;
  }

  restart() {
    if (this.gameInterval) clearInterval(this.gameInterval);

    this.score = 0;
    this.lines = 0;
    this.paused = false;
    this.gameOver = false;
    this.currentPiece = null;

    this.initGame();
  }

  // Method to combine board with current falling piece for display
  getBoardWithPiece(): string[][] {
    const displayBoard = this.board.map(row =>
      row.map(cell => cell || '#333')
    );

    // Draw current piece on the display board
    if (this.currentPiece && !this.gameOver) {
      for(let y = 0; y < this.currentPiece.blocks.length; y++) {
        for(let x = 0; x < this.currentPiece.blocks[y].length; x++) {
          if (this.currentPiece.blocks[y][x]) {
            const boardX = this.currentPiece.x + x;
            const boardY = this.currentPiece.y + y;

            if (boardY >= 0 && boardY < 20 && boardX >= 0 && boardX < 10) {
              displayBoard[boardY][boardX] = this.currentPiece.color;
            }
          }
        }
      }
    }

    return displayBoard;
  }
}
