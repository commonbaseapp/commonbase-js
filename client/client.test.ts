import { describe, expect, it, vi } from "vitest";

import { Client } from "./client";
import { CompletionResult } from "./completion-result";
import { StreamConsumer } from "./stream-consumer";
import { ClientOptions } from "./types";

const { mockFetchCompletions, mockFetchEmbeddings } = vi.hoisted(() => ({
  mockFetchCompletions: vi.fn(),
  mockFetchEmbeddings: vi.fn(),
}));

const mockClientOptions: ClientOptions = {
  apiKey: "mockApiKey",
};

vi.mock("./api/request", () => ({
  fetchCompletionsAPI: mockFetchCompletions,
  fetchEmbeddingsAPI: mockFetchEmbeddings,
}));

describe("Client", () => {
  it("should throw an error on missing API Key", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => new Client()).throws(
      "A Commonbase API Key is required for all requests.",
    );
    expect(() => new Client({ apiKey: "  " })).throws(
      "A Commonbase API Key is required for all requests.",
    );
  });

  it("should return a CompletionResult from createCompletion", () => {
    mockFetchCompletions.mockReturnValueOnce(
      Promise.resolve(new Response("{}")),
    );
    expect(
      new Client(mockClientOptions).createCompletion({ prompt: "" }),
    ).resolves.toBeInstanceOf(CompletionResult);
  });

  it("should return a StreamConsumer from streamCompletion", () => {
    mockFetchCompletions.mockReturnValueOnce(
      Promise.resolve(new Response("{}")),
    );
    expect(
      new Client(mockClientOptions).streamCompletion({ prompt: "" }),
    ).resolves.toBeInstanceOf(StreamConsumer);
  });

  it("should throw error on empty body from sCompletion", () => {
    mockFetchCompletions.mockReturnValueOnce(Promise.resolve(new Response()));
    expect(
      new Client(mockClientOptions).streamCompletion({ prompt: "" }),
    ).rejects.toEqual(new Error("no stream body"));
  });

  it("should return response body json from createEmbedding", () => {
    const mockResponse = {
      key: "value",
    };
    mockFetchEmbeddings.mockReturnValueOnce(
      Promise.resolve(new Response(JSON.stringify(mockResponse))),
    );
    expect(
      new Client(mockClientOptions).createEmbedding({ input: "" }),
    ).resolves.toEqual(mockResponse);
  });
});
