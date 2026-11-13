import { queryOptions } from "@tanstack/react-query";
import { getCountryLogos } from "./country-logos.functions";

export const countryLogosQuery = queryOptions({ queryKey: ["country-logos"], queryFn: () => getCountryLogos(), staleTime: 300_000, refetchInterval: 300_000 });