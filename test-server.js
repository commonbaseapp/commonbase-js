const WebSocketClient = require("websocket").client;
async function main() {
  const client = new WebSocketClient();
  client.on("connectFailed", (error) => {
    console.log("Connect Error: " + error.toString());
  });
  client.on("connect", (connection) => {
    console.log("WebSocket Client Connected");
    connection.on("error", function (error) {
      console.log("Connection Error: " + error.toString());
    });
    connection.on("close", function () {
      console.log("Connection Closed");
      process.exit(1);
    });

    let sessionStarted = false;
    function startSession() {
      if (sessionStarted) {
        return;
      }
      sessionStarted = true;
      console.log("\nsession correctly initialized!");
      console.log("type \\info to get info about the current session");
      console.log("type \\x to abort the current response");
      console.log("type \\reset to reset and re-init the current session");
      console.log("you can start chatting now\n\n");
      //start repl
      process.stdin.on("data", (data) => {
        const input = data.toString().trim();
        if (input === "\\info") {
          connection.sendUTF(
            JSON.stringify({
              type: "info",
            }),
          );
          return;
        }
        if (input === "\\x") {
          connection.sendUTF(
            JSON.stringify({
              type: "abort",
            }),
          );
          return;
        }
        if (input === "\\reset") {
          connection.sendUTF(
            JSON.stringify({
              type: "reset",
            }),
          );
          return;
        }
        connection.sendUTF(
          JSON.stringify({
            type: "chatMessage",
            requestId: "1",
            content: data.toString(),
          }),
        );
      });
    }
    connection.on("message", function (message) {
      const msg = JSON.parse(message.utf8Data);
      if (msg.type === "ping") {
        // process.stdout.write(".");
        setTimeout(() => {
          connection.sendUTF(
            JSON.stringify({
              type: "ping",
            }),
          );
        }, 1000);
        return;
      }
      if (msg.type === "reset") {
        console.log("reset", msg);
        console.log("re-initializing session...");
        // send init message
        connection.sendUTF(
          JSON.stringify({
            type: "init",
            projectId: "d6af1d48-dead-49e8-aa37-cab03f0106c6",
            variables: {
              user: "Alice",
            },
            sessionData: {
              userId: "xoxoxo",
            },
          }),
        );
        return;
      }
      if (msg.type === "init") {
        if (msg.error) {
          console.log("init error", msg.error);
          return;
        }
        if (msg.initialized) {
          console.log("initialized", msg);
          startSession();
        }

        return;
      }
      if (msg.type === "info") {
        if (msg.error) {
          console.log("info error:", msg.error);
          console.log("resetting session...");
          connection.sendUTF(
            JSON.stringify({
              type: "reset",
            }),
          );
          return;
        }
        console.log("info", msg);
        startSession();
        return;
      }
      if (msg.type === "chatMessage") {
        if (msg.error) {
          console.log("chatMessage error:", msg.error);
          return;
        }
        if (msg.aborted) {
          process.stdout.write("...[ABORTED]\n\n");
          return;
        }
        if (msg.completed === false) {
          process.stdout.write(msg.choices[0].text);
          return;
        } else {
          // console.log("chatMessage", msg);
        }
        process.stdout.write("\n\n");
        return;
      }
      console.log(msg);
    });

    connection.sendUTF(
      JSON.stringify({
        type: "info",
      }),
    );

    // start pinging
    connection.sendUTF(
      JSON.stringify({
        type: "ping",
      }),
    );
  });
  client.connect(
    "wss://api.commonbase.com/chats/a034aa71ae72900820eca65341f684415f0146122fb96d6b3a06855af4e0e694",
  );
}

main().catch(console.error);
