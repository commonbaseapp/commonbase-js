import { describe, expect, it } from "vitest";

import { CompletionResult } from "./completion-result";

const mockCompletionResult = new CompletionResult({
  completed: true,
  projectId: "",
  invocationId: "",
  type: "",
  model: "",
  choices: [
    {
      text: "first choice",
      index: 0,
      finish_reason: null,
    },
    {
      text: "second choice",
      index: 0,
      finish_reason: null,
    },
  ],
});

const mockEmptyCompletionResult = new CompletionResult({
  completed: true,
  projectId: "",
  invocationId: "",
  type: "",
  model: "",
  choices: [],
});

describe("CompletionResult", () => {
  it("should pass through completed flag", () => {
    expect(mockCompletionResult.completed).toBe(true);
  });

  it("should return first choice for bestResult", () => {
    expect(mockCompletionResult.bestResult).toBe("first choice");
  });

  it("should map choices array to string array", () => {
    expect(mockCompletionResult.choices).toEqual([
      "first choice",
      "second choice",
    ]);
  });

  it("should return empty array if choices is empty", () => {
    expect(mockEmptyCompletionResult.choices.length).toBe(0);

    const mockNullChoicesCompletionResult = new CompletionResult({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      choices: null,
    });

    // Test null choices parameter.
    expect(mockNullChoicesCompletionResult.choices).toBeInstanceOf(Array);
    expect(mockNullChoicesCompletionResult.bestResult).toBe("");
  });
});
