import { queryOptions } from "@tanstack/react-query";
import { getProgrammeFees } from "./programme-fees.functions";

export const programmeFeesQuery = queryOptions({ queryKey: ["programme-fees"], queryFn: () => getProgrammeFees(), staleTime: 0 });