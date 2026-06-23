import { Entity } from './Entity';
import { Vector2 } from '../math/Vector2';
import { PlayerStats } from '../../data/teams';

export class Player extends Entity {
  team: number;
  isActive: boolean;
  maxSpeed: number;
  number: number;
  stats: PlayerStats;
  
  constructor({
    id, x, y, radius = 20, mass = 3, restitution = 0.2, friction = 0.88, color,
    team = 0, isActive = false, maxSpeed = 5, number = 1,
    stats = { shotPower: 80, sprintSpeed: 80, recoverySpeed: 80 }
  }: any) {
    super({ id, x, y, radius, mass, restitution, friction, color, isStatic: false });
    this.team = team;
    this.isActive = isActive;
    // Map sprintSpeed 0-100 to maxSpeed 2.5-5.5
    this.maxSpeed = 2.5 + (stats.sprintSpeed / 100) * 3.0;
    this.number = number;
    this.stats = stats;
  }
  
  limitVelocity() {
    const speedSq = this.vel.magSq();
    // If velocity is very high, apply extra drag instead of hard capping
    // This allows the dash to fling the player and then naturally slow down
    if (speedSq > this.maxSpeed * this.maxSpeed) {
       // Only hard cap if acceleration is small (regular joystick steering)
       // If acceleration is huge (dash force is ~100), we let them fly!
       if (this.acc.magSq() < 100) {
           // We are not dashing, so smoothly bring it back down to max speed
           // or just apply strong drag
           this.vel = this.vel.mult(0.8);
       } else {
           // Dashing, strong drag so they don't fly forever
           this.vel = this.vel.mult(0.92);
       }
    }
  }
}
