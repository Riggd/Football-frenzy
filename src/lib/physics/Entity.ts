import { Vector2 } from '../math/Vector2';

export class Entity {
  id: string;
  pos: Vector2;
  vel: Vector2;
  acc: Vector2;
  radius: number;
  mass: number;
  restitution: number;
  friction: number;
  color: string;
  isStatic: boolean;

  constructor({
    id = Math.random().toString(36).substring(2, 11),
    x = 0,
    y = 0,
    radius = 15,
    mass = 1,
    restitution = 0.8,
    friction = 0.98, // Velocity multiplier per tick
    color = '#00ffcc',
    isStatic = false,
  }) {
    this.id = id;
    this.pos = new Vector2(x, y);
    this.vel = new Vector2(0, 0);
    this.acc = new Vector2(0, 0);
    this.radius = radius;
    this.mass = mass;
    this.restitution = restitution;
    this.friction = friction;
    this.color = color;
    this.isStatic = isStatic;
  }

  applyForce(force: Vector2) {
    if (this.isStatic) return;
    const f = force.div(this.mass);
    this.acc = this.acc.add(f);
  }

  limitVelocity() {}

  update(dt: number) {
    if (this.isStatic) return;
    
    // Add acceleration to velocity
    this.vel = this.vel.add(this.acc);
    // Apply friction/damping
    this.vel = this.vel.mult(this.friction);
    
    this.limitVelocity();
    
    // We don't add to position here anymore, World will handle it to prevent tunneling
    // this.pos = this.pos.add(this.vel);
    
    // Reset acceleration
    this.acc = new Vector2(0, 0);
  }
}
