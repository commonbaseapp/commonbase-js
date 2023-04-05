import memoizeOne from "memoize-one";

import { ClientOptions } from "./types";

const initializeWSClient = memoizeOne(async (projectId: string) => {
  return new Promise<WebSocket>((resolve, reject) => {
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
  });
});

function calculateExponentialBackoffMs(attempt: number): number {
  const INTERVAL_MS = 100;
  const EXPONENTIAL = 1;
  return INTERVAL_MS * EXPONENTIAL ** attempt;
}

class _StreamingChatResponse {
  isCompleted = false;
  chunks: string[] = [];

  constructor(
    startStream: (events: {
      onChunk: (chunk: string) => void;
      onCompleted: () => void;
    }) => void,
  ) {
    startStream({
      onChunk: (chunk) => {
        this.chunks.push(chunk);
        this.listeners.chunk.forEach((f) => f());
      },
      onCompleted: () => {
        this.isCompleted = true;
        this.listeners.completed.forEach((f) => f());
      },
    });
  }

  private listeners = Object.fromEntries(
    (["chunk", "completed"] as const).map((key) => [key, new Set()]),
  ) as Record<"chunk" | "completed", Set<() => void>>;
  on(eventName: keyof typeof this.listeners, listener: () => void) {
    this.listeners[eventName].add(listener);
    return () => {
      this.listeners[eventName].delete(listener);
    };
  }
}
export type StreamingChatResponse = InstanceType<typeof _StreamingChatResponse>;

export class ChatClient {
  private options: ClientOptions;
  constructor(options: ClientOptions = {}) {
    this.options = options || {};
  }

  private async getWebSocketClient() {
    let i = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const webSocketClient = await initializeWSClient(this.options.projectId!);
      if (webSocketClient.readyState == WebSocket.OPEN) {
        return webSocketClient;
      }
      initializeWSClient.clear();
      await new Promise((resolve) =>
        setTimeout(resolve, calculateExponentialBackoffMs(i)),
      );
      i++;
    }
  }

  private lastRequestId = 0;
  send = (content: string): StreamingChatResponse =>
    new _StreamingChatResponse(async ({ onChunk, onCompleted }) => {
      const wsClient = await this.getWebSocketClient();
      const requestId = (this.lastRequestId++).toString();

      function handleMessage(event: MessageEvent<string>) {
        const msg = JSON.parse(event.data);

        if (msg.type !== "chatMessage" || msg.requestId !== requestId) {
          return;
        }
        if (msg.error) {
          console.error("chatMessage error:", msg.error);
          return;
        }
        if (msg.aborted) {
          // TODO
          return;
        }
        if (msg.completed) {
          onCompleted();
          wsClient.removeEventListener("message", handleMessage);
        } else {
          onChunk(msg.choices[0].text);
        }
      }

      wsClient.addEventListener("message", handleMessage);
      wsClient.send(
        JSON.stringify({ type: "chatMessage", requestId, content }),
      );
    });
}
