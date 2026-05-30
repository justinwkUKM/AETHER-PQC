import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";
import { graphResponseSchema, geminiGraphResponseSchema, remediationResponseSchema } from "@/lib/ai/schemas";
import type { GraphSnapshot } from "@/types/graph";
import type { RemediationPlan } from "@/types/remediation";

type ExtractInput = {
  artifactId: string;
  fileName: string;
  mimeType: string;
  text: string;
  fileBuffer?: Buffer;
  currentGraph: GraphSnapshot;
};

function getClient() {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is required for AI multimodal extraction.");
  }
  return new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
}

export async function extractGraphWithGemini(input: ExtractInput): Promise<GraphSnapshot> {
  const ai = getClient();
  const prompt = `Extract a post-quantum cryptography risk graph from this artifact.
Artifact ID: ${input.artifactId}
File name: ${input.fileName}
MIME type: ${input.mimeType}
Current graph: ${JSON.stringify(input.currentGraph)}

Rules:
- Return only nodes and edges in the provided schema.
- Use stable snake_case ids.
- Prefer exact ids from Current graph for matching entities.
- Score RSA, DSA, DH, ECDSA, ECDH as 10.
- Score AES-256, SHA-256, SHA-384, SHA-512, ML-KEM, ML-DSA, SLH-DSA as 0.
- Mark visual/OCR inferences with confidence below 0.85 unless explicit.

Extracted text when available:
${input.text || "(No embedded text; inspect the attached file visually.)"}`;

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [{ text: prompt }];
  if (input.fileBuffer?.length) {
    parts.push({
      inlineData: {
        mimeType: input.mimeType,
        data: input.fileBuffer.toString("base64")
      }
    });
  }

  const response = await ai.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: [{ role: "user", parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema: geminiGraphResponseSchema
    }
  });

  if (!response.text) throw new Error("Gemini returned an empty graph extraction response.");
  return graphResponseSchema.parse(JSON.parse(response.text));
}

export async function generateRemediationsWithGemini(graph: GraphSnapshot): Promise<RemediationPlan[]> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Create PQC migration remediations for this graph. Return JSON with a remediations array. Graph: ${JSON.stringify(graph)}`
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json"
    }
  });

  if (!response.text) throw new Error("Gemini returned an empty remediation response.");
  return remediationResponseSchema.parse(JSON.parse(response.text)).remediations;
}
