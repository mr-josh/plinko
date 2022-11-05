import Ball from "./objects/ball";
import Bucket from "./objects/bucket";
import Peg from "./objects/peg";
import Wall from "./objects/wall";
import processing from "p5";
import { start } from "sketch/physics";
import PubSub from "./twitch/events";

const WALL_WIDTH = 100;
const WALL_OFFSET = 150;
const PEGS_PADDING = 250;
const PEGS_START = 200;
const X_PEGS = 14;
const Y_PEGS = 16;

const twitch = new PubSub();

const Sketch = (p5: processing) => {
  let queue: { amount: number; user: string; color: string }[] = [];
  let balls: Ball[] = [];
  let pegs: Peg[] = [];
  let buckets: Bucket[] = [];

  // This is the same as our `function setup() { ... }`
  p5.setup = () => {
    p5.createCanvas(1080, 1080);

    start(); // Start Physics

    // Create Walls
    new Wall(-WALL_WIDTH + WALL_OFFSET, 0, WALL_WIDTH, p5.height);
    new Wall(p5.width - WALL_OFFSET, 0, WALL_WIDTH, p5.height);

    // Create Buckets
    buckets.push(
      // new Bucket(p5.width / 4, p5.height - 50, 100, 100, 20),
      new Bucket((p5.width / 4) * 2, p5.height - 50, 100, 100, 20),
      // new Bucket((p5.width / 4) * 3, p5.height - 50, 100, 100, 20)
    );

    // Create Pegs
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

    setInterval(() => {
      if (queue.length > 0) {
        let { amount, user, color } = queue.shift()!;
        for (let i = 0; i < amount; i++) {
          balls.push(
            new Ball(
              p5.width / 2 + (Math.random() - 0.5) * 5,
              0,
              10,
              user,
              color
            )
          );
        }
      }
    }, 5000);

    twitch.addEventListener("redeem", (event) => {
      const { reward, user } = (event as CustomEvent).detail;
      const title: string = reward.title;


      if (!title.toLowerCase().startsWith("plinko")) return;
      if (isNaN(+title.split(" ")[1])) return;

      let total = +title.split(" ")[1];
      while (total > 0) {
        let amount = Math.min(total, 10);
        queue.push({
          amount,
          user: user.login,
          color: `rgb(${Math.floor(
            Math.max(Math.random() * 255, 200)
          )}, ${Math.floor(Math.max(Math.random() * 255, 200))}, ${Math.floor(
            Math.max(Math.random() * 255, 200)
          )})`,
        });
        total -= amount;
      }
    });
  };

  // This is the same as our `function draw() { ... }`
  p5.draw = () => {
    p5.clear(0, 0, 0, 0);

    for (const peg of pegs) {
      peg.draw(p5);

      for (const ball of balls) {
        if (peg.isCollidingWith(ball.matter)) {
          peg.opacity = 255;
        }
      }

      peg.opacity = Math.max(peg.opacity - 1, 0);
    }

    for (const ball in balls) {
      balls[ball].draw(p5);

      if (balls[ball].position.y > p5.height + 100) {
        balls[ball].remove();
        balls.splice(+ball, 1);
      }
    }

    for (const bucket of buckets) {
      bucket.draw(p5);

      for (const ball in balls) {
        if (bucket.isInBucket(balls[ball].matter)) {
          console.log(balls[ball].name, "in bucket");

          balls[ball].remove();
          balls.splice(+ball, 1);
        }
      }
    }
  };
};

export default Sketch;
