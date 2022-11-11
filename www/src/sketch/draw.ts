import Ball from "./objects/ball";
import Bucket from "./objects/bucket";
import Peg from "./objects/peg";
import Wall from "./objects/wall";
import processing from "p5";
import { start } from "sketch/physics";
import PubSub from "./twitch/events";

const POCKETBASE_URL = "http://pocketbase.here/api";
const QUEUE_TIMER = 500;
const QUEUE_TIMER_MAX = 2000;
const CHUNK_MAX = {
  CHANNEL_POINTS: 10,
  BITS: 50,
};
const WALL_WIDTH = 100;
const WALL_OFFSET = 150;
const PEGS_PADDING = 250;
const PEGS_START = 200;
const X_PEGS = 14;
const Y_PEGS = 16;

const twitch = new PubSub();

const Sketch = (p5: processing) => {
  let queue: {
    type?: "points" | "bits" | "subs";
    amount: number;
    userId: string;
    name: string;
    color: string | processing.Color;
  }[] = [];
  let balls: Ball[] = [];
  let pegs: Peg[] = [];
  let buckets: Bucket[] = [];

  // This is the same as our `function setup() { ... }`
  p5.setup = () => {
    p5.createCanvas(1080, 1080);
    p5.colorMode(p5.HSL, 360, 100, 100, 100);

    start(); // Start Physics

    // Create Walls
    new Wall(-WALL_WIDTH + WALL_OFFSET, 0, WALL_WIDTH, p5.height);
    new Wall(p5.width - WALL_OFFSET, 0, WALL_WIDTH, p5.height);

    // Create Buckets
    buckets.push(
      // new Bucket(p5.width / 4, p5.height - 50, 100, 100, 20),
      new Bucket((p5.width / 4) * 2, p5.height - 50, 100, 100, 20)
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

    // Drop balls from queue
    const queueHandler = () => {
      if (queue.length > 0) {
        let { type, amount, userId, name, color } = queue.shift()!;
        for (let i = 0; i < amount; i++) {
          balls.push(
            new Ball(p5.width / 2 + (Math.random() - 0.5) * 200, 0, 10, {
              type,
              userId,
              name,
              color,
            })
          );
        }
      }
      setTimeout(
        queueHandler,
        Math.min(QUEUE_TIMER + balls.length * 100, QUEUE_TIMER_MAX)
      );
    };
    queueHandler();

    // Listen for channel points
    twitch.addEventListener("redeem", (event) => {
      const { reward, user } = (event as CustomEvent).detail;
      const title: string = reward.title;
      const fullAmount = +title.split(" ")[1];

      if (!title.toLowerCase().startsWith("plinko")) return;
      if (isNaN(+title.split(" ")[1])) return;

      let total = +title.split(" ")[1];
      while (total > 0) {
        let amount = Math.min(total, CHUNK_MAX.CHANNEL_POINTS);
        let c = p5.color(
          Math.floor(Math.random() * 360),
          Math.min(fullAmount * 5, 100),
          90
        );

        queue.push({
          type: "points",
          amount,
          userId: user.id,
          name: user.login,
          color: c,
        });
        total -= amount;
      }
    });

    // Listen for bits
    twitch.addEventListener("bits", (event) => {
      const { bits, user } = (event as CustomEvent).detail;

      let total = bits * 5;
      while (total > 0) {
        let amount = Math.min(total, CHUNK_MAX.BITS);
        queue.push({
          type: "bits",
          amount,
          userId: user.id,
          name: user.name,
          color: `#fcba3f`,
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
    }

    for (const ball in balls) {
      if (balls[ball].position.y > p5.height + 100) {
        balls[ball].remove();
        balls.splice(+ball, 1);
      }
    }

    for (const bucket of buckets) {
      bucket.draw(p5);

      for (const ball in balls) {
        if (bucket.isInBucket(balls[ball].matter)) {
          if (!balls[ball].meta.type) {
            fetch(`${POCKETBASE_URL}/collections/plinko/records`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_id: balls[ball].meta.userId,
                user_display: balls[ball].meta.name,
                type: balls[ball].meta.type,
                time_scored: new Date().toISOString(),
              }),
            });
          }

          balls[ball].remove();
          balls.splice(+ball, 1);
        }
      }
    }
  };

  p5.keyPressed = (ev: KeyboardEvent) => {
    if (ev.key != " ") return;
    const testAmount = 10;

    let c = p5.color(
      Math.floor(Math.random() * 360),
      Math.min(testAmount * 5, 100),
      90
    );

    queue.push({
      amount: testAmount,
      userId: "test",
      name: "test",
      color: c,
    });
  };
};

export default Sketch;
