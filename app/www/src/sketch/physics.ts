import {
  Bodies,
  Body,
  Collision,
  Composite,
  Engine,
  IBodyDefinition,
  IChamferableBodyDefinition,
} from "matter-js";

import processing from "p5";

const engine = Engine.create();

let lu: number;
const start = () => {
  lu = performance.now();
};

const update = () => {
  let dt = performance.now() - lu;
  Engine.update(engine, dt);
  lu = performance.now();
};

// How to polymorph with ...arguments style syntax in typescript
// constructor(...args: ConstructorParameters<typeof ParentClass>) {
//   super(...args);
// }

class Phys {
  // Private Variables
  private lastPosition: {x: number, y: number};
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
      x: this.matter.position.x,
      y: this.matter.position.y,
    };
  }

  set position(pos: { x: number; y: number }) {
    if (this.matter.isStatic) {
      this.velocity = { x: -(this.lastPosition.x - pos.x), y: -(this.lastPosition.y - pos.y) };
      this.lastPosition = pos;
    }

    Body.setPosition(this.matter, {
      x: pos.x,
      y: pos.y,
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
    super(() => Bodies.rectangle(x + w / 2, y + h / 2, w, h, options));

    this.width = w;
    this.height = h;
  }

  get position() {
    return {
      x: this.matter.position.x - this.width / 2,
      y: this.matter.position.y - this.height / 2,
    };
  }

  set position(pos: { x: number; y: number }) {
    super.position = pos;
    Body.setPosition(this.matter, {
      x: pos.x + this.width / 2,
      y: pos.y + this.height / 2,
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
    p5.translate(this.matter.position.x, this.matter.position.y);
    p5.rotate(this.matter.angle);
    p5.rect(-this.width / 2, -this.height / 2, this.width, this.height);
    p5.pop();
  }
}

class PhysCirc extends Phys {
  private radius: number;

  constructor(x: number, y: number, r: number, options?: IBodyDefinition) {
    super(() => Bodies.circle(x, y, r, options));

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
