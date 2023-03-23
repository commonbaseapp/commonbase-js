import { rootApiUrl } from "./constants";
import { ClientOptions, CompletionResults } from "./types";

export class Client {
  private options: ClientOptions;
  constructor(options?: ClientOptions) {
    this.options = options || {};
  }
  private async fetchAPI(
    path: string,
    body: object,
    projectId?: string,
  ): Promise<any> {
    const res = await fetch(`${rootApiUrl}/${path}`, {
      method: "POST",
      body: JSON.stringify({
        projectId: projectId || this.options.projectId,
        apiKey: this.options.apiKey,
        ...body,
      }),
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
    const resBody = await res.json();
    if (!res.ok) {
      throw new Error(`api error (status=${res.status}): ${resBody.error}`);
    }
    return resBody;
  }
  async createCompletion(
    variables: Record<string, string>,
    userId?: string,
    projectId?: string,
  ): Promise<CompletionResults> {
    const completionsRes = await this.fetchAPI(
      "completions",
      {
        variables: {
          ...this.options.defaultVariables,
          ...variables,
        },
        userId,
      },
      projectId,
    );
    if (!completionsRes.ok) {
      throw new Error(`api error: ${completionsRes.error}`);
    }
    if (!completionsRes.choices || completionsRes.choices.length === 0) {
      throw new Error("no completions found");
    }
    return {
      bestResult: completionsRes.choices[0].text,
      choices: completionsRes.choices.map((c: { text: string }) => c.text),
      _raw: completionsRes,
    };
  }
}
