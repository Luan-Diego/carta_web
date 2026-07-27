# Security

## Reporting a vulnerability
Please do not open a public issue. Use the repository's **Security → Report a vulnerability** (GitHub private advisories) or contact the maintainer directly.

## How the project protects letters and visitors
- **No HTML from users.** Every user text is rendered with Vue interpolation (escaped); there is no `v-html`, `innerHTML` or `eval`.
- **Strict validation.** Every letter (hash link, short link, saved draft) goes through `src/config/schema.js`: only known options, valid colors, size limits, and images as PNG/WebP/JPEG data URLs (no SVG). The API runs the **same validator** before saving, so the database only holds clean data.
- **Short link API (`api/carta.js`).** JSON only, same-origin only, 800 KB cap, 5 images max, per-IP rate limits (8 creations/hour, 30/day, 120 reads/min; IPs stored only as a salted hash), random 72-bit ids, automatic expiry (1/7/30 days), generic error messages.
- **Browser hardening (`vercel.json`).** Content-Security-Policy (scripts only from the site itself), no framing, no referrer, HSTS, nosniff, and a restrictive Permissions-Policy.
- **Zip-bomb guard.** Compressed hash links are inflated with a hard size cap.
- **Secrets.** Tokens live only in Vercel environment variables; `.env*` is git-ignored.

## Known trade-offs
- A letter may use a background image from an `https://` address. Opening such a letter makes the viewer's browser contact that host (it sees the viewer's IP, never the page URL). Remove `https:` from `img-src` in `vercel.json` and the `url` option in `safeImage` to forbid it.
- Short-link letters are readable by anyone who has the link (like an unlisted page). Do not put secrets in a letter.
