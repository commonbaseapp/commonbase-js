import { describe, expect, it } from "vitest";

import { CompletionResult } from "./completion-result";
import { CompletionResponse } from "./types";

const mockCompletionResponse: CompletionResponse = {
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
      function_call: {
        name: "function name",
        arguments: "function arguments",
      },
    },
  ],
};

const mockCompletionResult = new CompletionResult(mockCompletionResponse);

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

  it("should return first choice for bestChoice", () => {
    expect(mockCompletionResult.bestChoice.text).toBe("first choice");
  });

  it("should map choices array to string array", () => {
    expect(mockCompletionResult.choices.map((c) => c.text)).toEqual([
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
    expect(mockNullChoicesCompletionResult.bestChoice.text).toBe("");
  });

  it("should properly handle function call response", () => {
    expect(mockCompletionResult.choices[1].functionCall).toEqual({
      name: "function name",
      arguments: "function arguments",
    });
  });
});

describe("CompletionChoice", () => {
  it("should pass through raw props", () => {
    const choice = mockCompletionResult.choices[1];
    expect(choice.index).toBe(mockCompletionResponse.choices[1].index);
    expect(choice.text).toBe(mockCompletionResponse.choices[1].text);
    expect(choice.finishReason).toBe(
      mockCompletionResponse.choices[1].finish_reason,
    );
    expect(choice.role).toBeUndefined();
    expect(choice.functionCall).toEqual(
      mockCompletionResponse.choices[1].function_call,
    );
  });

  it("should properly create assistant message", () => {
    const message1 = mockCompletionResult.choices[0].toAssistantChatMessage();
    const message2 = mockCompletionResult.choices[1].toAssistantChatMessage();
    expect(message1).toEqual({
      role: "assistant",
      content: mockCompletionResponse.choices[0].text,
    });
    expect(message2).toEqual({
      role: "assistant",
      content: mockCompletionResponse.choices[1].text,
      function_call: mockCompletionResponse.choices[1].function_call,
    });
  });
});
