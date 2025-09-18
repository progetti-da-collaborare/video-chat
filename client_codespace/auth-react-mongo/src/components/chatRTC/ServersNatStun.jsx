const serversNatStun = {
      iceServers: [
          {
            urls: "stun:stun.relay.metered.ca:80",
          },
          {
            urls: "turn:standard.relay.metered.ca:80",
            username: "b93da36ca91c3c2554a59bf1",
            credential: "55gk14o9CWOvrAC1",
          },
          {
            urls: "turn:standard.relay.metered.ca:80?transport=tcp",
            username: "b93da36ca91c3c2554a59bf1",
            credential: "55gk14o9CWOvrAC1",
          },
          {
            urls: "turn:standard.relay.metered.ca:443",
            username: "b93da36ca91c3c2554a59bf1",
            credential: "55gk14o9CWOvrAC1",
          },
          {
            urls: "turns:standard.relay.metered.ca:443?transport=tcp",
            username: "b93da36ca91c3c2554a59bf1",
            credential: "55gk14o9CWOvrAC1",
          },
      ],
      iceCandidatePoolSize: 10
  }

export default serversNatStun