import { ChatClientOptions } from "./types";

async function startWebSocketSession(options: ChatClientOptions) {
  return new Promise<[WebSocket, string]>((resolve, reject) => {
    const ws = new WebSocket(
      "wss://api.commonbase.com/chats" +
        ("sessionId" in options && options.sessionId
          ? "/" + options.sessionId
          : ""),
    );

    function cleanup() {
      ws.removeEventListener("error", handleError);
      ws.removeEventListener("message", handleMessage);
    }

    const handleError = (error: unknown) => {
      reject(error);
      cleanup();
    };
    ws.addEventListener("error", handleError);

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
              resolve([ws, sessionId]);
            } else {
              reject("Missing sessionId");
            }
          }
          cleanup();
        }
      }
    };
    ws.addEventListener("message", handleMessage);

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

      ws.send(JSON.stringify(message));
      ws.removeEventListener("open", handleOpen);
    }
    ws.addEventListener("open", handleOpen);
  });
}

function calculateExponentialBackoffMs(attempt: number): number {
  const INTERVAL_MS = 100;
  const EXPONENTIAL = 1;
  return INTERVAL_MS * EXPONENTIAL ** attempt;
}

export class ChatClient {
  private _lastRequestId = 0;
  private _options: ChatClientOptions;

  private _webSocket: WebSocket | null = null;

  constructor(options: ChatClientOptions) {
    this._options = options;
  }

  // Since we only have one event atm, we can keep it simple
  private _openListeners = new Set<(sessionId: string) => void>();
  on(_eventName: "open", listener: (sessionId: string) => void) {
    this._openListeners.add(listener);
    return () => {
      this._openListeners.delete(listener);
    };
  }

  async start(): Promise<void> {
    let i = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const [webSocket, sessionId] = await startWebSocketSession(this._options);
      if (webSocket.readyState == WebSocket.OPEN) {
        this._webSocket = webSocket;
        for (const listener of this._openListeners) {
          listener(sessionId);
        }
        break;
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
    const ws = chatClient._webSocket;

    let isCancelled = false;
    return new ReadableStream({
      async start(controller) {
        const requestId = (chatClient._lastRequestId++).toString();

        function handleMessage(event: MessageEvent<string>) {
          if (isCancelled) {
            ws?.removeEventListener("message", handleMessage);
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
            ws?.removeEventListener("message", handleMessage);
            return;
          }

          if (msg.completed) {
            controller.close();
            ws?.removeEventListener("message", handleMessage);
          } else {
            controller.enqueue(msg.choices[0].text);
          }
        }

        ws?.addEventListener("message", handleMessage);
        ws?.send(JSON.stringify({ type: "chatMessage", requestId, content }));
      },
      cancel() {
        isCancelled = true;
        ws?.send(JSON.stringify({ type: "abort" }));
      },
    });
  };
}
