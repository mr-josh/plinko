import { PhysRect } from "sketch/physics";

class Wall extends PhysRect {
  constructor(x: number, y: number, w: number, h: number) {
    super(x, y, w, h, {isStatic: true});
  }
}

export default Wall;