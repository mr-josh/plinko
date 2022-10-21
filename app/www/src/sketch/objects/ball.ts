import { PhysCirc } from "sketch/physics";

class Ball extends PhysCirc {
  constructor(x: number, y: number, r: number) {
    super(x, y, r, {
      mass: 10,
      friction: 0.1,
      frictionStatic: 0.5,
      frictionAir: 0.01,
      restitution: 0.9
    });
  }
}

export default Ball;
