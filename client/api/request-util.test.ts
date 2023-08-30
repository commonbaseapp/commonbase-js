import { describe, expect, it } from "vitest";

import type {
  ChatCompletionConfig,
  ClientOptions,
  EmbeddingsConfig,
  TextCompletionConfig,
} from "../types";
import {
  getCompletionBody,
  getDefaultProviderModel,
  getEmbeddingsBody,
  getHeaders,
  getUrl,
} from "./request-util";

const mockCompletionTextConfig: Required<TextCompletionConfig> = {
  projectId: "projectId",
  userId: "userId",
  prompt: "prompt",
  variables: {
    test1: "123",
    test2: "abc",
  },
  providerApiKey: "openaiApiKey",
  provider: "openai",
  providerModel: "model",
  providerParams: {
    n: 5,
  },
};

const mockCompletionChatConfig: Required<ChatCompletionConfig> = {
  projectId: "projectId",
  userId: "userId",
  messages: [{ role: "user", content: "content" }],
  variables: {
    test1: "123",
    test2: "abc",
  },
  functions: [
    {
      name: "function name",
      description: "function description",
      parameters: {
        test: "test",
      },
    },
  ],
  functionCall: "auto",
  provider: "cb-openai-eu",
  providerModel: "model",
  providerParams: {
    n: 1,
  },
};

const mockEmbeddingsConfig: Required<EmbeddingsConfig> = {
  projectId: "projectId",
  userId: "userId",
  input: "input",
  providerApiKey: "openaiApiKey",
  provider: "openai",
  providerModel: "model",
  providerParams: {
    n: 10,
  },
};

type MockClientOptionsConfig = Required<ClientOptions>;
const mockClientOptions: MockClientOptionsConfig = {
  projectId: "newProjectIdFromOptions",
  apiKey: "apiKeyFromOptions",
};

describe("getCompletionBody", () => {
  it("formats body properly from text config", () => {
    const body = getCompletionBody(
      mockCompletionTextConfig,
      { apiKey: "apiKey" },
      "text",
    );

    expect(body).toEqual({
      projectId: mockCompletionTextConfig.projectId,
      userId: mockCompletionTextConfig.userId,
      prompt: mockCompletionTextConfig.prompt,
      variables: mockCompletionTextConfig.variables,
      providerConfig: {
        provider: mockCompletionTextConfig.provider,
        params: {
          type: "text",
          model: mockCompletionTextConfig.providerModel,
          ...mockCompletionTextConfig.providerParams,
        },
      },
    });
  });

  it("formats body properly from chat config", () => {
    const body = getCompletionBody(
      mockCompletionChatConfig,
      { apiKey: "apiKey" },
      "text",
    );

    expect(body).toEqual({
      projectId: mockCompletionChatConfig.projectId,
      userId: mockCompletionChatConfig.userId,
      messages: mockCompletionChatConfig.messages,
      functions: mockCompletionChatConfig.functions,
      functionCall: mockCompletionChatConfig.functionCall,
      providerConfig: {
        provider: mockCompletionChatConfig.provider,
        params: {
          type: "text",
          model: mockCompletionChatConfig.providerModel,
          ...mockCompletionChatConfig.providerParams,
        },
      },
      variables: mockCompletionChatConfig.variables,
    });
  });

  it("should apply default config and provider.", () => {
    const body = getCompletionBody({ prompt: "" }, mockClientOptions, "chat");

    expect(body).toEqual({
      projectId: mockClientOptions.projectId,
      prompt: "",
      providerConfig: {
        provider: "cb-openai-eu",
        params: {
          type: "chat",
          model: "gpt-3.5-turbo",
        },
      },
    });

    // If 'variables' is not set in the config, then the client's
    // options.defaultVariables is ignored.
    expect(body.variables).toBeUndefined();
  });

  it("should default to cb-openai-us and gpt-4 with functions", () => {
    const config: ChatCompletionConfig = {
      ...mockCompletionChatConfig,
    };
    delete config.provider;
    delete config.providerModel;
    delete config.providerParams;
    const body = getCompletionBody(config, mockClientOptions, "chat");

    expect(body).toEqual({
      projectId: mockCompletionChatConfig.projectId,
      userId: mockCompletionChatConfig.userId,
      messages: mockCompletionChatConfig.messages,
      functions: mockCompletionChatConfig.functions,
      functionCall: mockCompletionChatConfig.functionCall,
      providerConfig: {
        provider: "cb-openai-us",
        params: {
          type: "chat",
          model: "gpt-4",
        },
      },
      variables: mockCompletionChatConfig.variables,
    });
  });

  it("should overwrite/merge client options default with config", () => {
    const body = getCompletionBody(
      mockCompletionTextConfig,
      mockClientOptions,
      "text",
    );

    expect(body).toEqual({
      projectId: mockCompletionTextConfig.projectId,
      userId: mockCompletionTextConfig.userId,
      prompt: mockCompletionTextConfig.prompt,
      variables: mockCompletionTextConfig.variables,
      providerConfig: {
        provider: mockCompletionTextConfig.provider,
        params: {
          type: "text",
          model: mockCompletionTextConfig.providerModel,
          ...mockCompletionTextConfig.providerParams,
        },
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
        provider: mockEmbeddingsConfig.provider,
        params: {
          type: "embeddings",
          model: mockEmbeddingsConfig.providerModel,
          ...mockEmbeddingsConfig.providerParams,
        },
      },
    });
  });

  it("should apply default config from client options.", () => {
    const config: EmbeddingsConfig = { input: "input" };
    const body = getEmbeddingsBody(config, mockClientOptions);

    expect(body).toEqual({
      ...config,
      projectId: mockClientOptions.projectId,
      providerConfig: {
        provider: "cb-openai-eu",
        params: {
          model: "text-embeddings-ada-002",
          type: "embeddings",
        },
      },
    });
  });

  it("should overwrite/merge client options default with config", () => {
    const body = getEmbeddingsBody(mockEmbeddingsConfig, mockClientOptions);

    expect(body).toEqual({
      projectId: mockEmbeddingsConfig.projectId,
      userId: mockEmbeddingsConfig.userId,
      input: mockEmbeddingsConfig.input,
      providerConfig: {
        provider: mockEmbeddingsConfig.provider,
        params: {
          type: "embeddings",
          model: mockEmbeddingsConfig.providerModel,
          ...mockEmbeddingsConfig.providerParams,
        },
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
    expect(getHeaders({ apiKey: "apiKey" }, mockCompletionTextConfig)).toEqual({
      Authorization: "apiKey",
      "Provider-API-Key": mockCompletionTextConfig.providerApiKey,
      "Content-Type": "application/json; charset=utf-8",
      "User-Agent": "commonbase-js/0.0.0",
    });
  });
});

describe("getDefaultProviderModel", () => {
  it("should return claude-v1 for anthropic provider", () => {
    expect(getDefaultProviderModel("anthropic", "chat", false)).toBe(
      "claude-v1",
    );
  });
  it("should throw error on invalid provider", () => {
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getDefaultProviderModel("invalid" as any, "chat", false),
    ).toThrowError("Unable to determine default provider model.");
  });
  it("should use gpt-4 with functions", () => {
    expect(getDefaultProviderModel("cb-openai-us", "chat", true)).toBe("gpt-4");
  });
});
