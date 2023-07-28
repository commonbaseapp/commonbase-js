import { describe, expect, it } from "vitest";

import { CompletionResult } from "./completion-result";
import { StreamConsumer } from "./stream-consumer";
import type { CompletionResponse } from "./types";

const mockCompletionResponseText = `Lorem ipsum dolor sit amet, consectetur 
  adipiscing elit. Cras eu posuere justo. Donec vel facilisis velit, posuere
  molestie sapien. Etiam sollicitudin est sed massa accumsan accumsan. Vivamus 
  in nunc at tellus rhoncus cursus. Aenean nisi est, egestas eu lorem ut, 
  mattis feugiat lacus. Praesent nisl nibh, gravida mollis ipsum et, tempor 
  volutpat nulla.`;

/**
 * Splits mockCompletionResponseText into word chunks, then composes a
 * CompletionResponse object for each of these chunks.
 *
 * These responses are then encoded and streamed through a ReadableStream in the tests.
 */
export function getMockCompletionResponses(): CompletionResponse[] {
  const words = mockCompletionResponseText.split(" ");
  const responses = words.map((word, i) => ({
    completed: false,
    invocationId: "",
    projectId: "",
    type: "chat",
    model: "",
    choices: [
      {
        index: 0,
        finish_reason: i === words.length - 1 ? "stop" : null,
        text: i === words.length - 1 ? word : `${word} `,
      },
    ],
  }));
  return [
    ...responses,
    // The API sends down one last response that contains the full completion string.
    {
      completed: true,
      invocationId: "",
      projectId: "",
      type: "chat",
      model: "",
      choices: [
        {
          index: 0,
          finish_reason: "stop",
          text: mockCompletionResponseText,
        },
      ],
    },
  ];
}

const mockResponses: CompletionResponse[] = getMockCompletionResponses();

describe("StreamConsumer", () => {
  it("correctly parse stream data", async () => {
    const mockResponseStream = new ReadableStream<Uint8Array>({
      start(controller) {
        const encoder = new TextEncoder();
        for (const response of mockResponses) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(response)}\n\n`),
          );
        }
        controller.close();
      },
    });

    const consumer = new StreamConsumer(mockResponseStream);

    const resultsFromStream: CompletionResult[] = [];
    for await (const result of consumer) {
      resultsFromStream.push(result);
    }

    // Expect to get the exact same set of results back from the StreamConsumer
    expect(resultsFromStream.map((r) => r._raw)).toEqual(mockResponses);
  });

  it("throw error on invalid stream data", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode("data: this isn't json data\n\n"),
        );
        controller.close();
      },
    });
    const consumer = new StreamConsumer(stream);

    expect(async () => {
      for await (const result of consumer) {
        console.log(result);
      }
    }).rejects.toThrowError("invalid stream data: this isn't json data");
  });
});
