import { start, update } from "sketch/physics";

import Ball from "./objects/ball";
import Peg from "./objects/peg";
import Wall from "./objects/wall";
import processing from "p5";

const WALL_WIDTH = 100;
const PEGS_PADDING = 20;
const PEGS_START = 500;
const X_PEGS = 15;
const Y_PEGS = 11;

const Sketch = (p5: processing) => {
  let balls: Ball[] = [];
  let pegs: Peg[] = [];

  // This is the same as our `function setup() { ... }`
  p5.setup = () => {
    p5.createCanvas(608, 1080);

    start(); // Start Physics

    // Create walls
    new Wall(-WALL_WIDTH, 0, WALL_WIDTH, p5.height);
    new Wall(p5.width, 0, WALL_WIDTH, p5.height);
    new Wall(0, p5.height, p5.width, WALL_WIDTH);

    let pad = (p5.width - PEGS_PADDING * 2) / X_PEGS;
    for (let x = 0; x <= X_PEGS; x++) {
      for (let y = 0; y <= Y_PEGS; y++) {
        if (y % 2 == 0 && x > X_PEGS - 1) continue;

        pegs.push(
          new Peg(
            PEGS_PADDING + pad * x + (pad / 2) * ((y + 1) % 2),
            PEGS_START + pad * y,
            5
          )
        );
      }
    }
  };

  // This is the same as our `function draw() { ... }`
  p5.draw = () => {
    p5.clear(0, 0, 0, 0);

    for (const peg of pegs) {
      peg.draw(p5);
    }

    for (const ball of balls) {
      ball.draw(p5);
    }
  };

  p5.mouseDragged = () => {
    balls.push(new Ball(p5.mouseX, p5.mouseY, 10));
  };

  p5.keyPressed = (ev: KeyboardEvent) => {
    if (ev.key == " ") {
      for (const ball of balls) {
        if (ball.position.y > 950) continue;
        ball.velocity = {
          x: (Math.random() - 0.5) * 30,
          y: (Math.random() - 0.5) * 30,
        };
      }
    }
  };
};

export default Sketch;
