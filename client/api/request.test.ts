import { describe, expect, it, vi } from "vitest";

import type { ClientOptions } from "../types";
import { APIError } from "./error";
import { fetchCompletionsAPI, fetchEmbeddingsAPI } from "./request";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

const mockClientOptions: ClientOptions = {
  apiKey: "mockApiKey",
};

describe("fetchCompletionsAPI", () => {
  it("should return Response object when fetch successful", () => {
    mockFetch.mockReturnValueOnce(Promise.resolve(new Response("{}")));
    const res = fetchCompletionsAPI({}, mockClientOptions);
    expect(res).toBeInstanceOf(Promise<Response>);
  });

  it("should throw APIError when fetch failed", () => {
    mockFetch.mockReturnValueOnce(
      Promise.resolve(new Response("{}", { status: 400 })),
    );
    expect(fetchCompletionsAPI({}, mockClientOptions)).rejects.toBeInstanceOf(
      APIError,
    );
  });
});

describe("fetchEmbeddingsAPI", () => {
  it("should return Response object when fetch successful", () => {
    mockFetch.mockReturnValueOnce(Promise.resolve(new Response("{}")));
    const res = fetchEmbeddingsAPI({ input: "" }, mockClientOptions);
    expect(res).toBeInstanceOf(Promise<Response>);
  });

  it("should throw APIError when fetch failed", () => {
    mockFetch.mockReturnValueOnce(
      Promise.resolve(new Response("{}", { status: 400 })),
    );
    expect(
      fetchEmbeddingsAPI({ input: "" }, mockClientOptions),
    ).rejects.toBeInstanceOf(APIError);
  });
});
