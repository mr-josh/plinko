import { PhysCirc } from "sketch/physics";
import processing from "p5";

class Ball extends PhysCirc {
  private color: string | undefined;

  public name: string | undefined;

  constructor(x: number, y: number, r: number, name?: string, color?: string) {
    super(x, y, r, {
      mass: 10,
      friction: 0.1,
      frictionStatic: 0.5,
      frictionAir: 0.01,
      restitution: 0.9,
    });

    this.name = name;
    this.color = color;
  }

  draw(p5: processing) {
    p5.fill(this.color || "white");
    super.draw(p5);
    if (this.name) {
      p5.textStyle(p5.BOLD);
      p5.textSize(20);
      p5.text(this.name, this.position.x, this.position.y - 10);
    }
  }
}

export default Ball;
