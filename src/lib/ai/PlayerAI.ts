import { Vector2 } from '../math/Vector2';
import { Player } from '../physics/Player';
import { Ball } from '../physics/Ball';
import { World } from '../physics/World';
import { TeamBrain, PlayerRole, GamePhase } from './TeamBrain';
import { AI_CONFIG } from './AIConfig';

export class PlayerAI {
    // Individual decision layer based on utility
    
    static update(player: Player, world: World, ball: Ball, brain: TeamBrain, isPortrait: boolean, clampToPenaltyBoxEdge: (pos: Vector2) => Vector2) {
        if (player.isActive) return; // Human controlled player is not governed by AI

        const role = brain.roleAssignments.get(player) || PlayerRole.THIRD_DEFENDER;
        const opponentGoalCenter = isPortrait 
            ? new Vector2(world.width / 2, player.team === 0 ? 0 : world.height) 
            : new Vector2(player.team === 0 ? world.width : 0, world.height / 2);
            
        const ownGoalCenter = isPortrait 
            ? new Vector2(world.width / 2, player.team === 0 ? world.height : 0) 
            : new Vector2(player.team === 0 ? 0 : world.width, world.height / 2);

        let targetPos = player.pos;
        let speedMult = 0;

        switch (role) {
            case PlayerRole.FIRST_DEFENDER:
                // Pressure: Actively close down the ball carrier
                targetPos = this.calculatePressureTarget(player, ball, opponentGoalCenter);
                speedMult = 0.75 * brain.identity.sprintMultiplier;
                
                // If close enough and ball isn't moving too fast, try to tackle/shoot
                const toGoalFD = opponentGoalCenter.sub(ball.pos).normalize();
                if (player.pos.sub(ball.pos).magSq() < 5000) {
                    const toBall = ball.pos.sub(player.pos).normalize();
                    // If aligned with goal, shoot!
                    if (toBall.dot(toGoalFD) > 0.4 && Math.random() < (brain.identity.tackleAggression * 0.3)) {
                         const shotForce = 40 + (player.stats.shotPower / 100) * 60;
                         player.applyForce(toBall.mult(shotForce)); // Shoot!
                    } else if (Math.random() < (brain.identity.tackleAggression * 0.1)) {
                        // Otherwise just normal tackle
                        player.applyForce(toBall.mult(30 * brain.identity.pressIntensity));
                    }
                }
                break;
                
            case PlayerRole.SECOND_DEFENDER:
                // Cover: Drop into supporting position behind presser
                const presser = Array.from(brain.roleAssignments.entries()).find(([p, r]) => r === PlayerRole.FIRST_DEFENDER)?.[0];
                if (presser) {
                    const toOwnGoal = ownGoalCenter.sub(presser.pos).normalize();
                    targetPos = presser.pos.add(toOwnGoal.mult(AI_CONFIG.coverDistance));
                    // Spread out a bit
                    const spreadDir = new Vector2(-toOwnGoal.y, toOwnGoal.x);
                    targetPos = targetPos.add(spreadDir.mult(40 * (player.team === 0 ? 1 : -1)));
                } else {
                    targetPos = ball.pos.add(ownGoalCenter).div(2);
                }
                speedMult = 0.65 * brain.identity.sprintMultiplier;
                break;
                
            case PlayerRole.THIRD_DEFENDER:
                // Balance/Sweeper: Protect the goal
                // Apply defensive line height from identity
                const depthFactor = 2 + (1 - brain.identity.defensiveLineHeight);
                targetPos = ball.pos.add(ownGoalCenter.mult(depthFactor)).div(depthFactor + 1);
                speedMult = 0.6 * brain.identity.sprintMultiplier;
                break;

            case PlayerRole.BALL_CARRIER:
                // We should theoretically have the ball.
                // Move towards opponent goal, but stay behind the ball to push it
                targetPos = this.calculatePressureTarget(player, ball, opponentGoalCenter);
                speedMult = 0.8 * brain.identity.sprintMultiplier;
                // If close to ball and pointing at goal, shoot!
                const toGoal = opponentGoalCenter.sub(ball.pos).normalize();
                if (player.pos.sub(ball.pos).magSq() < 5000) {
                     const toBall = ball.pos.sub(player.pos).normalize();
                     if (toBall.dot(toGoal) > 0.4 && Math.random() < (brain.identity.tackleAggression * 0.4)) {
                         const shotForce = 40 + (player.stats.shotPower / 100) * 60;
                         player.applyForce(toBall.mult(shotForce)); // Shoot!
                     }
                }
                break;

            case PlayerRole.SUPPORT_ATTACKER:
                // Offer short pass
                targetPos = ball.pos.add(new Vector2((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100));
                // Try to stay goal side of the ball
                targetPos = targetPos.add(opponentGoalCenter.sub(targetPos).normalize().mult(50 * brain.identity.possessionWeight));
                speedMult = 0.65 * brain.identity.sprintMultiplier;
                break;

            case PlayerRole.RUNNER:
                // Make deep run
                targetPos = opponentGoalCenter.add(new Vector2((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200));
                targetPos = targetPos.add(opponentGoalCenter.sub(targetPos).normalize().mult(50 * brain.identity.directWeight));
                speedMult = 0.9 * brain.identity.sprintMultiplier;
                break;
        }

        // Penalty box restriction (only the closest player/first defender should enter the box if needed, others stay out)
        // Simplified: push them out of the immediate goal area if they are not the primary interactor
        if (role === PlayerRole.THIRD_DEFENDER || role === PlayerRole.RUNNER || role === PlayerRole.SECOND_DEFENDER) {
            targetPos = clampToPenaltyBoxEdge(targetPos);
        }

        // Apply movement force
        const dir = targetPos.sub(player.pos);
        if (dir.magSq() > 400) {
            player.applyForce(dir.normalize().mult(speedMult));
        }
    }

    static calculatePressureTarget(player: Player, ball: Ball, opponentGoalCenter: Vector2) {
        // Run slightly behind the ball relative to the goal we want to attack
        // so we can push it forward
        const toOpponentGoal = opponentGoalCenter.sub(ball.pos).normalize();
        const approachPos = ball.pos.sub(toOpponentGoal.mult(20));
        
        const toBall = ball.pos.sub(player.pos).normalize();
        const angleSimilarity = toBall.dot(toOpponentGoal);

        if (angleSimilarity > 0.5) {
            return ball.pos.add(toOpponentGoal.mult(20));
        } else {
            return approachPos;
        }
    }
}
