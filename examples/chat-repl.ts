import * as process from "node:process";
import * as readline from "node:readline/promises";

// import { Client } from "@commonbase/sdk";
import { Client } from "../index";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const client = new Client({
  projectId: process.env.CB_PROJECT_ID,
});

async function askQuestion(question: string) {
  return client.createStreamingCompletion({}, "anonymous-example-user", {
    messages: [{ role: "user", content: question }],
  });
}

async function main() {
  console.log("Welcome to the Commonbase chat assistant!");
  console.log("Type your question and press enter to send it.");
  console.log("Type 'exit' or 'quit' to quit.");
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
    const completionStream = await askQuestion(question);
    for await (const completionResult of completionStream) {
      if (completionResult.completed) {
        process.stdout.write("\n\n");
        continue;
      }
      process.stdout.write(completionResult.choices[0].text);
    }
  }

  console.log("bye 👋");
  process.exit(0);
}

main().catch(console.error);
