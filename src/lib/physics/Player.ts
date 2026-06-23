import { Entity } from './Entity';
import { Vector2 } from '../math/Vector2';

export class Player extends Entity {
  team: number;
  isActive: boolean;
  maxSpeed: number;
  number: number;
  
  constructor({
    id, x, y, radius = 20, mass = 2, restitution = 0.5, friction = 0.9, color,
    team = 0, isActive = false, maxSpeed = 5, number = 1
  }: any) {
    super({ id, x, y, radius, mass, restitution, friction, color, isStatic: false });
    this.team = team;
    this.isActive = isActive;
    this.maxSpeed = maxSpeed;
    this.number = number;
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
