import { CORPUS, type Chunk } from "./corpus";

/**
 * Tiny BM25 retriever over the corpus — no embedding service, no vector DB.
 * The corpus is ~20 chunks, so exact scoring is effectively free per request.
 */

const K1 = 1.4;
const B = 0.75;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

type Indexed = { chunk: Chunk; tokens: string[]; tf: Map<string, number> };

const INDEX: Indexed[] = CORPUS.map((chunk) => {
  const tokens = tokenize(`${chunk.title} ${chunk.text}`);
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  return { chunk, tokens, tf };
});

const AVG_LEN = INDEX.reduce((s, d) => s + d.tokens.length, 0) / INDEX.length;

const DF = new Map<string, number>();
for (const doc of INDEX) {
  for (const term of doc.tf.keys()) DF.set(term, (DF.get(term) ?? 0) + 1);
}

function idf(term: string): number {
  const df = DF.get(term) ?? 0;
  return Math.log(1 + (INDEX.length - df + 0.5) / (df + 0.5));
}

export function retrieve(query: string, k = 4): Chunk[] {
  const terms = tokenize(query);
  if (terms.length === 0) return CORPUS.slice(0, k);

  const scored = INDEX.map((doc) => {
    let score = 0;
    for (const term of terms) {
      const tf = doc.tf.get(term) ?? 0;
      if (tf === 0) continue;
      const norm = (tf * (K1 + 1)) / (tf + K1 * (1 - B + B * (doc.tokens.length / AVG_LEN)));
      score += idf(term) * norm;
    }
    return { chunk: doc.chunk, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((s) => s.chunk);
}
