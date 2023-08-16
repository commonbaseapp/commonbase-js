import { describe, expect, it } from "vitest";

import type {
  ClientOptions,
  CompletionConfig,
  EmbeddingsConfig,
} from "../types";
import {
  getCompletionBody,
  getEmbeddingsBody,
  getHeaders,
  getUrl,
} from "./request-util";

const mockCompletionConfig: Required<CompletionConfig> = {
  projectId: "projectId",
  userId: "userId",
  prompt: "prompt",
  chatContext: {
    messages: [{ role: "user", content: "content" }],
  },
  variables: {
    test1: "123",
    test2: "abc",
  },
  providerApiKey: "openaiApiKey",
  providerConfig: {
    provider: "openai",
    params: {
      type: "chat",
    },
  },
};

const mockEmbeddingsConfig: Required<EmbeddingsConfig> = {
  projectId: "projectId",
  userId: "userId",
  input: "input",
  providerApiKey: "openaiApiKey",
  providerConfig: {
    provider: "openai",
    params: {
      type: "embeddings",
    },
  },
};

type MockClientOptionsConfig = Required<ClientOptions>;
const mockClientOptions: MockClientOptionsConfig = {
  projectId: "newProjectIdFromOptions",
  apiKey: "apiKeyFromOptions",
};

describe("getCompletionBody", () => {
  it("formats body properly from config", () => {
    const body = getCompletionBody(mockCompletionConfig, { apiKey: "apiKey" });

    expect(body).toEqual({
      projectId: mockCompletionConfig.projectId,
      userId: mockCompletionConfig.userId,
      prompt: mockCompletionConfig.prompt,
      context: mockCompletionConfig.chatContext,
      variables: mockCompletionConfig.variables,
      providerConfig: {
        ...mockCompletionConfig.providerConfig,
        apiKey: undefined,
      },
    });
  });

  it("should apply default config from client options.", () => {
    const body = getCompletionBody({ prompt: "" }, mockClientOptions);

    expect(body).toEqual({
      projectId: mockClientOptions.projectId,
      prompt: "",
    });

    // If 'variables' is not set in the config, then the client's
    // options.defaultVariables is ignored.
    expect(body.variables).toBeUndefined();
  });

  it("should overwrite/merge client options default with config", () => {
    const body = getCompletionBody(mockCompletionConfig, mockClientOptions);

    expect(body).toEqual({
      projectId: mockCompletionConfig.projectId,
      userId: mockCompletionConfig.userId,
      prompt: mockCompletionConfig.prompt,
      context: mockCompletionConfig.chatContext,
      variables: mockCompletionConfig.variables,
      providerConfig: {
        ...mockCompletionConfig.providerConfig,
        apiKey: undefined,
      },
    });
  });
});

describe("getEmbeddingsBody", () => {
  it("formats body properly from config", () => {
    const body = getEmbeddingsBody(mockEmbeddingsConfig, { apiKey: "apiKey" });

    expect(body).toEqual({
      projectId: mockEmbeddingsConfig.projectId,
      userId: mockEmbeddingsConfig.userId,
      input: mockEmbeddingsConfig.input,
      providerConfig: {
        ...mockEmbeddingsConfig.providerConfig,
        apiKey: undefined,
      },
    });
  });

  it("should apply default config from client options.", () => {
    const config: EmbeddingsConfig = { input: "input" };
    const body = getEmbeddingsBody(config, mockClientOptions);

    expect(body).toEqual({
      ...config,
      projectId: mockClientOptions.projectId,
    });
  });

  it("should overwrite/merge client options default with config", () => {
    const body = getEmbeddingsBody(mockEmbeddingsConfig, mockClientOptions);

    expect(body).toEqual({
      projectId: mockEmbeddingsConfig.projectId,
      userId: mockEmbeddingsConfig.userId,
      input: mockEmbeddingsConfig.input,
      providerConfig: {
        ...mockEmbeddingsConfig.providerConfig,
        apiKey: undefined,
      },
    });
  });
});

describe("getUrl", () => {
  it("should format url properly", () => {
    expect(getUrl("test-path")).toBe("https://api.commonbase.com/test-path");
  });
});

describe("getHeaders", () => {
  it("should add json Content-Type and Authorization header", () => {
    expect(getHeaders({ apiKey: "apiKey" }, mockCompletionConfig)).toEqual({
      Authorization: "apiKey",
      "Provider-API-Key": mockCompletionConfig.providerApiKey,
      "Content-Type": "application/json; charset=utf-8",
      "User-Agent": "commonbase-js/0.0.0",
    });
  });
});
