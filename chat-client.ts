import { ChatClientOptions } from "./types";

async function startWebSocketSession(options: ChatClientOptions) {
  return new Promise<[WebSocket, string]>((resolve, reject) => {
    const wsClient = new WebSocket(
      "wss://api.commonbase.com/chats" +
        ("sessionId" in options && options.sessionId
          ? "/" + options.sessionId
          : ""),
    );

    function cleanup() {
      wsClient.removeEventListener("error", handleError);
      wsClient.removeEventListener("message", handleMessage);
    }

    const handleError = (error: unknown) => {
      reject(error);
      cleanup();
    };
    wsClient.addEventListener("error", handleError);

    const handleMessage = (event: MessageEvent<string>): void => {
      const msg = JSON.parse(event.data);
      if (msg.type === "init" || msg.type == "info") {
        if (msg.error) {
          handleError(msg.error);
          return;
        }
        if (msg.initialized) {
          if (msg.error && msg.initialized !== 0) {
            reject(msg.error);
          } else {
            const sessionId =
              msg.sessionId ?? ("sessionId" in options && options.sessionId);
            if (sessionId) {
              resolve([wsClient, sessionId]);
            } else {
              reject("Missing sessionId");
            }
          }
          cleanup();
        }
      }
    };
    wsClient.addEventListener("message", handleMessage);

    function handleOpen() {
      const message =
        "sessionId" in options && options.sessionId
          ? { type: "info" }
          : {
              type: "init",
              projectId: options.projectId,
              variables: "variables" in options ? options.variables : {},
              sessionData:
                "INSECURE_sessionData" in options
                  ? options.INSECURE_sessionData
                  : "sessionData" in options
                  ? options.sessionData
                  : {},
            };

      wsClient.send(JSON.stringify(message));
      wsClient.removeEventListener("open", handleOpen);
    }
    wsClient.addEventListener("open", handleOpen);
  });
}

function calculateExponentialBackoffMs(attempt: number): number {
  const INTERVAL_MS = 100;
  const EXPONENTIAL = 1;
  return INTERVAL_MS * EXPONENTIAL ** attempt;
}

export class ChatClient {
  sessionId: string;

  private webSocket: WebSocket;
  private _lastRequestId = 0;

  private constructor(webSocketClient: WebSocket, sessionId: string) {
    this.webSocket = webSocketClient;
    this.sessionId = sessionId;
  }

  static async start(options: ChatClientOptions): Promise<ChatClient> {
    let i = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const [webSocketClient, sessionId] = await startWebSocketSession(options);
      if (webSocketClient.readyState == WebSocket.OPEN) {
        return new ChatClient(webSocketClient, sessionId);
      }
      await new Promise((resolve) =>
        setTimeout(resolve, calculateExponentialBackoffMs(i)),
      );
      i++;
    }
  }

  send = (content: string): ReadableStream<string> => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const chatClient = this;

    let isCancelled = false;
    return new ReadableStream({
      async start(controller) {
        const requestId = (chatClient._lastRequestId++).toString();

        function handleMessage(event: MessageEvent<string>) {
          if (isCancelled) {
            chatClient.webSocket.removeEventListener("message", handleMessage);
            return;
          }

          const msg = JSON.parse(event.data);

          if (msg.type !== "chatMessage" || msg.requestId !== requestId) {
            return;
          }
          if (msg.error) {
            controller.error(msg.error);
            return;
          }
          if (msg.aborted) {
            controller.close();
            chatClient.webSocket.removeEventListener("message", handleMessage);
            return;
          }

          if (msg.completed) {
            controller.close();
            chatClient.webSocket.removeEventListener("message", handleMessage);
          } else {
            controller.enqueue(msg.choices[0].text);
          }
        }

        chatClient.webSocket.addEventListener("message", handleMessage);
        chatClient.webSocket.send(
          JSON.stringify({ type: "chatMessage", requestId, content }),
        );
      },
      cancel() {
        isCancelled = true;
        chatClient.webSocket.send(JSON.stringify({ type: "abort" }));
      },
    });
  };
}
