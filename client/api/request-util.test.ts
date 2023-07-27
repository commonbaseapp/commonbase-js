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

const MOCK_COMPLETION_CONFIG: Required<CompletionConfig> = {
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

const MOCK_EMBEDDINGS_CONFIG: Required<EmbeddingsConfig> = {
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
const MOCK_CLIENT_OPTIONS: MockClientOptionsConfig = {
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
    const body = getCompletionBody(MOCK_COMPLETION_CONFIG, {});

    expect(body).toEqual({
      projectId: MOCK_COMPLETION_CONFIG.projectId,
      userId: MOCK_COMPLETION_CONFIG.userId,
      prompt: MOCK_COMPLETION_CONFIG.prompt,
      context: MOCK_COMPLETION_CONFIG.chatContext,
      variables: MOCK_COMPLETION_CONFIG.variables,
      truncateVariable: MOCK_COMPLETION_CONFIG.truncateVariable,
      providerConfig: MOCK_COMPLETION_CONFIG.providerConfig,
    });
  });

  it("should apply default config from client options.", () => {
    const body = getCompletionBody({}, MOCK_CLIENT_OPTIONS);

    expect(body).toEqual({
      projectId: MOCK_CLIENT_OPTIONS.projectId,
      apiKey: MOCK_CLIENT_OPTIONS.apiKey,
      truncateVariable: MOCK_CLIENT_OPTIONS.defaultTruncateVariableConfig,
      ...MOCK_CLIENT_OPTIONS._extraParams,
    });

    // If 'variables' is not set in the config, then the client's
    // options.defaultVariables is ignored.
    expect(body.variables).toBeUndefined();
  });

  it("should overwrite/merge client options default with config", () => {
    const body = getCompletionBody(MOCK_COMPLETION_CONFIG, MOCK_CLIENT_OPTIONS);

    expect(body).toEqual({
      projectId: MOCK_COMPLETION_CONFIG.projectId,
      userId: MOCK_COMPLETION_CONFIG.userId,
      apiKey: MOCK_CLIENT_OPTIONS.apiKey,
      prompt: MOCK_COMPLETION_CONFIG.prompt,
      context: MOCK_COMPLETION_CONFIG.chatContext,
      truncateVariable: MOCK_COMPLETION_CONFIG.truncateVariable,
      variables: {
        ...MOCK_CLIENT_OPTIONS.defaultVariables,
        ...MOCK_COMPLETION_CONFIG.variables,
      },
      providerConfig: MOCK_COMPLETION_CONFIG.providerConfig,
      ...MOCK_CLIENT_OPTIONS._extraParams,
    });
  });
});

describe("getEmbeddingsBody", () => {
  it("formats body properly from config", () => {
    const body = getEmbeddingsBody(MOCK_EMBEDDINGS_CONFIG, {});

    expect(body).toEqual({
      projectId: MOCK_EMBEDDINGS_CONFIG.projectId,
      userId: MOCK_EMBEDDINGS_CONFIG.userId,
      input: MOCK_EMBEDDINGS_CONFIG.input,
      providerConfig: MOCK_EMBEDDINGS_CONFIG.providerConfig,
    });
  });

  it("should apply default config from client options.", () => {
    const config: EmbeddingsConfig = { input: "input" };
    const body = getEmbeddingsBody(config, MOCK_CLIENT_OPTIONS);

    expect(body).toEqual({
      ...config,
      projectId: MOCK_CLIENT_OPTIONS.projectId,
      apiKey: MOCK_CLIENT_OPTIONS.apiKey,
      ...MOCK_CLIENT_OPTIONS._extraParams,
    });
  });

  it("should overwrite/merge client options default with config", () => {
    const body = getEmbeddingsBody(MOCK_EMBEDDINGS_CONFIG, MOCK_CLIENT_OPTIONS);

    expect(body).toEqual({
      projectId: MOCK_EMBEDDINGS_CONFIG.projectId,
      apiKey: MOCK_CLIENT_OPTIONS.apiKey,
      userId: MOCK_EMBEDDINGS_CONFIG.userId,
      input: MOCK_EMBEDDINGS_CONFIG.input,
      providerConfig: MOCK_EMBEDDINGS_CONFIG.providerConfig,
      ...MOCK_CLIENT_OPTIONS._extraParams,
    });
  });
});

describe("getUrl", () => {
  it("should format url properly by default", () => {
    expect(getUrl("test-path")).toBe("https://api.commonbase.com/test-path");
  });

  it("should use _apiUrl from ClientOptions", () => {
    expect(getUrl("test-path", MOCK_CLIENT_OPTIONS)).toBe(
      `${MOCK_CLIENT_OPTIONS._apiUrl}/test-path`,
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
    expect(getHeaders(MOCK_CLIENT_OPTIONS)).toEqual({
      ...MOCK_CLIENT_OPTIONS._extraHeaders,
      "Content-Type": "application/json; charset=utf-8",
    });
  });
});
