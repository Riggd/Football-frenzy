# Footy Frenzy

Footy Frenzy is a vector-based HTML5 canvas 2D physics sandbox for a Tron-style 3v3 soccer game.

## Features

- **Physics-based Gameplay:** Realistic 2D physics and collisions using custom mechanics.
- **Dynamic AI:** Opponent and teammate AI utilizing varying playstyles (e.g., High Press, Possession, Direct).
- **Match Modes:** Play full timed matches or practice in sandbox mode.
- **National Teams:** Play as various nations from different regional federations with differing stats and team ratings.
- **Interactive Mechanics:** Flick and dash mechanics to simulate tackling and shooting.

## Running Locally

To run this project locally, make sure you have [Node.js](https://nodejs.org/) installed, then follow these steps:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open in your browser:**
   The development server will usually start at `http://localhost:3000`. Check your terminal output for the exact URL.

## Building for Production

To create a production build:

```bash
npm run build
```

This will bundle the application into the `dist/` directory, which can then be served statically.
