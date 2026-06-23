import { Entity } from './Entity';

export class Ball extends Entity {
  constructor({
    id, x, y, radius = 12, mass = 0.8, restitution = 0.5, friction = 0.97, color = '#ffffff'
  }: any) {
    super({ id, x, y, radius, mass, restitution, friction, color, isStatic: false });
  }
}
