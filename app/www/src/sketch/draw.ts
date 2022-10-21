import { start, update } from "sketch/physics";

import processing from "p5";

const Sketch = (p5: processing) => {
  // This is the same as our `function setup() { ... }`
  p5.setup = () => {
    p5.createCanvas(400, 400);

    start(); // Start Physics
  };

  // This is the same as our `function draw() { ... }`
  p5.draw = () => {
    update(); // Update Physics

    p5.background("white");

    // Draw a circle rotating around the center of the canvas
    let x = Math.cos(p5.millis() / 500) * 100;
    let y = Math.sin(p5.millis() / 500) * 100;
    p5.circle(
      p5.width / 2 + x,
      p5.height / 2 + y,
      50
    );
  };
};

export default Sketch;
