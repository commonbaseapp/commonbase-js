import { rootApiUrl } from "./constants";
import { Client, ClientOptions, GenerationResults } from "./types";

export function createClient(options?: ClientOptions): Client {
  async function generate(
    projectId: string,
    parameters: Record<string, string>,
  ): Promise<GenerationResults> {
    const res = await fetch(`${rootApiUrl}/api/project/${projectId}`, {
      method: "POST",
      body: JSON.stringify(parameters),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${options && options.apiKey}`,
      },
    });
    const body = await res.json();
    return body;
  }
  return {
    generate,
  };
}
