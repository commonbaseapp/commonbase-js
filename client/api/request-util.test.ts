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
  truncateVariable: {
    strategy: "truncate_head",
    granularity: "word",
    maxPromptTokens: 1,
    name: "name",
  },
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
  defaultVariables: {
    default1: "987",
    default2: "zyx",
  },
  defaultTruncateVariableConfig: {
    strategy: "off",
    granularity: "line",
    maxPromptTokens: 2,
    name: "from default client options",
  },
  _extraParams: {
    extraParam1: "extraParam",
  },
  _apiUrl: "https://new_api_url/",
  _extraHeaders: {
    extraHeader: "extraHeaderValue",
  },
};

describe("getCompletionBody", () => {
  it("formats body properly from config", () => {
    const body = getCompletionBody(mockCompletionConfig, {});

    expect(body).toEqual({
      projectId: mockCompletionConfig.projectId,
      userId: mockCompletionConfig.userId,
      prompt: mockCompletionConfig.prompt,
      context: mockCompletionConfig.chatContext,
      variables: mockCompletionConfig.variables,
      truncateVariable: mockCompletionConfig.truncateVariable,
      providerConfig: mockCompletionConfig.providerConfig,
    });
  });

  it("should apply default config from client options.", () => {
    const body = getCompletionBody({}, mockClientOptions);

    expect(body).toEqual({
      projectId: mockClientOptions.projectId,
      apiKey: mockClientOptions.apiKey,
      truncateVariable: mockClientOptions.defaultTruncateVariableConfig,
      ...mockClientOptions._extraParams,
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
      apiKey: mockClientOptions.apiKey,
      prompt: mockCompletionConfig.prompt,
      context: mockCompletionConfig.chatContext,
      truncateVariable: mockCompletionConfig.truncateVariable,
      variables: {
        ...mockClientOptions.defaultVariables,
        ...mockCompletionConfig.variables,
      },
      providerConfig: mockCompletionConfig.providerConfig,
      ...mockClientOptions._extraParams,
    });
  });
});

describe("getEmbeddingsBody", () => {
  it("formats body properly from config", () => {
    const body = getEmbeddingsBody(mockEmbeddingsConfig, {});

    expect(body).toEqual({
      projectId: mockEmbeddingsConfig.projectId,
      userId: mockEmbeddingsConfig.userId,
      input: mockEmbeddingsConfig.input,
      providerConfig: mockEmbeddingsConfig.providerConfig,
    });
  });

  it("should apply default config from client options.", () => {
    const config: EmbeddingsConfig = { input: "input" };
    const body = getEmbeddingsBody(config, mockClientOptions);

    expect(body).toEqual({
      ...config,
      projectId: mockClientOptions.projectId,
      apiKey: mockClientOptions.apiKey,
      ...mockClientOptions._extraParams,
    });
  });

  it("should overwrite/merge client options default with config", () => {
    const body = getEmbeddingsBody(mockEmbeddingsConfig, mockClientOptions);

    expect(body).toEqual({
      projectId: mockEmbeddingsConfig.projectId,
      apiKey: mockClientOptions.apiKey,
      userId: mockEmbeddingsConfig.userId,
      input: mockEmbeddingsConfig.input,
      providerConfig: mockEmbeddingsConfig.providerConfig,
      ...mockClientOptions._extraParams,
    });
  });
});

describe("getUrl", () => {
  it("should format url properly by default", () => {
    expect(getUrl("test-path")).toBe("https://api.commonbase.com/test-path");
  });

  it("should use _apiUrl from ClientOptions", () => {
    expect(getUrl("test-path", mockClientOptions)).toBe(
      `${mockClientOptions._apiUrl}/test-path`,
    );
  });
});

describe("getHeaders", () => {
  it("should always add json Content-Type header", () => {
    expect(getHeaders({})).toEqual({
      "Content-Type": "application/json; charset=utf-8",
    });
  });

  it("should add _extraHeaders from ClientOptions", () => {
    expect(getHeaders(mockClientOptions)).toEqual({
      ...mockClientOptions._extraHeaders,
      "Content-Type": "application/json; charset=utf-8",
    });
  });
});
