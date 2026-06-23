import { Vector2 } from '../math/Vector2';
import { World } from '../physics/World';
import { Player } from '../physics/Player';
import { Ball } from '../physics/Ball';
import { TEAM_IDENTITIES, TeamIdentity } from './AIConfig';

export enum GamePhase {
    IN_POSSESSION = 'IN_POSSESSION',
    OUT_OF_POSSESSION = 'OUT_OF_POSSESSION',
    ATTACKING_TRANSITION = 'ATTACKING_TRANSITION',
    DEFENSIVE_TRANSITION = 'DEFENSIVE_TRANSITION'
}

export enum PlayerRole {
    FIRST_DEFENDER = 'FIRST_DEFENDER',   // Pressing the ball
    SECOND_DEFENDER = 'SECOND_DEFENDER', // Covering the presser
    THIRD_DEFENDER = 'THIRD_DEFENDER',   // Sweeper / Balance
    BALL_CARRIER = 'BALL_CARRIER',       // Has the ball
    SUPPORT_ATTACKER = 'SUPPORT_ATTACKER', // Offering short pass option
    RUNNER = 'RUNNER'                    // Making a deep run
}

export class TeamBrain {
    teamId: number;
    identity: TeamIdentity;
    currentPhase: GamePhase = GamePhase.OUT_OF_POSSESSION;
    lastPossessionChangeTime: number = 0;
    
    // Assignment of players to roles
    roleAssignments: Map<Player, PlayerRole> = new Map();

    constructor(teamId: number, identityKey: string = 'POSSESSION') {
        this.teamId = teamId;
        this.identity = TEAM_IDENTITIES[identityKey] || TEAM_IDENTITIES['POSSESSION'];
    }

    update(world: World, ball: Ball, time: number) {
        // Determine possession
        // Simplified: team closest to ball has possession, unless it's a free ball
        let team0Dist = Infinity;
        let team1Dist = Infinity;
        
        world.entities.forEach(e => {
            if (e instanceof Player) {
                const distSq = e.pos.sub(ball.pos).magSq();
                if (e.team === 0 && distSq < team0Dist) team0Dist = distSq;
                if (e.team === 1 && distSq < team1Dist) team1Dist = distSq;
            }
        });

        const hasPossession = this.teamId === 0 ? (team0Dist < team1Dist) : (team1Dist < team0Dist);
        const hadPossession = (this.currentPhase === GamePhase.IN_POSSESSION || this.currentPhase === GamePhase.ATTACKING_TRANSITION);

        if (hasPossession && !hadPossession) {
            this.currentPhase = GamePhase.ATTACKING_TRANSITION;
            this.lastPossessionChangeTime = time;
        } else if (!hasPossession && hadPossession) {
            this.currentPhase = GamePhase.DEFENSIVE_TRANSITION;
            this.lastPossessionChangeTime = time;
        } else if (hasPossession && time - this.lastPossessionChangeTime > 2000) {
            this.currentPhase = GamePhase.IN_POSSESSION;
        } else if (!hasPossession && time - this.lastPossessionChangeTime > 3000) { // Gegenpress window
            this.currentPhase = GamePhase.OUT_OF_POSSESSION;
        }

        this.assignRoles(world, ball);
    }

    assignRoles(world: World, ball: Ball) {
        const teamPlayers = world.entities.filter(e => e instanceof Player && e.team === this.teamId) as Player[];
        if (teamPlayers.length === 0) return;

        // Sort by distance to ball
        teamPlayers.sort((a, b) => a.pos.sub(ball.pos).magSq() - b.pos.sub(ball.pos).magSq());

        this.roleAssignments.clear();

        if (this.currentPhase === GamePhase.IN_POSSESSION || this.currentPhase === GamePhase.ATTACKING_TRANSITION) {
            this.roleAssignments.set(teamPlayers[0], PlayerRole.BALL_CARRIER);
            if (teamPlayers.length > 1) this.roleAssignments.set(teamPlayers[1], PlayerRole.SUPPORT_ATTACKER);
            if (teamPlayers.length > 2) this.roleAssignments.set(teamPlayers[2], PlayerRole.RUNNER);
        } else {
            // Out of possession - First defender is the closest player
            this.roleAssignments.set(teamPlayers[0], PlayerRole.FIRST_DEFENDER);
            if (teamPlayers.length > 1) {
                // Second defender covers, third provides balance deeper
                // Let's sort remaining by depth (y in portrait, x in landscape)
                // Assuming portrait for simplicity in this snippet, but we should make it generic
                this.roleAssignments.set(teamPlayers[1], PlayerRole.SECOND_DEFENDER);
                if (teamPlayers.length > 2) this.roleAssignments.set(teamPlayers[2], PlayerRole.THIRD_DEFENDER);
            }
        }
    }
}
