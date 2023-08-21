import * as process from "process";

// import { Client } from "@commonbase/sdk";
import { Client } from "../index";
import { ChatMessage } from "../client/types";

// In production, you'd call a real weather API
function getCurrentWeather(location: string, unit: string = "fahrenheit") {
  return {
    location,
    unit,
    temperature: 72,
    forecast: ["sunny", "windy"],
  };
}

const client = new Client({
  apiKey: process.env.CB_API_KEY!,
  projectId: process.env.CB_PROJECT_ID,
});

async function main() {
  const messages: ChatMessage[] = [
    { role: "user", content: "What's the weather like in Boston?" },
  ];

  const result = await client.createChatCompletion({
    messages: messages,
    functions: [
      {
        name: "get_current_weather",
        description: "Get the current weather in a given location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g. San Francisco, CA",
            },
            unit: { type: "string", enum: ["celsius", "fahrenheit"] },
          },
          required: ["location"],
        },
      },
    ],
  });

  // Check if GPT wanted to call a function
  if (result.bestChoice.functionCall) {
    // Only one function in this example, but you can have multiple.
    const availableFunctions = {
      get_current_weather: getCurrentWeather,
    };

    const functionName = result.bestChoice.functionCall
      .name as keyof typeof availableFunctions;

    // Sometimes the arguments are not valid. Be sure to validate them in production.
    const functionArguments = JSON.parse(
      result.bestChoice.functionCall.arguments!,
    );
    const { location, unit } = functionArguments;

    const functionResponse = availableFunctions[functionName](location, unit);

    // Extend the conversation with the assistant's reply.
    messages.push(result.bestChoice.toAssistantChatMessage());

    // Extend the conversation with the function response.
    messages.push({
      role: "function",
      name: functionName,
      content: JSON.stringify(functionResponse),
    });

    // Get a new response from GPT where it can see the function response.
    const secondResult = await client.createChatCompletion({
      messages,
    });

    console.log(secondResult.bestChoice.text);
  }
}

main().catch(console.error);
