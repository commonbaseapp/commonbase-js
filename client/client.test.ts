import { describe, expect, it, vi } from "vitest";

import { Client } from "./client";
import { CompletionResult } from "./completion-result";
import { StreamConsumer } from "./stream-consumer";

const { mockFetchCompletions, mockFetchEmbeddings } = vi.hoisted(() => ({
  mockFetchCompletions: vi.fn(),
  mockFetchEmbeddings: vi.fn(),
}));

vi.mock("./api/request", () => ({
  fetchCompletionsAPI: mockFetchCompletions,
  fetchEmbeddingsAPI: mockFetchEmbeddings,
}));

describe("Client", () => {
  it("should return a CompletionResult from createCompletion", () => {
    mockFetchCompletions.mockReturnValueOnce(
      Promise.resolve(new Response("{}")),
    );
    expect(new Client().createCompletion({})).resolves.toBeInstanceOf(
      CompletionResult,
    );
  });

  it("should return a StreamConsumer from createStreamingCompletion", () => {
    mockFetchCompletions.mockReturnValueOnce(
      Promise.resolve(new Response("{}")),
    );
    expect(new Client().createStreamingCompletion({})).resolves.toBeInstanceOf(
      StreamConsumer,
    );
  });

  it("should throw error on empty body from createStreamingCompletion", () => {
    mockFetchCompletions.mockReturnValueOnce(Promise.resolve(new Response()));
    expect(new Client().createStreamingCompletion({})).rejects.toEqual(
      new Error("no stream body"),
    );
  });

  it("should return response body json from createEmbedding", () => {
    const mockResponse = {
      key: "value",
    };
    mockFetchEmbeddings.mockReturnValueOnce(
      Promise.resolve(new Response(JSON.stringify(mockResponse))),
    );
    expect(new Client().createEmbedding({ input: "" })).resolves.toEqual(
      mockResponse,
    );
  });
});
