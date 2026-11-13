import { createServerFn } from "@tanstack/react-start";
import { validateRegistration } from "./submission-schemas";

export const submitRegistration = createServerFn({ method: "POST" })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) throw new Error("Invalid registration form.");
    return data;
  })
  .handler(async ({ data }) => {
    const parsed = validateRegistration(data);
    const { storeRegistration } = await import("./submissions.server");
    return storeRegistration(parsed);
  });
