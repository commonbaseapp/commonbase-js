import "./Chat.css";

import { ChatClient } from "@commonbase/sdk";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

export function Chat() {
  const [chatClient] = useState(
    () => new ChatClient({ projectId: "f08b8d16-340e-4467-aaea-4d2eaf2d59dc" }),
  );

  const [inputValue, setInputValue] = useState("");

  const [history, setHistory] = useState<string[]>([]);

  const [stream, setStream] = useState<ReturnType<
    typeof chatClient.send
  > | null>(null);
  const [chunks, setChunks] = useState<string[]>([]);

  useEffect(() => {
    if (!stream) {
      return;
    }
    let shouldExit = false;
    const reader = stream.getReader();
    (async () => {
      while (true) {
        const result = await reader.read();
        if (result.done) {
          break;
        }
        setChunks((chunks) => chunks.concat(result.value));
        if (shouldExit) {
          return;
        }
      }
      setStream(null);
    })();

    return () => {
      shouldExit = true;
      reader.releaseLock();
    };
  }, [stream]);

  useEffect(() => {
    if (!stream && chunks.length > 0) {
      setHistory((history) => [...history, chunks.join("")]);
      setChunks([]);
    }
  }, [stream, chunks]);

  const handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (stream) {
      return;
    }

    setHistory((history) => [...history, inputValue]);
    setStream(chatClient.send(inputValue));
    setInputValue("");
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
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder={stream ? "Waiting for response..." : "Type a message..."}
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
