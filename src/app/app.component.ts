import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Tetris</h1>

      <div class="stats">
        <span>Score: {{score}}</span>
        <span>Level: {{level}}</span>
        <span>Lines: {{linesCleared}}</span>
      </div>

      <div class="game-area">
        <div class="board" #gameBoard>
          <div *ngFor="let row of grid; let y = index" class="row">
            <div *ngFor="let cell of row; let x = index"
                 class="cell"
                 [style.background]="cell || '#222'">
            </div>
          </div>

          <!-- Active piece -->
          <div *ngIf="activePiece" class="piece">
            <div *ngFor="let row of activePiece.blocks; let dy = index"
                 class="piece-row"
                 [style.top.px]="(activePiece.y + dy) * 25"
                 [style.left.px]="activePiece.x * 25">
              <div *ngFor="let block of row; let dx = index"
                   class="block"
                   [style.background]="block ? activePiece.color : 'transparent'"
                   [style.left.px]="dx * 25">
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar">
          <div class="next-box">
            <h3>Next</h3>
            <div class="preview" *ngIf="nextPiece">
              <div *ngFor="let row of nextPiece.blocks" class="mini-row">
                <div *ngFor="let block of row"
                     class="mini-block"
                     [style.background]="block ? nextPiece.color : 'transparent'">
                </div>
              </div>
            </div>
          </div>

          <div class="controls-info">
            <p>← → Move</p>
            <p>↓ Drop</p>
            <p>↑ Rotate</p>
            <p>Space: Hard Drop</p>
          </div>

          <button (click)="pauseToggle()">{{paused ? 'Resume' : 'Pause'}}</button>
          <button (click)="restart()">New Game</button>
        </div>
      </div>

      <div *ngIf="gameEnded" class="game-over">
        <h2>Game Over</h2>
        <p>Score: {{score}}</p>
        <button (click)="restart()">Try Again</button>
      </div>
    </div>
  `,
  styles: [`
    .container {
      font-family: monospace;
      text-align: center;
      background: #111;
      color: #fff;
      min-height: 100vh;
      padding: 20px;
    }

    h1 { color: #0f0; margin-bottom: 20px; }

    .stats {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-bottom: 20px;
    }

    .stats span {
      background: #333;
      padding: 8px 16px;
      border-radius: 4px;
    }

    .game-area {
      display: flex;
      justify-content: center;
      gap: 30px;
      align-items: flex-start;
    }

    .board {
      position: relative;
      border: 2px solid #0f0;
      background: #000;
    }

    .row { display: flex; }

    .cell {
      width: 25px;
      height: 25px;
      border: 1px solid #333;
      box-sizing: border-box;
    }

    .piece {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
    }

    .piece-row {
      position: absolute;
      display: flex;
    }

    .block {
      position: absolute;
      width: 25px;
      height: 25px;
      border: 1px solid #555;
      box-sizing: border-box;
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 20px;
      min-width: 150px;
    }

    .next-box {
      background: #333;
      padding: 15px;
      border-radius: 8px;
    }

    .preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 10px;
    }

    .mini-row { display: flex; }

    .mini-block {
      width: 15px;
      height: 15px;
      border: 1px solid #555;
    }

    .controls-info {
      background: #333;
      padding: 15px;
      border-radius: 8px;
      font-size: 14px;
    }

    .controls-info p { margin: 5px 0; }

    button {
      padding: 10px 20px;
      background: #0f0;
      color: #000;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }

    button:hover { background: #0a0; }

    .game-over {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #000;
      border: 2px solid #f00;
      padding: 30px;
      border-radius: 8px;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  // Game state
  grid: string[][] = [];
  activePiece: any = null;
  nextPiece: any = null;
  score = 0;
  level = 1;
  linesCleared = 0;
  paused = false;
  gameEnded = false;

  // Game config
  boardW = 10;
  boardH = 20;
  dropInterval: any;
  dropSpeed = 1000;

  // Piece definitions - simple shapes
  pieces = [
    { blocks: [[1,1,1,1]], color: '#0ff' }, // I
    { blocks: [[1,1],[1,1]], color: '#ff0' }, // O
    { blocks: [[0,1,0],[1,1,1]], color: '#f0f' }, // T
    { blocks: [[0,1,1],[1,1,0]], color: '#0f0' }, // S
    { blocks: [[1,1,0],[0,1,1]], color: '#f00' }, // Z
    { blocks: [[1,0,0],[1,1,1]], color: '#00f' }, // J
    { blocks: [[0,0,1],[1,1,1]], color: '#fa0' }  // L
  ];

  ngOnInit() {
    this.setupBoard();
    this.spawnNewPiece();
    this.startGameLoop();
  }

  ngOnDestroy() {
    if (this.dropInterval) clearInterval(this.dropInterval);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (this.gameEnded || this.paused) return;

    switch(event.code) {
      case 'ArrowLeft': this.movePiece(-1, 0); break;
      case 'ArrowRight': this.movePiece(1, 0); break;
      case 'ArrowDown': this.movePiece(0, 1); break;
      case 'ArrowUp': this.rotatePiece(); break;
      case 'Space': this.hardDrop(); break;
    }
    event.preventDefault();
  }

  setupBoard() {
    this.grid = [];
    for(let y = 0; y < this.boardH; y++) {
      this.grid[y] = [];
      for(let x = 0; x < this.boardW; x++) {
        this.grid[y][x] = '';
      }
    }
  }

  spawnNewPiece() {
    if (!this.nextPiece) {
      this.nextPiece = this.getRandomPiece();
    }

    this.activePiece = this.nextPiece;
    this.nextPiece = this.getRandomPiece();


    this.activePiece.x = Math.floor(this.boardW / 2) - 1;
    this.activePiece.y = 0;

    if (this.checkCollision(this.activePiece, 0, 0)) {
      this.gameEnded = true;
      this.stopGameLoop();
    }
  }

  getRandomPiece() {
    const template = this.pieces[Math.floor(Math.random() * this.pieces.length)];
    return {
      blocks: template.blocks.map(row => [...row]),
      color: template.color,
      x: 0,
      y: 0
    };
  }

  startGameLoop() {
    this.dropInterval = setInterval(() => {
      if (!this.paused && !this.gameEnded) {
        this.gameStep();
      }
    }, this.dropSpeed);
  }

  stopGameLoop() {
    if (this.dropInterval) {
      clearInterval(this.dropInterval);
    }
  }

  gameStep() {
    if (!this.movePiece(0, 1)) {
      this.lockPiece();
      this.checkLines();
      this.spawnNewPiece();
    }
  }

  movePiece(dx: number, dy: number): boolean {
    if (!this.activePiece) return false;

    if (!this.checkCollision(this.activePiece, dx, dy)) {
      this.activePiece.x += dx;
      this.activePiece.y += dy;
      return true;
    }
    return false;
  }

  rotatePiece() {
    if (!this.activePiece) return;

    const rotated = this.rotateBlocks(this.activePiece.blocks);
    const originalBlocks = this.activePiece.blocks;

    this.activePiece.blocks = rotated;

    if (this.checkCollision(this.activePiece, 0, 0)) {
      this.activePiece.blocks = originalBlocks;
    }
  }

  rotateBlocks(blocks: number[][]): number[][] {
    const rows = blocks.length;
    const cols = blocks[0].length;
    const rotated = Array(cols).fill(0).map(() => Array(rows).fill(0));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        rotated[c][rows - 1 - r] = blocks[r][c];
      }
    }
    return rotated;
  }

  hardDrop() {
    if (!this.activePiece) return;

    let dropped = 0;
    while (this.movePiece(0, 1)) {
      dropped++;
    }
    this.score += dropped; // bonus points
  }

  checkCollision(piece: any, dx: number, dy: number): boolean {
    for (let y = 0; y < piece.blocks.length; y++) {
      for (let x = 0; x < piece.blocks[y].length; x++) {
        if (piece.blocks[y][x]) {
          const newX = piece.x + x + dx;
          const newY = piece.y + y + dy;

          if (newX < 0 || newX >= this.boardW ||
              newY >= this.boardH ||
              (newY >= 0 && this.grid[newY][newX])) {
            return true;
          }
        }
      }
    }
    return false;
  }

  lockPiece() {
    if (!this.activePiece) return;

    for (let y = 0; y < this.activePiece.blocks.length; y++) {
      for (let x = 0; x < this.activePiece.blocks[y].length; x++) {
        if (this.activePiece.blocks[y][x]) {
          const boardX = this.activePiece.x + x;
          const boardY = this.activePiece.y + y;

          if (boardY >= 0) {
            this.grid[boardY][boardX] = this.activePiece.color;
          }
        }
      }
    }
  }

  checkLines() {
    let lines = 0;

    for (let y = this.boardH - 1; y >= 0; y--) {
      let fullLine = true;
      for (let x = 0; x < this.boardW; x++) {
        if (!this.grid[y][x]) {
          fullLine = false;
          break;
        }
      }

      if (fullLine) {
        this.grid.splice(y, 1);
        this.grid.unshift(new Array(this.boardW).fill(''));
        lines++;
        y++;
      }
    }

    if (lines > 0) {
      this.linesCleared += lines;
      this.score += lines * 100 * this.level;
      this.level = Math.floor(this.linesCleared / 10) + 1;
      this.updateSpeed();
    }
  }

  updateSpeed() {
    this.dropSpeed = Math.max(100, 1000 - (this.level - 1) * 100);
    this.stopGameLoop();
    this.startGameLoop();
  }

  pauseToggle() {
    this.paused = !this.paused;
  }

  restart() {
    this.stopGameLoop();
    this.setupBoard();
    this.activePiece = null;
    this.nextPiece = null;
    this.score = 0;
    this.level = 1;
    this.linesCleared = 0;
    this.gameEnded = false;
    this.paused = false;
    this.dropSpeed = 1000;
    this.spawnNewPiece();
    this.startGameLoop();
  }
}
