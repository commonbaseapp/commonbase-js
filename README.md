# Commonbase Typescript SDK for building LLM integrations faster and easier

The Commonbase Javascript SDK allows developers to integrate with any popular LLM API provider without needing to change any code. The SDK helps with collecting data and feedback from the users and helps you fine-tune models for your specific use case.

## Installation

```bash
$ npm install commonbase
```

## Usage

```javascript
import { createClient } from "commonbase";

const client = createClient();

// get a project id by creating a project on https://commonbase.app/login
const result = await client.generate("my_commonbase_project_id", {
  useFormalStyle: true,
  recipientName: "Vincent Vega",
  senderName: "Jules Winnfield",
  meetingNotes: "...",
});

console.log(result.firstResult);
```
