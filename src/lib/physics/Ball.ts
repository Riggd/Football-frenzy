import { Entity } from './Entity';

export class Ball extends Entity {
  constructor({
    id, x, y, radius = 12, mass = 0.8, restitution = 0.9, friction = 0.99, color = '#ffffff'
  }: any) {
    super({ id, x, y, radius, mass, restitution, friction, color, isStatic: false });
  }
}
