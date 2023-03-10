export type CompletionResults = {
  bestResult: string;
  choices: string[];
};

export type ClientOptions = {
  projectId?: string;
  apiKey?: string;
  userId?: string;
};
