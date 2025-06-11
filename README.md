# Tetris Game

A Tetris implementation built with Angular and TypeScript for a coding challenge.

## How to Run

```bash
npm install
ng serve
```

Open `http://localhost:4200` in your browser.

## Game Controls

- **Arrow Keys**: Move pieces
  - Left/Right: Move piece horizontally  
  - Down: Soft drop (faster fall)
- **Pause/Resume**: Control game state
- **New Game**: Reset and restart

## Features

- Basic Tetris gameplay with 4 piece types (I, O, T, S)
- Line clearing with proper Tetris scoring system
- Pause/resume functionality
- Game over detection
- Real-time collision detection

## Technical Details

- **Framework**: Angular (standalone components)
- **Language**: TypeScript
- **Styling**: CSS with grid layout
- **Game Logic**: Custom implementation with collision detection

## Game Mechanics

- **Scoring**: 
  - 1 line: 40 points
  - 2 lines: 100 points
  - 3 lines: 300 points
  - 4 lines: 1200 points (Tetris!)
- **Game Over**: When pieces reach the top of the board

## Development Notes

- **Working features**: Piece movement, collision detection, line clearing, scoring
- **Strategic cuts**: No piece rotation, fixed game speed, limited piece variety
- **Code approach**: Inline templates for faster development

## Architecture

Single component approach with:
- Game state management in component properties
- Keyboard event handling with Angular HostListener
- Interval-based game loop for piece dropping
- Simple collision detection for movement validation


Built to demonstrate core programming concepts and Angular/TypeScript skills within a realistic timeframe.
