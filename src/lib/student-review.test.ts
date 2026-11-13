import { describe, expect, it } from "vitest";
import { studentReviewSchema } from "./student-review";

const id = "00000000-0000-4000-8000-000000000001";
describe("student registration review", () => {
  it("accepts approval", () => expect(studentReviewSchema.parse({ id, status: "approved" }).status).toBe("approved"));
  it("accepts rejection", () => expect(studentReviewSchema.parse({ id, status: "rejected" }).status).toBe("rejected"));
  it("rejects payment or selection status", () => expect(studentReviewSchema.safeParse({ id, status: "paid" }).success).toBe(false));
  it("requires a record ID", () => expect(studentReviewSchema.safeParse({ id: "", status: "approved" }).success).toBe(false));
});