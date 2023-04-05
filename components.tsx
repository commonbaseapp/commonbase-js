import { useEffect, useRef, useState } from "react";

import { StreamingChatResponse } from "./chat-client";

export function StreamingText({
  response,
}: {
  response: StreamingChatResponse;
}) {
  const [chunks, setChunks] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const textRef = useRef<HTMLDivElement>(null);
  const fadedChunks = chunks.map((chunk, i) => (
    <span style={{ opacity: i < index ? 1 : 0 }} key={i}>
      {chunk}
    </span>
  ));

  useEffect(
    () => response.on("chunk", () => setChunks(response.chunks.slice())),
    [response],
  );

  /**
   * Handle resets and buffer size changes.
   */
  useEffect(() => {
    if (index >= chunks.length) {
      setIndex(chunks.length);
    }
  }, [chunks.length, index]);

  useEffect(() => {
    const textElement = textRef.current;
    if (!textElement) return;

    const spanElements = textElement.getElementsByTagName("span");
    if (spanElements.length <= index) return;

    const lastSpan = spanElements[index];
    if (!lastSpan) return;

    const animation = lastSpan.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 200,
      easing: "cubic-bezier(0.7, 0, 0.84, 0)",
    });

    animation.onfinish = () => {
      lastSpan.style.opacity = "1";
    };

    setIndex(index + 1);
  }, [chunks, index]);

  if (!chunks.join("").trim()) {
    return null;
  }

  return <div ref={textRef}>{fadedChunks}</div>;
}
