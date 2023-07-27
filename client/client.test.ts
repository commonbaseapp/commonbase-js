import { describe, expect, it, vi } from "vitest";

import { Client } from "./client";
import { CompletionResult } from "./completion-result";
import { StreamConsumer } from "./stream-consumer";

const { MOCK_FETCH_COMPLETIONS, MOCK_FETCH_EMBEDDINGS } = vi.hoisted(() => ({
  MOCK_FETCH_COMPLETIONS: vi.fn(),
  MOCK_FETCH_EMBEDDINGS: vi.fn(),
}));

vi.mock("./api/request", () => ({
  fetchCompletionsAPI: MOCK_FETCH_COMPLETIONS,
  fetchEmbeddingsAPI: MOCK_FETCH_EMBEDDINGS,
}));

describe("Client", () => {
  it("should return a CompletionResult from createCompletion", () => {
    MOCK_FETCH_COMPLETIONS.mockReturnValueOnce(
      Promise.resolve(new Response("{}")),
    );
    expect(new Client().createCompletion({})).resolves.toBeInstanceOf(
      CompletionResult,
    );
  });

  it("should return a StreamConsumer from createStreamingCompletion", () => {
    MOCK_FETCH_COMPLETIONS.mockReturnValueOnce(
      Promise.resolve(new Response("{}")),
    );
    expect(new Client().createStreamingCompletion({})).resolves.toBeInstanceOf(
      StreamConsumer,
    );
  });

  it("should throw error on empty body from createStreamingCompletion", () => {
    MOCK_FETCH_COMPLETIONS.mockReturnValueOnce(Promise.resolve(new Response()));
    expect(new Client().createStreamingCompletion({})).rejects.toEqual(
      new Error("no stream body"),
    );
  });

  it("should return response body json from createEmbedding", () => {
    const MOCK_RESPONSE = {
      key: "value",
    };
    MOCK_FETCH_EMBEDDINGS.mockReturnValueOnce(
      Promise.resolve(new Response(JSON.stringify(MOCK_RESPONSE))),
    );
    expect(new Client().createEmbedding({ input: "" })).resolves.toEqual(
      MOCK_RESPONSE,
    );
  });
});
