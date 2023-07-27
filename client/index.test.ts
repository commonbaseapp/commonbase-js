import { describe, expect, it } from "vitest";

import * as client from "./index";

describe("Client", () => {
  it("exists", () => {
    expect(client.Client).not.toBeUndefined();
    expect(client.ChatClient).not.toBeUndefined();
  });
});
