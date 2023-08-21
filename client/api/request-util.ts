import { version } from "../../package.json";
import type {
  ChatCompletionConfig,
  ClientOptions,
  EmbeddingsConfig,
  Provider,
  RequestConfig,
  RequestType,
  TextCompletionConfig,
} from "../types";

const ROOT_API_URL = "https://api.commonbase.com";

export function getUrl(path: string) {
  return `${ROOT_API_URL}/${path}`;
}

export function getHeaders(options: ClientOptions, config: RequestConfig) {
  const headers: Record<string, string> = {
    Authorization: options.apiKey,
    "User-Agent": `commonbase-js/${version}`,
    "Content-Type": "application/json; charset=utf-8",
  };
  if ("providerApiKey" in config && typeof config.providerApiKey === "string") {
    headers["Provider-API-Key"] = config.providerApiKey;
  }
  return headers;
}

export function getDefaultProviderModel(provider: Provider, type: RequestType) {
  if (provider.includes("openai")) {
    switch (type) {
      case "text":
        return "text-davinci-003";
      case "chat":
        return "gpt-3.5-turbo";
      case "embeddings":
        return "text-embeddings-ada-002";
    }
  } else if (provider.includes("anthropic")) {
    return "claude-v1";
  }
  throw Error("Unable to determine default provider model.");
}

export function getProviderConfig(
  config: TextCompletionConfig | ChatCompletionConfig | EmbeddingsConfig,
  type: RequestType,
) {
  const providerName = config.provider ?? "cb-openai-eu";
  const providerModel =
    config.providerModel ?? getDefaultProviderModel(providerName, type);
  const providerParams = {
    ...config.providerParams,
    type,
    model: providerModel,
  };
  return {
    provider: providerName,
    params: {
      ...providerParams,
    },
  };
}

export function getCompletionBody(
  config: TextCompletionConfig | ChatCompletionConfig,
  options: ClientOptions,
  type: Exclude<RequestType, "embeddings">,
) {
  if ("prompt" in config) {
    return {
      projectId: config.projectId ?? options.projectId,
      variables: config.variables ? config.variables : undefined,
      userId: config.userId,
      prompt: config.prompt,
      providerConfig: getProviderConfig(config, type),
    };
  } else {
    return {
      projectId: config.projectId ?? options.projectId,
      messages: config.messages,
      functions: config.functions,
      functionCall: config.functionCall,
      userId: config.userId,
      providerConfig: getProviderConfig(config, type),
    };
  }
}

export function getEmbeddingsBody(
  config: EmbeddingsConfig,
  options: ClientOptions,
) {
  return {
    projectId: config.projectId ?? options.projectId,
    userId: config.userId,
    input: config.input,
    providerConfig: getProviderConfig(config, "embeddings"),
  };
}
