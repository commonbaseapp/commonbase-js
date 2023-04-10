import "./Chat.css";

import { ChatClient } from "@commonbase/sdk";
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import useLocalStorageState from "use-local-storage-state";

function useChatClient(sessionId?: string): ChatClient | null {
  const [chatClient, setChatClient] = useState<ChatClient | null>(null);
  const isStartingRef = useRef(false);

  useEffect(() => {
    if (
      isStartingRef.current ||
      (chatClient && chatClient.sessionId == sessionId)
    ) {
      return;
    }
    isStartingRef.current = true;
    ChatClient.start({
      projectId: "********-****-****-****-************",
      sessionId,
    }).then((chatClient) => {
      isStartingRef.current = false;
      setChatClient(chatClient);
    });
  }, [sessionId]);

  return chatClient;
}

export function Chat() {
  const [sessionId, setSessionId] = useLocalStorageState<string | undefined>(
    "sessionId",
    { defaultValue: undefined },
  );
  const chatClient = useChatClient(sessionId);
  useEffect(() => {
    if (chatClient) {
      setSessionId(chatClient.sessionId);
    }
  }, [chatClient]);

  const [history, setHistory] = useLocalStorageState<string[]>(
    "history-" + chatClient?.sessionId,
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

    if (reader || !chatClient) {
      return;
    }

    setHistory((history) => [...history, inputValue]);
    setReader(chatClient.send(inputValue).getReader());
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
