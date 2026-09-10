/**
 * Diagnostic: loads the configured local embedding model and prints the
 * resulting vector dimension. Run with `node scripts/check-embedding.mjs`.
 * (First run downloads the model from HF_ENDPOINT, ~30-60 MB.)
 */
import { pipeline, env } from "@huggingface/transformers";

env.remoteHost = process.env.HF_ENDPOINT || "https://hf-mirror.com";
const model = process.env.AI_EMBEDDING_MODEL || "Xenova/multilingual-e5-small";

console.log(`[check-embedding] model=${model} host=${env.remoteHost}`);
const started = Date.now();
const extractor = await pipeline("feature-extraction", model, { dtype: "q8" });
console.log(`[check-embedding] model loaded in ${Date.now() - started} ms`);

const output = await extractor(
  ["passage: backpropagation computes gradients", "query: what is backpropagation?"],
  { pooling: "mean", normalize: true },
);
const vectors = output.tolist();
console.log(
  `[check-embedding] vectors=${vectors.length} dim=${vectors[0].length} first3=[${vectors[0]
    .slice(0, 3)
    .map((n) => n.toFixed(4))
    .join(", ")}]`,
);
console.log("[check-embedding] OK");
