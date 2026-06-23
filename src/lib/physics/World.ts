import { Entity } from './Entity';
import { Vector2 } from '../math/Vector2';
import { Ball } from './Ball';

export class World {
  entities: Entity[] = [];
  width: number;
  height: number;

  onGoal?: (teamScoredId: number) => void;
  goalWidth: number = 0;
  isPortrait: boolean = false;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  setGoalConfig(goalWidth: number, isPortrait: boolean, onGoal?: (teamId: number) => void) {
    this.goalWidth = goalWidth;
    this.isPortrait = isPortrait;
    this.onGoal = onGoal;
  }

  addEntity(entity: Entity) {
    this.entities.push(entity);
  }

  tick(dt: number) {
    // 1. Update velocities and friction
    for (const entity of this.entities) {
      entity.update(dt);
    }

    // 2. Sub-step position integration and collisions
    // TODO(Physics): Balance global physics values like mass, friction, and subSteps. Players are currently slowed down for playability.
    const subSteps = 8;
    for (let s = 0; s < subSteps; s++) {
      for (const entity of this.entities) {
        if (!entity.isStatic) {
          entity.pos = entity.pos.add(entity.vel.div(subSteps));
          this.checkBoundaryCollisions(entity);
        }
      }
      this.checkEntityCollisions();
    }
  }

  checkBoundaryCollisions(entity: Entity) {
    if (entity.isStatic) return;

    let inGoal = false;
    let goalDepth = 50; // Approximated for visual satisfaction if we let it bounce in the net, but we'll probably just trigger and reset.

    if (this.isPortrait) {
       // Goals are at y=0 and y=this.height
       if (this.goalWidth > 0 && Math.abs(entity.pos.x - this.width / 2) < this.goalWidth / 2) {
           inGoal = true;
       }
    } else {
       // Goals are at x=0 and x=this.width
       if (this.goalWidth > 0 && Math.abs(entity.pos.y - this.height / 2) < this.goalWidth / 2) {
           inGoal = true;
       }
    }

    // X bounds
    if (entity.pos.x - entity.radius < 0) {
      if (inGoal && !this.isPortrait) {
         if (entity.pos.x + entity.radius < -goalDepth) {
             entity.pos.x = -goalDepth + entity.radius;
             entity.vel.x *= -entity.restitution;
         }
         if (entity instanceof Ball && entity.pos.x + entity.radius < 0) {
             this.onGoal?.(1); // Team 1 scored on Team 0's goal
         }
      } else {
        entity.pos.x = entity.radius;
        entity.vel.x *= -entity.restitution;
      }
    } else if (entity.pos.x + entity.radius > this.width) {
      if (inGoal && !this.isPortrait) {
         if (entity.pos.x - entity.radius > this.width + goalDepth) {
             entity.pos.x = this.width + goalDepth - entity.radius;
             entity.vel.x *= -entity.restitution;
         }
         if (entity instanceof Ball && entity.pos.x - entity.radius > this.width) {
             this.onGoal?.(0); // Team 0 scored on Team 1's goal
         }
      } else {
        entity.pos.x = this.width - entity.radius;
        entity.vel.x *= -entity.restitution;
      }
    }

    // Y bounds
    if (entity.pos.y - entity.radius < 0) {
      if (inGoal && this.isPortrait) {
         if (entity.pos.y + entity.radius < -goalDepth) {
             entity.pos.y = -goalDepth + entity.radius;
             entity.vel.y *= -entity.restitution;
         }
         if (entity instanceof Ball && entity.pos.y + entity.radius < 0) {
             this.onGoal?.(0); // Team 0 (bottom) scored on Team 1 (top)'s goal
         }
      } else {
        entity.pos.y = entity.radius;
        entity.vel.y *= -entity.restitution;
      }
    } else if (entity.pos.y + entity.radius > this.height) {
      if (inGoal && this.isPortrait) {
         if (entity.pos.y - entity.radius > this.height + goalDepth) {
             entity.pos.y = this.height + goalDepth - entity.radius;
             entity.vel.y *= -entity.restitution;
         }
         if (entity instanceof Ball && entity.pos.y - entity.radius > this.height) {
             this.onGoal?.(1); // Team 1 (top) scored on Team 0 (bottom)'s goal
         }
      } else {
        entity.pos.y = this.height - entity.radius;
        entity.vel.y *= -entity.restitution;
      }
    }
  }

  checkEntityCollisions() {
    for (let i = 0; i < this.entities.length; i++) {
      for (let j = i + 1; j < this.entities.length; j++) {
        const e1 = this.entities[i];
        const e2 = this.entities[j];

        const distVec = e2.pos.sub(e1.pos);
        const distSq = distVec.magSq();
        const minRadius = e1.radius + e2.radius;

        if (distSq < minRadius * minRadius) {
          const dist = Math.sqrt(distSq);
          if (dist === 0) continue;

          // Penetration resolution
          const overlap = minRadius - dist;
          const normal = distVec.div(dist);

          const totalMass = e1.mass + e2.mass;
          const massRatio1 = e1.isStatic ? 0 : e2.isStatic ? 1 : e2.mass / totalMass;
          const massRatio2 = e2.isStatic ? 0 : e1.isStatic ? 1 : e1.mass / totalMass;

          if (!e1.isStatic) {
            e1.pos = e1.pos.sub(normal.mult(overlap * massRatio1));
          }
          if (!e2.isStatic) {
            e2.pos = e2.pos.add(normal.mult(overlap * massRatio2));
          }

          // Momentum resolution
          const relativeVel = e2.vel.sub(e1.vel);
          const velAlongNormal = relativeVel.dot(normal);

          // Do not resolve if velocities are separating
          if (velAlongNormal > 0) continue;

          const e = Math.min(e1.restitution, e2.restitution);
          let jMagnitude = -(1 + e) * velAlongNormal;
          
          let invMassSum = 0;
          if (!e1.isStatic) invMassSum += 1 / e1.mass;
          if (!e2.isStatic) invMassSum += 1 / e2.mass;

          if (invMassSum === 0) continue;

          jMagnitude /= invMassSum;

          const impulse = normal.mult(jMagnitude);

          if (!e1.isStatic) {
            e1.vel = e1.vel.sub(impulse.div(e1.mass));
          }
          if (!e2.isStatic) {
            e2.vel = e2.vel.add(impulse.div(e2.mass));
          }
        }
      }
    }
  }
}
