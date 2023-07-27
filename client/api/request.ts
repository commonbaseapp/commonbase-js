import { ClientOptions, CompletionConfig, EmbeddingsConfig } from "../types";
import { APIError } from "./error";
import { getCompletionBody, getEmbeddingsBody } from "./request-util";

export const ROOT_API_URL = "https://api.commonbase.com";

function getUrl(path: string, options?: ClientOptions) {
  return `${options?._apiUrl || ROOT_API_URL}/${path}`;
}

function getHeaders(options: ClientOptions) {
  return {
    ...options._extraHeaders,
    "Content-Type": "application/json; charset=utf-8",
  };
}

export async function fetchCompletionsAPI(
  config: CompletionConfig,
  options: ClientOptions,
  stream = false,
): Promise<Response> {
  const res = await fetch(getUrl("completions", options), {
    method: "POST",
    body: JSON.stringify({
      ...getCompletionBody(config, options),
      stream,
    }),
    headers: getHeaders(options),
  });

  if (!res.ok) {
    const resBody = await res.json();
    throw new APIError(res.status, resBody);
  }

  return res;
}

export async function fetchEmbeddingsAPI(
  config: EmbeddingsConfig,
  options: ClientOptions,
): Promise<Response> {
  const res = await fetch(getUrl("embeddings", options), {
    method: "POST",
    body: JSON.stringify(getEmbeddingsBody(config, options)),
    headers: getHeaders(options),
  });

  if (!res.ok) {
    const resBody = await res.json();
    throw new APIError(res.status, resBody);
  }

  return res;
}
