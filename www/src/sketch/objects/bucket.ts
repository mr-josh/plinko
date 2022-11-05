import { Body } from "matter-js";
import { PhysRect } from "sketch/physics";
import processing from "p5";

class Bucket {
  private walls: PhysRect[];
  private sensor: PhysRect;
  constructor(x: number, y: number, w: number, h: number, t: number = 10) {
    this.walls = [
      new PhysRect(x - w / 2 - t / 2, y - h / 2, t, h, { isStatic: true }),
      new PhysRect(x + w / 2 - t / 2, y - h / 2, t, h, { isStatic: true }),
      new PhysRect(x - w / 2, y + h / 2 - t, w, t, { isStatic: true }),
    ];

    this.sensor = new PhysRect(x - w / 2 + t / 2, y - h / 2, w - t, h - t, {
      isStatic: true,
      isSensor: true,
    });
  }

  isInBucket(body: Body) {
    return this.sensor.isCollidingWith(body);
  }

  draw(p5: processing) {
    p5.fill("black");
    this.walls.forEach((wall) => wall.draw(p5));
    p5.fill(200, 220, 240, 100);
    this.sensor.draw(p5);
  }
}

export default Bucket;
