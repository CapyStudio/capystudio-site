# CapyStudio Site

Astro + Tailwind site for CapyStudio, including the CapyBets public pages.

## Vercel architecture

- **Vercel project:** `capystudio-site`
- **Primary GitHub repo:** `CapyStudio/capystudio-site`
- **Production branch:** `main`
- **Production domains:**
  - `capystudio.co`
  - `www.capystudio.co`
  - `capybets.capystudio.co`
- **Framework:** Astro, deployed with `@astrojs/vercel`
- **Output mode:** server-rendered (`output: "server"` in `astro.config.mjs`)

Every push to `main` triggers a Vercel deployment through the GitHub integration.

## CapyBets research/digest integration

CapyBets research pages live in this repo under:

```text
src/pages/capybets/research/
src/lib/capybetsResearch.ts
```

The digest content does **not** live in this public site repo. It is read at runtime from the private CapyBets repo:

```text
CapyStudio/CapyBets
daily-digests/<topic>/<topic>-YYYY-MM-DD.md
```

Because `CapyStudio/CapyBets` is private, the Vercel server runtime needs a GitHub token.

Required Vercel environment variable:

```text
CAPYBETS_GITHUB_TOKEN=<GitHub token with read access to CapyStudio/CapyBets>
```

Recommended token setup:

- Use a GitHub fine-grained personal access token.
- Resource owner: `CapyStudio`
- Repository access: only `CapyStudio/CapyBets`
- Repository permissions: `Contents: Read-only`
- Add the token to Vercel for at least `Production`; `Preview` is also recommended.

If the CapyBets research page shows **“No digests found”**, check these first:

1. Vercel env var `CAPYBETS_GITHUB_TOKEN` exists for the deployed environment.
2. The token has not expired or been revoked.
3. The token still has read access to `CapyStudio/CapyBets`.
4. Digest files exist under `daily-digests/<topic>/` in the private repo.

## Local development

Install dependencies:

```sh
npm install
```

Run the site locally:

```sh
npm run dev
```

To test CapyBets research pages locally against the private digest repo, provide a GitHub token:

```sh
CAPYBETS_GITHUB_TOKEN=<token> npm run dev
```

Then open:

```text
http://localhost:4321/capybets/research
```

Build locally:

```sh
CAPYBETS_GITHUB_TOKEN=<token> npm run build
```

Note: `astro preview` is not supported by the Vercel adapter in this project; use `npm run dev` for local verification.

## Useful commands

```sh
npm install
npm run dev
npm run build
```
