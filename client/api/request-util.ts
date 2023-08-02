import { version } from "../../package.json";
import type {
  ClientOptions,
  CompletionConfig,
  EmbeddingsConfig,
  ProviderConfig,
  RequestConfig,
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
  if (typeof config.providerConfig?.apiKey === "string") {
    headers["Provider-API-Key"] = config.providerConfig.apiKey;
  }
  return headers;
}

function removeApiKeyFromProviderConfig(
  config?: ProviderConfig,
): Omit<ProviderConfig, "apiKey"> | undefined {
  const providerConfig = config && {
    ...config,
  };
  delete providerConfig?.apiKey;
  return providerConfig;
}

export function getCompletionBody(
  config: CompletionConfig,
  options: ClientOptions,
) {
  return {
    projectId: config.projectId ?? options.projectId,
    variables: config.variables ? config.variables : undefined,
    context: config.chatContext,
    userId: config.userId,
    truncateVariable: config.truncateVariable,
    prompt: config.prompt,
    providerConfig: removeApiKeyFromProviderConfig(config.providerConfig),
  };
}

export function getEmbeddingsBody(
  config: EmbeddingsConfig,
  options: ClientOptions,
) {
  return {
    projectId: config.projectId ?? options.projectId,
    userId: config.userId,
    input: config.input,
    providerConfig: removeApiKeyFromProviderConfig(config.providerConfig),
  };
}
