import * as process from "node:process";
import * as readline from "node:readline/promises";

// import { Client } from "@commonbase/sdk";
import { Client } from "../index";
import { ChatContext } from "../client/types";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const client = new Client({
  apiKey: process.env.CB_API_KEY!,
  projectId: process.env.CB_PROJECT_ID,
});

async function askQuestion(context: ChatContext) {
  return client.streamCompletion({
    prompt: "You are a demo chatbot.",
    chatContext: context,
    userId: "anonymous-example-user",
    providerConfig: {
      provider: "cb-openai-eu",
      params: {
        type: "chat",
      },
    },
  });
}

async function main() {
  console.log("Welcome to the Commonbase chat assistant!");
  console.log("Type your question and press enter to send it.");
  console.log("Type 'exit' or 'quit' to quit.");

  const context: ChatContext = {
    messages: [],
  };

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
    context.messages.push({
      role: "user",
      content: question,
    });
    const completionStream = await askQuestion(context);
    for await (const completionResult of completionStream) {
      if (completionResult.completed) {
        process.stdout.write("\n\n");
        context.messages.push({
          role: "assistant",
          content: completionResult.bestResult,
        });
        continue;
      }
      process.stdout.write(completionResult.bestResult);
    }
  }

  console.log("bye 👋");
  process.exit(0);
}

main().catch(console.error);
