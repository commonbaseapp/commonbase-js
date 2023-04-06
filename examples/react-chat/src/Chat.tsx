import "./Chat.css";

import { ChatClient } from "@commonbase/sdk";
import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";

export function Chat() {
  const chatClient = useMemo(
    () =>
      new ChatClient({
        // ********-****-****-****-************
        projectId: "f08b8d16-340e-4467-aaea-4d2eaf2d59dc",
        // sessionId: localStorage.getItem("sessionId") || undefined,
      }),
    [],
  );

  const [inputValue, setInputValue] = useState("");

  const [history, setHistory] = useState<string[]>([]);

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

    if (reader) {
      return;
    }

    setHistory((history) => [...history, inputValue]);
    setReader(chatClient.send(inputValue).getReader());
    setInputValue("");

    if (history.length == 0) {
      chatClient.getSessionId().then((sessionId) => {
        localStorage.setItem("sessionId", sessionId);
      });
    }
  };

  return (
    <div className="chat-layout">
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
