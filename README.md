# Tetris Game

A classic Tetris implementation built with Angular and TypeScript for a coding challenge.

## How to Run

```bash
npm install
ng serve
```

Open `http://localhost:4200` in your browser.

## Game Controls

- **Arrow Keys**: Move and rotate pieces
  - Left/Right: Move piece horizontally  
  - Up: Rotate piece
  - Down: Soft drop (faster fall)
- **Spacebar**: Hard drop (instant drop)
- **Pause/Resume**: Control game state
- **Reset**: Start new game

## Features

- Classic Tetris gameplay with all 7 tetrominoes
- Line clearing with scoring system
- Next piece preview
- Pause/resume functionality
- Responsive game board

## Technical Details

- **Framework**: Angular (standalone components)
- **Language**: TypeScript
- **Styling**: CSS with flexbox layout
- **Game Logic**: Custom implementation with collision detection and piece rotation

## Game Mechanics

- **Scoring**: 100 points per cleared line × current level
- **Leveling**: Every 10 lines cleared increases level
- **Speed**: Game speed increases with each level
- **Game Over**: When pieces reach the top of the board

## Development Notes

Focused on core gameplay mechanics and clean code structure rather than advanced features.

## Architecture

The game uses a single component approach with:
- Game state management in component properties
- Keyboard event handling with Angular HostListener
- Interval-based game loop for piece dropping
- Matrix operations for piece rotation
- Collision detection for movement validation
