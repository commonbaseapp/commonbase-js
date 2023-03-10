import { rootApiUrl } from "./constants";
import { ClientOptions, CompletionResults } from "./types";

export class Client {
  private options: ClientOptions;
  constructor(options?: ClientOptions) {
    this.options = options || {};
  }
  private async fetchAPI(path: string, body: any): Promise<any> {
    const res = await fetch(`${rootApiUrl}/${path}`, {
      method: "POST",
      body: JSON.stringify({
        projectId: this.options.projectId,
        userId: this.options.userId,
        ...body,
      }),
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
    return res.json();
  }
  async createCompletion(
    variables: Record<string, string>,
  ): Promise<CompletionResults> {
    const completionsRes = await this.fetchAPI("completions", {
      variables,
    });
    if (!completionsRes.ok) {
      throw new Error(completionsRes.error);
    }
    return {
      bestResult: completionsRes.choices[0].text,
      choices: completionsRes.choices.map((c: any) => c.text),
    };
  }
}
