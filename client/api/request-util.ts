import { version } from "../../package.json";
import type {
  ClientOptions,
  CompletionConfig,
  EmbeddingsConfig,
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
  if (typeof config.providerApiKey === "string") {
    headers["Provider-API-Key"] = config.providerApiKey;
  }
  return headers;
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
    prompt: config.prompt,
    providerConfig: config.providerConfig,
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
    providerConfig: config.providerConfig,
  };
}
