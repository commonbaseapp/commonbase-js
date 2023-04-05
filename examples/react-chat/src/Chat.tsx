import "./Chat.css";

import { ChatClient, StreamingChatResponse } from "@commonbase/sdk";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

function StreamingMessage({ response }: { response: StreamingChatResponse }) {
  const [chunks, setChunks] = useState<string[]>([]);

  useEffect(
    () =>
      response?.on("chunk", () => {
        setChunks(response.chunks.slice());
      }),
    [response],
  );

  if (chunks.length == 0) {
    return null;
  }

  return (
    <div className="message">
      {chunks.map((chunk, i) => (
        <span key={i} className="chunk">
          {chunk}
        </span>
      ))}
    </div>
  );
}

export function Chat() {
  const [chatClient] = useState(
    () => new ChatClient({ projectId: "xxx-xxx-xxx-xxx-xxx" }),
  );

  const [inputValue, setInputValue] = useState("");

  const [history, setHistory] = useState<string[]>([]);
  const [response, setResponse] = useState<StreamingChatResponse | null>(null);

  useEffect(
    () =>
      response?.on("completed", () => {
        setHistory((history) => [...history, response.chunks.join("")]);
        setResponse(null);
      }),
    [response],
  );

  const handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setHistory((history) => [...history, inputValue]);
    setResponse(chatClient.send(inputValue));
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
          {response && <StreamingMessage response={response} />}
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder={
            response ? "Waiting for response..." : "Type a message..."
          }
          disabled={!!response}
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key == "Enter") {
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
