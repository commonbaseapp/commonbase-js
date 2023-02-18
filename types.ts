export type GenerationResults = {
  bestResult: string;
  choices: string[];
};

export type Client = {
  generate(
    projectId: string,
    parameters: Record<string, string>,
  ): Promise<GenerationResults>;
};

export type ClientOptions = {
  apiKey: string;
};
