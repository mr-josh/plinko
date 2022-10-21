import {
  Bodies,
  Body,
  Collision,
  Composite,
  Engine,
  IBodyDefinition,
  IChamferableBodyDefinition,
  Runner,
} from "matter-js";

import processing from "p5";

const WORLD_SCALE = 5;

const engine = Engine.create({
  gravity: {
    scale: 0.001 * WORLD_SCALE,
    x: 0,
    y: 1,
  },
});

const start = () => {
  Runner.run(engine);
};

let hasWarned = false;
const update = () => {
  if (!hasWarned) {
    console.warn(
      "update() is no longer needed!\n",
      "Please remove update calls and its imports from your code as it will be removed in the next release."
    );
    hasWarned = true;
  }
};

// How to polymorph with ...arguments style syntax in typescript
// constructor(...args: ConstructorParameters<typeof ParentClass>) {
//   super(...args);
// }

class Phys {
  // Private Variables
  private lastPosition: { x: number; y: number };
  private lastAngle: number;

  // Public Variables
  public matter: Body;

  constructor(builder: () => Body) {
    this.matter = builder();

    this.lastPosition = this.matter.position;
    this.lastAngle = this.matter.angle;

    Composite.add(engine.world, this.matter);
  }

  get angle() {
    return this.matter.angle;
  }

  set angle(a: number) {
    if (this.matter.isStatic) {
      this.angularVelocity = -(this.lastAngle - a);
      this.lastAngle = a;
    }

    Body.setAngle(this.matter, a);
  }

  get position() {
    return {
      x: this.matter.position.x / WORLD_SCALE,
      y: this.matter.position.y / WORLD_SCALE,
    };
  }

  set position(pos: { x: number; y: number }) {
    if (this.matter.isStatic) {
      this.velocity = {
        x: -(this.lastPosition.x - pos.x),
        y: -(this.lastPosition.y - pos.y),
      };
      this.lastPosition = pos;
    }

    Body.setPosition(this.matter, {
      x: pos.x * WORLD_SCALE,
      y: pos.y * WORLD_SCALE,
    });
  }

  get velocity() {
    return this.matter.velocity;
  }

  set velocity(vel: { x: number; y: number }) {
    Body.setVelocity(this.matter, { x: vel.x, y: vel.y });
  }

  get angularVelocity() {
    return this.matter.angularVelocity;
  }

  set angularVelocity(v: number) {
    Body.setAngularVelocity(this.matter, v);
  }

  isCollidingWith(obj: Body): boolean {
    // @ts-ignore
    return Collision.collides(this.matter, obj);
  }

  draw(_: processing) {}
}

class PhysRect extends Phys {
  // Private Variable
  private width: number;
  private height: number;

  constructor(
    x: number,
    y: number,
    w: number,
    h: number,
    options?: IChamferableBodyDefinition
  ) {
    super(() =>
      Bodies.rectangle(
        (x + w / 2) * WORLD_SCALE,
        (y + h / 2) * WORLD_SCALE,
        w * WORLD_SCALE,
        h * WORLD_SCALE,
        options
      )
    );

    this.width = w;
    this.height = h;
  }

  get position() {
    return {
      x: ((this.matter.position.x / WORLD_SCALE) - this.width / 2),
      y: ((this.matter.position.y / WORLD_SCALE) - this.height / 2),
    };
  }

  set position(pos: { x: number; y: number }) {
    super.position = pos;
    Body.setPosition(this.matter, {
      x: (pos.x + this.width / 2) * WORLD_SCALE,
      y: (pos.y + this.height / 2) * WORLD_SCALE,
    });
  }

  get size() {
    return {
      w: this.width,
      h: this.height,
    };
  }

  draw(p5: processing) {
    p5.push();
    p5.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
    p5.rotate(this.angle);
    p5.rect(-this.width / 2, -this.height / 2, this.width, this.height);
    p5.pop();
  }
}

class PhysCirc extends Phys {
  private radius: number;

  constructor(x: number, y: number, r: number, options?: IBodyDefinition) {
    super(() =>
      Bodies.circle(x * WORLD_SCALE, y * WORLD_SCALE, r * WORLD_SCALE, options)
    );

    this.radius = r;
  }

  get size() {
    return this.radius;
  }

  draw(p5: processing) {
    p5.push();
    p5.translate(this.position.x, this.position.y);
    p5.rotate(this.matter.angle);
    p5.circle(0, 0, this.radius * 2);
    p5.line(0, 0, this.radius, 0);
    p5.pop();
  }
}

export { start, update, Phys, PhysRect, PhysCirc };
