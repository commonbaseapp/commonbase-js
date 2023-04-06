import memoizeOne from "memoize-one";

import { ChatClientOptions } from "./types";

function calculateExponentialBackoffMs(attempt: number): number {
  const INTERVAL_MS = 100;
  const EXPONENTIAL = 1;
  return INTERVAL_MS * EXPONENTIAL ** attempt;
}

export class ChatClient {
  private _options: ChatClientOptions;
  private _lastRequestId = 0;

  constructor(options: ChatClientOptions) {
    this._options = options;
  }

  private initializeWebSocketClient = memoizeOne(async (projectId: string) => {
    const { _options: options } = this;
    return new Promise<WebSocket>((resolve, reject) => {
      const wsClient = new WebSocket(
        "wss://api.commonbase.com/chats" +
          (options.sessionId ? "/" + options.sessionId : ""),
      );

      function cleanup() {
        wsClient.removeEventListener("error", handleError);
        wsClient.removeEventListener("message", handleMessage);
      }

      const handleError = (error: unknown) => {
        // reject(error);
        // cleanup();
      };
      wsClient.addEventListener("error", handleError);

      const handleMessage = (event: MessageEvent<string>): void => {
        const msg = JSON.parse(event.data);
        if (msg.type === "init") {
          if (msg.error) {
            handleError(msg.error);
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
        wsClient.send(
          JSON.stringify({
            type: "init",
            projectId,
            variables: options.variables,
            sessionData:
              "INSECURE_sessionData" in options
                ? options.INSECURE_sessionData
                : "sessionData" in options
                ? options.sessionData
                : {},
          }),
        );
        wsClient.removeEventListener("open", handleOpen);
      }
      wsClient.addEventListener("open", handleOpen);
    });
  });

  private async getWebSocketClient() {
    let i = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const webSocketClient = await this.initializeWebSocketClient(
        this._options.projectId,
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

  private _sessionId: string | undefined = undefined;
  async getSessionId(): Promise<string> {
    if (this._options.sessionId) {
      return this._options.sessionId;
    }

    const wsClient = await this.getWebSocketClient();

    const requestId = (this._lastRequestId++).toString();

    return new Promise((resolve) => {
      const handleMessage = (event: MessageEvent<string>) => {
        const msg = JSON.parse(event.data);

        if (msg.type == "info" || msg.requestId == requestId) {
          this._sessionId = msg.sessionId as string;
          wsClient.removeEventListener("message", handleMessage);
          resolve(this._sessionId);
        }
      };
      wsClient.addEventListener("message", handleMessage);
      wsClient.send(JSON.stringify({ type: "info", requestId }));
    });
  }

  send = (content: string): ReadableStream<string> => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const chatClient = this;

    let isCancelled = false;
    let wsClient: WebSocket | undefined = undefined;
    return new ReadableStream({
      async start(controller) {
        wsClient = await chatClient.getWebSocketClient();
        const requestId = (chatClient._lastRequestId++).toString();

        function handleMessage(event: MessageEvent<string>) {
          if (isCancelled) {
            wsClient?.removeEventListener("message", handleMessage);
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
            wsClient?.removeEventListener("message", handleMessage);
            return;
          }

          if (msg.completed) {
            controller.close();
            wsClient?.removeEventListener("message", handleMessage);
          } else {
            controller.enqueue(msg.choices[0].text);
          }
        }

        wsClient.addEventListener("message", handleMessage);
        wsClient.send(
          JSON.stringify({ type: "chatMessage", requestId, content }),
        );
      },
      cancel() {
        isCancelled = true;
        wsClient?.send(JSON.stringify({ type: "abort" }));
      },
    });
  };
}
