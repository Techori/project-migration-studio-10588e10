import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { serviceOrder, serviceConfigs } from "./service-config";

const inputSchema = z.object({
  needs: z.string().trim().min(20, "Please describe your project in at least 20 characters.").max(1500),
});

export type ServiceRecommendation = {
  summary: string;
  recommendations: { key: string; slug: string; title: string; reason: string }[];
};

function catalogue() {
  return serviceOrder
    .map((key) => {
      const service = serviceConfigs[key];
      return service ? `- ${key}: ${service.shortTitle} — ${service.description}` : null;
    })
    .filter(Boolean)
    .join("\n");
}

async function readStreamText(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const event = JSON.parse(payload) as { type?: string; delta?: string };
        if (event.type === "response.output_text.delta" && typeof event.delta === "string") text += event.delta;
      } catch {
        // ignore malformed keep-alive chunks
      }
    }
  }
  return text;
}

export const recommendServices = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<ServiceRecommendation> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("The advisor is unavailable right now. Please contact us directly.");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low", summary: "auto" },
        include: ["reasoning.encrypted_content"],
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: `You are an advisor for RILOYD, a business consultancy offering these services:\n${catalogue()}\n\nRead the prospective client's description and choose the 1 to 3 services that fit best. Reply with JSON only, no markdown fences, shaped exactly as: {"summary": string, "recommendations": [{"key": string, "reason": string}]}. "key" must be one of: ${serviceOrder.join(", ")}. "summary" is one or two sentences addressed to the client. Each "reason" is one short sentence explaining the fit. Never invent services or promise outcomes, pricing or timelines.`,
              },
            ],
          },
          {
            role: "user",
            content: [{ type: "input_text", text: data.needs }],
          },
        ],
      }),
    });

    if (response.status === 429) throw new Error("Our advisor is busy right now. Please try again in a moment.");
    if (response.status === 402) throw new Error("The advisor is temporarily unavailable. Please contact us directly.");
    if (!response.ok) throw new Error("We could not generate a recommendation. Please try again.");

    const raw = (await readStreamText(response)).trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

    let parsed: { summary?: unknown; recommendations?: unknown };
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("We could not generate a recommendation. Please try again.");
    }

    const list = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
    const recommendations = list
      .map((item) => {
        const entry = item as { key?: string; reason?: string };
        const service = entry.key ? serviceConfigs[entry.key] : undefined;
        if (!service || !entry.key) return null;
        return {
          key: entry.key,
          slug: service.slug,
          title: service.shortTitle,
          reason: typeof entry.reason === "string" ? entry.reason : service.description,
        };
      })
      .filter((item): item is ServiceRecommendation["recommendations"][number] => item !== null)
      .slice(0, 3);

    if (recommendations.length === 0) throw new Error("We could not match a service. Please contact us directly.");

    return {
      summary: typeof parsed.summary === "string" ? parsed.summary : "Here is where we would start.",
      recommendations,
    };
  });
