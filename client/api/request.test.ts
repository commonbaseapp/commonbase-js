import { describe, expect, it, vi } from "vitest";

import { APIError } from "./error";
import { fetchCompletionsAPI, fetchEmbeddingsAPI } from "./request";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("fetchCompletionsAPI", () => {
  it("should return Response object when fetch successful", () => {
    mockFetch.mockReturnValueOnce(Promise.resolve(new Response("{}")));
    const res = fetchCompletionsAPI({}, {});
    expect(res).toBeInstanceOf(Promise<Response>);
  });

  it("should throw APIError when fetch failed", () => {
    mockFetch.mockReturnValueOnce(
      Promise.resolve(new Response("{}", { status: 400 })),
    );
    expect(fetchCompletionsAPI({}, {})).rejects.toBeInstanceOf(APIError);
  });
});

describe("fetchEmbeddingsAPI", () => {
  it("should return Response object when fetch successful", () => {
    mockFetch.mockReturnValueOnce(Promise.resolve(new Response("{}")));
    const res = fetchEmbeddingsAPI({ input: "" }, {});
    expect(res).toBeInstanceOf(Promise<Response>);
  });

  it("should throw APIError when fetch failed", () => {
    mockFetch.mockReturnValueOnce(
      Promise.resolve(new Response("{}", { status: 400 })),
    );
    expect(fetchEmbeddingsAPI({ input: "" }, {})).rejects.toBeInstanceOf(
      APIError,
    );
  });
});
