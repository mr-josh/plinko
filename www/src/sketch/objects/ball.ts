import { PhysCirc } from "sketch/physics";
import processing from "p5";

class Ball extends PhysCirc {
  public meta: {
    userId?: string;
    name?: string;
    color?: string | processing.Color;
  };

  constructor(
    x: number,
    y: number,
    r: number,
    meta: { userId?: string; name?: string; color?: string | processing.Color }
  ) {
    super(x, y, r, {
      mass: 10,
      friction: 0.1,
      frictionStatic: 0.5,
      frictionAir: 0.01,
      restitution: 0.9,
    });

    this.meta = meta;
  }

  draw(p5: processing) {
    let c: processing.Color;
    if (this.meta.color instanceof processing.Color) {
      c = this.meta.color;
    } else {
      c = p5.color(this.meta.color || "white");
    }
    p5.fill(c);
    super.draw(p5);
    if (this.meta.name) {
      p5.textStyle(p5.BOLD);
      p5.textSize(20);
      p5.text(this.meta.name, this.position.x, this.position.y - 10);
    }
  }
}

export default Ball;
