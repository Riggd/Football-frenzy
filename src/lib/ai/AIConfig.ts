export interface TeamIdentity {
  id: string;
  possessionWeight: number; // Patient short passing
  directWeight: number;     // Fast transition
  pressIntensity: number;   // How hard they hunt the ball
  sprintMultiplier: number; // Affects movement speed
  tackleAggression: number; // Probability to tackle when close to ball
  defensiveLineHeight: number; // How high up the pitch they defend
}

export const TEAM_IDENTITIES: Record<string, TeamIdentity> = {
  POSSESSION: { 
    id: 'POSSESSION', 
    possessionWeight: 1.0, 
    directWeight: 0.2, 
    pressIntensity: 0.6,
    sprintMultiplier: 0.9,
    tackleAggression: 0.05,
    defensiveLineHeight: 0.5 
  },
  DIRECT: { 
    id: 'DIRECT', 
    possessionWeight: 0.3, 
    directWeight: 1.0, 
    pressIntensity: 0.4,
    sprintMultiplier: 1.0,
    tackleAggression: 0.1,
    defensiveLineHeight: 0.3 
  },
  HIGH_PRESS: { 
    id: 'HIGH_PRESS', 
    possessionWeight: 0.6, 
    directWeight: 0.6, 
    pressIntensity: 1.0,
    sprintMultiplier: 0.95,
    tackleAggression: 0.15,
    defensiveLineHeight: 0.7 
  },
};

export const AI_CONFIG = {
  // Difficulty scaling params (can be changed based on chosen difficulty)
  reactionDelayMs: 100, // How delayed the AI is to state changes
  decisionNoise: 0.05,  // Random error chance in decision making

  // Pressing rules
  pressRadius: 200,      // Distance at which AI will aggressively close down
  coverDistance: 80,    // Distance behind presser for 2nd defender
  
  // Stamina costs
  sprintStaminaCost: 0.5,
  sprintRecoveryRate: 0.2,
  
  // Tactical dimensions
  defensiveLineHeight: 0.4, // 0 = sit deep, 1 = halfway line
  counterpressDurationMs: 3000, // 3 seconds of high intensity after losing ball

  // Action Thresholds
  shootThreshold: 0.7, // Utility threshold required to attempt a shot
  passThreshold: 0.6,  // Utility threshold required to attempt a pass
};
