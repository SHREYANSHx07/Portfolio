# Portfolio — setup & personalization

A 3D animated portfolio built with Next.js 16, React Three Fiber, GSAP + Lenis, Framer Motion and Resend.

## Run it

```bash
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Plug in your real assets

Everything works with placeholders now. Swap these in when ready:

| What | Where | How |
|------|-------|-----|
| **3D avatar (you)** | `src/data/profile.ts` → `avatarUrl` | Create a free avatar at [readyplayer.me](https://readyplayer.me), copy the `.glb` URL, paste it. A sculptural placeholder renders until then. |
| **Your photo** | `public/portrait.jpg` + `src/components/sections/About.tsx` | Drop the file in, then set `HAS_PHOTO = true`. |
| **Social links** | `src/data/profile.ts` → `socials` | Replace the placeholder GitHub / LinkedIn / LeetCode / Codeforces / CodeChef URLs with your real ones. |
| **Contact email** | `.env.local` | Copy `.env.example` → `.env.local`, add `RESEND_API_KEY` (free at [resend.com](https://resend.com)) and your `CONTACT_TO_EMAIL`. Form returns a friendly 503 until set. |
| **Project screenshots** | `public/textures/projects/*.svg` | Replace the 3 placeholder SVGs with real screenshots (any web image format). |

## Verify visually

`node scripts/shoot.mjs` screenshots every section to `/tmp/shot-*.png` (uses your installed Chrome).

## Deploy (Vercel)

1. Push to GitHub (remote already set: `SHREYANSHx07/Portfolio`).
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Add env vars `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`.
4. Deploy.
