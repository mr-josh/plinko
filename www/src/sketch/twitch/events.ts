class PubSub extends EventTarget {
  private ws: WebSocket;
  private pingInterval: number | null;

  constructor() {
    super();
    this.pingInterval = null;
    this.ws = new WebSocket("wss://pubsub-edge.twitch.tv");
    this.configureWs();
  }

  ping() {
    this.ws.send(JSON.stringify({ type: "PING" }));
  }

  // 194798269
  configureWs = () => {
    this.ws.onopen = () => {
      this.ping();
      this.pingInterval = setInterval(this.ping, 60 * 5 * 1000);

      this.ws.send(
        JSON.stringify({
          type: "LISTEN",
          data: {
            topics: [
              "community-points-channel-v1.194798269",
              // "community-bits-events-v2.194798269",
              // "community-subscribe-events-v1.194798269"
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
            // case "community-bits-events-v2.194798269":
            //   let bits = JSON.parse(data.data.message);

            //   this.dispatchEvent(
            //     new CustomEvent("bits", {
            //       detail: {
            //         bits: bits.data.bits_used,
            //         user: {
            //           anon: bits.data.is_anonymous,
            //           id: bits.data.user_id,
            //           login: bits.data.user_name,
            //         },
            //       },
            //     })
            //   );
            //   break;
            // case "community-subscribe-events-v1.194798269":
            //   let subs = JSON.parse(data.data.message);

            //   this.dispatchEvent(
            //     new CustomEvent("subs", {
            //       detail: {
            //         subs: subs.data.bits_used,
            //         user: {
            //           anon: subs.data.is_anonymous,
            //           id: subs.data.user_id,
            //           login: subs.data.user_name,
            //         },
            //       },
            //     })
            //   );
            //   break;
          }
          break;
      }
    };

    this.ws.onclose = () => {
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
        this.pingInterval = null;
      }
    };
  };
}

export default PubSub;
