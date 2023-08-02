# Commonbase Typescript SDK for building LLM integrations faster and easier

[![npm version](https://badge.fury.io/js/@commonbase%2Fsdk.svg)](https://badge.fury.io/js/@commonbase%2Fsdk)

Commonbase allows developers to integrate with any popular LLM API provider
without needing to change any code. The SDK helps with collecting data and
feedback from the users and helps you fine-tune models for your specific use case.

[![](./docs/chat-repl.gif)](./examples/chat-repl.ts)

## Installation

Install [Commonbase from npm](https://www.npmjs.com/package/@commonbase/sdk) using your
preferred package manager:

```bash
npm add @commonbase/sdk
pnpm add @commonbase/sdk
yarn add @commonbase/sdk
```

## Usage

A Project ID and API Key are required for all Commonbase requests. You can find your project ID
and generate an API key in the [Commonbase Dashboard](https://commonbase.com/).

To create a completion, configure a `Client` with your API Key and provide your Project ID
and prompt to `createCompletion`.

```typescript
import { Client } from "@commonbase/sdk";

const client = new Client({
  apiKey: "API_KEY",
});

const completion = await client.createCompletion({
  projectId: "PROJECT_ID",
  prompt: "Hello",
});

console.log(completion.bestResult);
```

To stream a completion as it is generated, use `createStreamingCompletion`.

For more examples, see [/examples](https://github.com/commonbaseapp/sdk/tree/main/examples).
