import { Client } from "tmi.js";

class PubSub extends EventTarget {
  private ws: WebSocket;
  private tmi: Client;
  private pingInterval: number | null;

  constructor() {
    super();
    // Configure TMI
    this.tmi = new Client({
      channels: ["dotmrjosh"],
    });

    this.tmi.connect();

    this.tmi.on("cheer", (_channel, userstate, _message) => {
      this.dispatchEvent(
        new CustomEvent("bits", {
          detail: {
            bits: userstate.bits,
            user: {
              id: userstate["user-id"],
              name: userstate.username,
            },
          },
        })
      );
    });

    // Configure PubSub
    this.pingInterval = null;
    this.ws = new WebSocket("wss://pubsub-edge.twitch.tv");
    this.configureWs();
  }

  ping() {
    this.ws.send(JSON.stringify({ type: "PING" }));
  }

  // dotmrjosh userId: 194798269
  configureWs() {
    this.ws.onopen = () => {
      this.ping();
      this.pingInterval = setInterval(
        this.ping.bind(this),
        60 * 5 * 1000 + Math.random()
      );

      this.ws.send(
        JSON.stringify({
          type: "LISTEN",
          data: {
            topics: [
              "video-playback-by-id.194798269",
              "community-points-channel-v1.194798269",
            ],
          },
        })
      );
    };

    this.ws.onmessage = (event) => {
      let data = JSON.parse(event.data);
      switch (data.type) {
        case "RECONNECT":
          this.ws.close();
          break;
        case "RESPONSE":
          if (data.error) {
            console.error(data.error);
          }
          break;
        case "MESSAGE":
          switch (data.data.topic) {
            case "community-points-channel-v1.194798269":
              let points = JSON.parse(data.data.message);
              if (points.type != "reward-redeemed") return;

              this.dispatchEvent(
                new CustomEvent("redeem", {
                  detail: {
                    reward: points.data.redemption.reward,
                    user: points.data.redemption.user,
                  },
                })
              );
              break;
          }
          break;
      }
    };

    this.ws.onclose = () => {
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
        this.pingInterval = null;
      }

      setTimeout(() => {
        console.log("Reconnecting...");
        this.ws = new WebSocket("wss://pubsub-edge.twitch.tv");
        this.configureWs();
      }, 1000 + Math.random() * 100);
    };
  }
}

export default PubSub;
