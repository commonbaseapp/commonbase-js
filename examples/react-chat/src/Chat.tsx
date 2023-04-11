import "./Chat.css";

import { ChatClient } from "@commonbase/sdk";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import useLocalStorageState from "use-local-storage-state";

const projectId = "********-****-****-****-************";

export function Chat() {
  const [sessionId, setSessionId] = useLocalStorageState<string | undefined>(
    "sessionId",
    { defaultValue: undefined },
  );
  const [chatClient, setChatClient] = useState(
    () => new ChatClient({ projectId, sessionId }),
  );
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    chatClient.start();
    return chatClient.on("open", (sessionId) => {
      setSessionId(sessionId);
      setIsConnected(true);
    });
  }, [chatClient]);

  const [history, setHistory] = useLocalStorageState<string[]>(
    "history-" + sessionId,
    { defaultValue: [] },
  );

  const [inputValue, setInputValue] = useState("");

  const [reader, setReader] =
    useState<ReadableStreamDefaultReader<string> | null>(null);
  const [chunks, setChunks] = useState<string[]>([]);

  useEffect(() => {
    if (!reader) {
      return;
    }
    let shouldStop = false;
    (async () => {
      while (true) {
        const result = await reader.read();
        if (result.done) {
          break;
        }
        setChunks((chunks) => chunks.concat(result.value));
        if (shouldStop) {
          return;
        }
      }
      setReader(null);
    })();

    return () => {
      shouldStop = true;
    };
  }, [reader]);

  useEffect(() => {
    if (!reader && chunks.length > 0) {
      setHistory((history) => [...history, chunks.join("")]);
      setChunks([]);
    }
  }, [reader, chunks]);

  const handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (reader || !isConnected) {
      return;
    }

    setHistory((history) => [...history, inputValue]);
    setReader(chatClient.send(inputValue).getReader());
    setInputValue("");
  };

  return (
    <div className="chat-layout">
      <div className="indicator">
        {isConnected ? "🟢 Connected" : "🟠 Loading"}{" "}
        {sessionId && `(${sessionId.substring(0, 6)}...)`}
        <button
          title="Clear session"
          onClick={() => {
            setSessionId(undefined);
            setChatClient(new ChatClient({ projectId }));
            setIsConnected(false);
          }}
        >
          ❌
        </button>
      </div>
      <div className="feed-wrap">
        <div className="feed">
          {history.map((content, i) => (
            <div key={i} className="message">
              {content}
            </div>
          ))}
          {chunks.length > 0 && (
            <div className="message">
              {chunks.map((chunk, i) => (
                <span key={i} className="chunk">
                  {chunk}
                </span>
              ))}
            </div>
          )}
          {reader && (
            <button
              className="stop-button"
              onClick={() => {
                reader.cancel();
              }}
            >
              Stop responding
            </button>
          )}
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder={reader ? "Waiting for response..." : "Type a message..."}
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key == "Enter") {
              event.preventDefault();
              handleSubmit();
            }
          }}
        />
        <button>↩</button>
      </form>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Chat />
  </React.StrictMode>,
);
