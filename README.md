# Commonbase Typescript SDK for building LLM integrations faster and easier

Commonbase allows developers to integrate with any popular LLM API provider without needing to change any code. The SDK helps with collecting data and feedback from the users and helps you fine-tune models for your specific use case.

## Installation

```bash
$ npm install @commonbase/sdk
```

## Usage

```javascript
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
