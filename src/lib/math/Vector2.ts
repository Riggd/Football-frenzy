export class Vector2 {
  constructor(public x: number, public y: number) {}

  add(v: Vector2): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  sub(v: Vector2): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  mult(n: number): Vector2 {
    return new Vector2(this.x * n, this.y * n);
  }

  div(n: number): Vector2 {
    return new Vector2(this.x / n, this.y / n);
  }

  mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  magSq(): number {
    return this.x * this.x + this.y * this.y;
  }

  normalize(): Vector2 {
    const m = this.mag();
    if (m !== 0) {
      return this.div(m);
    }
    return new Vector2(0, 0);
  }

  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }
  
  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }
}
