import { z } from "zod";

export const studentReviewSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
});