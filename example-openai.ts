import * as process from "process";

// import { Configuration, OpenAIApi } from "openai";
import { Configuration, OpenAIApi } from "./openai";

async function main() {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    // prompt: "Hello World!",
    projectId: process.env.CB_PROJECT_ID,
    variables: {
      user: "Alice",
    },
  });
  console.log(completion.data.choices[0].text);

  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    // prompt: "Hello World!",
    projectId: process.env.CB_PROJECT_ID,
    variables: {
      user: "Alice",
    },
    messages: [
      {
        role: "user",
        content: "Hello, how are you?",
      },
    ],
  });
  console.log(chatCompletion.data.choices[0].message);
}

main().catch(console.error);
