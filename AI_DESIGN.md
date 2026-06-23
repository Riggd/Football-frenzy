# AI System Design

This document details the modular, scalable AI system for the 2D 3v3 Soccer game, mapping football concepts to implementation logic.

## 1. Tactical Philosophy & Implementation

### Total Football & Positional Play
- **Concept:** Players interchange positions dynamically rather than strictly adhering to static zones, ensuring both attacking depth and defensive balance are preserved.
- **Implementation:** The `TeamBrain` dynamically assigns abstract roles (`PlayerRole`) every tick based on distance to the ball and current game phase. If a player moves out of position to press, the remaining players automatically adopt covering/sweeping roles based on their proximity to the ball and goal.

### Pressure–Cover–Balance (Defending)
- **Concept:** One player pressures the ball carrier, a second covers passing lanes behind the presser, and a third sweeps deep to protect the goal.
- **Implementation:** 
  - `FIRST_DEFENDER`: Actively chases and tackles the ball carrier.
  - `SECOND_DEFENDER`: Positions themselves behind the first defender (using `coverDistance` from `AIConfig`) to catch any breakthroughs.
  - `THIRD_DEFENDER`: Drops deep near the goal edge to sweep.

### Phases of Play & Counterpressing (Gegenpressing)
- **Concept:** Transition phases dictate intensity. A team that just lost the ball should press aggressively for a short window before retreating.
- **Implementation:** `TeamBrain` tracks the game phase (`IN_POSSESSION`, `OUT_OF_POSSESSION`, `ATTACKING_TRANSITION`, `DEFENSIVE_TRANSITION`). The `lastPossessionChangeTime` allows the AI to enter a "Gegenpress" phase immediately after losing the ball.

## 2. Architecture Hierarchy

### `AIConfig.ts`
Holds the tunable data-driven weights. Configurable parameters include reaction delay, decision noise, press intensity, cover distance, and team identities (Possession vs. Direct vs. High Press). This allows difficulty tuning without changing code logic.

### `TeamBrain.ts`
The highest layer. Reads the global state (`world`, `ball`), determines the team's current `GamePhase`, and assigns a `PlayerRole` to each player on the team.

### `PlayerAI.ts`
The individual decision layer. Uses the `PlayerRole` assigned by the `TeamBrain` to calculate a target positional utility. Evaluates shooting, passing, and movement vectors using vector dot products, and applies the resulting physics forces to the player entity.

## 3. Balance & Constraints
- **Human Autonomy:** The `isActive` flag entirely bypasses the AI layer for the human-controlled player. AI teammates will cover and defend but will not steal the ball and score automatically.
- **No Swarming:** The `clampToPenaltyBoxEdge` rule and role-based assignments ensure that only the `FIRST_DEFENDER` enters the immediate ball vicinity, preventing all 3 players from clustering.
- **Tuning:** Match balance is adjusted by modifying values in `AIConfig.ts`, allowing designers to scale AI difficulty based on variables like movement speed, pressure radius, and pass thresholds.
