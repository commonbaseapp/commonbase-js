import memoizeOne from "memoize-one";

import { ClientOptions } from "./types";

function calculateExponentialBackoffMs(attempt: number): number {
  const INTERVAL_MS = 100;
  const EXPONENTIAL = 1;
  return INTERVAL_MS * EXPONENTIAL ** attempt;
}

export class ChatClient {
  private options: ClientOptions;
  constructor(options: ClientOptions = {}) {
    this.options = options || {};
  }

  private initializeWebSocketClient = memoizeOne(
    async (projectId: string) =>
      new Promise<WebSocket>((resolve, reject) => {
        const wsClient = new WebSocket("wss://api.commonbase.com/chats");

        function cleanup() {
          wsClient.removeEventListener("error", handleError);
          wsClient.removeEventListener("message", handleMessage);
        }

        const handleError = (error: Event) => {
          reject(error);
          cleanup();
        };
        wsClient.addEventListener("error", handleError);

        const handleMessage = (event: MessageEvent<string>): void => {
          const msg = JSON.parse(event.data);
          if (msg.type === "init") {
            if (msg.error) {
              reject(msg.error);
              cleanup();
              return;
            }
            if (msg.initialized) {
              if (msg.error) {
                reject(msg.error);
              } else {
                resolve(wsClient);
              }
              cleanup();
            }
          }
        };
        wsClient.addEventListener("message", handleMessage);

        function handleOpen() {
          wsClient.send(JSON.stringify({ type: "init", projectId }));
          wsClient.removeEventListener("open", handleOpen);
        }
        wsClient.addEventListener("open", handleOpen);
      }),
  );

  private async getWebSocketClient() {
    let i = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const webSocketClient = await this.initializeWebSocketClient(
        this.options.projectId!,
      );
      if (webSocketClient.readyState == WebSocket.OPEN) {
        return webSocketClient;
      }
      this.initializeWebSocketClient.clear();
      await new Promise((resolve) =>
        setTimeout(resolve, calculateExponentialBackoffMs(i)),
      );
      i++;
    }
  }

  private lastRequestId = 0;
  send = (content: string): ReadableStream<string> => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const chatClient = this;
    return new ReadableStream({
      async start(controller) {
        const wsClient = await chatClient.getWebSocketClient();
        const requestId = (chatClient.lastRequestId++).toString();

        function handleMessage(event: MessageEvent<string>) {
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
            wsClient.removeEventListener("message", handleMessage);
            return;
          }

          if (msg.completed) {
            controller.close();
            wsClient.removeEventListener("message", handleMessage);
          } else {
            controller.enqueue(msg.choices[0].text);
          }
        }

        wsClient.addEventListener("message", handleMessage);
        wsClient.send(
          JSON.stringify({ type: "chatMessage", requestId, content }),
        );
      },
      // cancel() {},
    });
  };
}
