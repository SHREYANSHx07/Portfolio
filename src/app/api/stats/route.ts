import { NextResponse } from "next/server";

/**
 * Live competitive-programming ratings, revalidated daily. Every source is
 * best-effort: a null field means "keep the static number from
 * src/data/achievements.ts" — the page never breaks on upstream failures.
 */

export const revalidate = 86400;

const HANDLE = "shreyansh0806";
const TIMEOUT = 8000;

async function getJSON(url: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(TIMEOUT),
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

async function codeforces(): Promise<{ rating: number; rank: string } | null> {
  const data = (await getJSON(
    `https://codeforces.com/api/user.info?handles=${HANDLE}`,
  )) as { status: string; result?: { rating?: number; rank?: string }[] };
  const u = data.status === "OK" ? data.result?.[0] : null;
  return u?.rating ? { rating: u.rating, rank: u.rank ?? "rated" } : null;
}

async function leetcode(): Promise<number | null> {
  const data = (await getJSON("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Referer: "https://leetcode.com" },
    body: JSON.stringify({
      query: `query($u:String!){userContestRanking(username:$u){rating}}`,
      variables: { u: HANDLE },
    }),
  })) as { data?: { userContestRanking?: { rating?: number } } };
  const rating = data.data?.userContestRanking?.rating;
  return typeof rating === "number" ? Math.round(rating) : null;
}

async function codechef(): Promise<{ rating: number; stars: number } | null> {
  const res = await fetch(`https://www.codechef.com/users/${HANDLE}`, {
    headers: { "User-Agent": "Mozilla/5.0 (portfolio stats fetcher)" },
    signal: AbortSignal.timeout(TIMEOUT),
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`codechef → ${res.status}`);
  const html = await res.text();
  const m = html.match(/class="rating-number"[^>]*>(\d{3,4})/);
  if (!m) return null;
  const rating = Number(m[1]);
  // official star bands: 2★ from 1400, one more star per +200, cap 7★
  const stars = Math.min(Math.max(Math.floor((rating - 1200) / 200) + 1, 1), 7);
  return { rating, stars };
}

export async function GET() {
  const [cf, lc, cc] = await Promise.allSettled([codeforces(), leetcode(), codechef()]);

  return NextResponse.json({
    codeforces: cf.status === "fulfilled" ? cf.value : null,
    leetcode: lc.status === "fulfilled" ? lc.value : null,
    codechef: cc.status === "fulfilled" ? cc.value : null,
    fetchedAt: new Date().toISOString(),
  });
}
