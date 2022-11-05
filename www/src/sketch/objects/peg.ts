import { PhysCirc } from "sketch/physics";
import processing from "p5";

class Peg extends PhysCirc {
  public opacity: number;
  constructor(x: number, y: number, r: number) {
    super(x, y, r, {isStatic: true});
    this.opacity = 0;
  }

  draw(p5: processing) {
    p5.fill(255, 255, 255, this.opacity);
    p5.noStroke();
    super.draw(p5);
  }
}

export default Peg;