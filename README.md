# Commonbase Typescript SDK for building LLM integrations faster and easier

[![npm version](https://badge.fury.io/js/@commonbase%2Fsdk.svg)](https://badge.fury.io/js/@commonbase%2Fsdk)

Commonbase allows developers to integrate with any popular LLM API provider
without needing to change any code. The SDK helps with collecting data and
feedback from the users and helps you fine-tune models for your specific use case.

[![](./docs/chat-repl.gif)](./examples/chat-repl.ts)

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
  variables: {
    user: "Alice",
  },
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
  model: "text-davinci-003",
  // when using the openai drop-in replacement, the prompt is passed to
  // the OpenAI API as-is and the prompt CMS + templating is not used
  prompt: "Hello World, my name is Alice!",
  // you need to add your project id to be able to track
  // the usage and responses of the OpenAI requests
  projectId: "xxx-xxx-xxx-xxx-xxx",
});
console.log(completion.data.choices[0].text);
```

### Chat

The Chat API is dependent on the [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) API, if you are intending to use it from a Node (or other) environment you have to make a compatible WebSocket implementation globally available like [websockets/ws](https://github.com/websockets/ws).

```typescript
const chatClient = new ChatClient({ projectId: "xxx-xxx-xxx-xxx-xxx" });
const stream = chatClient.send("Hey Bot");
while (true) {
  const { done, value } = await stream.next();
  if (done) {
    break;
  }
  console.log(value);
}
```

In browsers that support [async iteration of streams](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream#async_iteration) (currently only Firefox), you can just iterate over the stream

```typescript
for await (const chunk of stream) {
  console.log(chunk);
}
```
