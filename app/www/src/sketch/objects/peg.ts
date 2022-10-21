import { PhysCirc } from "sketch/physics";

class Peg extends PhysCirc {
  constructor(x: number, y: number, r: number) {
    super(x, y, r, {isStatic: true});
  }
}

export default Peg ;