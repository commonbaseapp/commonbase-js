export type CompletionResults = {
  bestResult: string;
  choices: string[];
  _raw: unknown;
};

export type ClientOptions = {
  projectId?: string;
  apiKey?: string;
  defaultVariables?: Record<string, string>;
};
