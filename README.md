# Commonbase Typescript SDK for building LLM integrations faster and easier

Commonbase allows developers to integrate with any popular LLM API provider without needing to change any code. The SDK helps with collecting data and feedback from the users and helps you fine-tune models for your specific use case.

## Installation

```bash
$ npm install @commonbase/sdk
```

## Usage

```typescript
import { Client } from "@commonbase/sdk";

const client = new Client({
  projectId: "xxx-xxx-xxx-xxx-xxx",
});

const completionResult = await client.createCompletion({
  user_name: "Alice",
  project_name: "my-galaxy",
});

console.log(completionResult.bestResult);
```

### Drop-in replacement for OpenAI API

```typescript
// the openai package can be replaced with the @commonbase/sdk/openai package
// import { Configuration, OpenAIApi } from "openai";
import { Configuration, OpenAIApi } from "@commonbase/sdk/openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const completion = await openai.createCompletion({
  // the model will be ignored and the configured model from the project will be used
  model: "text-davinci-003",
  // prompt: "Hello World!", // prompt is not needed anymore
  // set this to you project id
  projectId: "xxx-xxx-xxx-xxx-xxx",
  // configure the prompt variables
  variables: {
    user: "Alice",
  },
});
console.log(completion.data.choices[0].text);
```
