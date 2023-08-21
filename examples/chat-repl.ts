import * as process from "node:process";
import * as readline from "node:readline/promises";

// import { Client } from "@commonbase/sdk";
import { Client } from "../index";
import { ChatMessage } from "../client/types";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const client = new Client({
  apiKey: process.env.CB_API_KEY!,
  projectId: process.env.CB_PROJECT_ID,
});

async function main() {
  console.log("Welcome to the Commonbase chat assistant!");
  console.log("Type your question and press enter to send it.");
  console.log("Type 'exit' or 'quit' to quit.");

  const messages: ChatMessage[] = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const question = (await rl.question("> ")).trim();
    if (["exit", "quit"].includes(question)) {
      break;
    }
    if (question.length === 0) {
      console.log("Type your question and press enter to send it.");
      continue;
    }
    messages.push({
      role: "user",
      content: question,
    });
    const completionStream = await client.streamChatCompletion({
      messages,
      userId: "anonymous-example-user",
      provider: "cb-openai-eu",
    });
    for await (const completionResult of completionStream) {
      if (completionResult.completed) {
        process.stdout.write("\n\n");
        messages.push(completionResult.bestChoice.toAssistantChatMessage());
        continue;
      }
      process.stdout.write(completionResult.bestChoice.text);
    }
  }

  console.log("bye 👋");
  process.exit(0);
}

main().catch(console.error);
