import "./Chat.css";

import {
  ChatClient,
  StreamingChatResponse,
  StreamingText,
} from "@commonbase/sdk";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

export function Chat() {
  const [chatClient] = useState(
    () =>
      new ChatClient({
        // projectId: "xxx-xxx-xxx-xxx-xxx",
        projectId: "d6af1d48-dead-49e8-aa37-cab03f0106c6",
      }),
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
      <div className="feed">
        {history.map((content, i) => (
          <div key={i} className="message">
            {content}
          </div>
        ))}
        {response && (
          <div className="message">
            <StreamingText response={response} />
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
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
