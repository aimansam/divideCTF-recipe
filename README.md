# divideCTF-recipe

A 30-day recipe challenge themed around Khairul Ameng. The "Day 30" recipe
is locked behind a client-side overlay; the flag is returned only by the
server-side `/api/recipe/30` endpoint.

## Stack

- **Frontend**: static `index.html` + `style.css` + `app.js` (served as-is)
- **API**: Cloudflare Pages Function at `/api/recipe/<day>` (JavaScript)
- **Hosting**: Cloudflare Pages (free)
- **Local dev**: Flask + Gunicorn (Dockerfile) — kept for parity

## Project layout

```
.
├── public/                       # Cloudflare Pages static root
│   ├── index.html                # 30 recipe cards (pre-baked)
│   ├── _headers                  # cache + security headers
│   ├── _redirects                # URL redirects
│   └── static/
│       ├── app.js
│       ├── style.css
│       └── img/                  # 1.jpg ... 30.jpg + khairul-ameng.jpg
├── functions/
│   └── api/recipe/[day].js       # Pages Function (JS)
├── scripts/
│   └── build_index.py            # Regenerates public/index.html from RECIPES
├── Dockerfile                    # optional local Flask container
├── requirements.txt              # local Flask deps (not used by Pages)
└── README.md
```

## API

`GET /api/recipe/<day>` where `day` is an integer in `[1, 30]`.

- Days `1-29` → `{day, title, desc, content}`
- Day `30` → `{day, title, desc, content: "Secret ingredient: <FLAG>"}`
- Out of range → `404`

## Local development

### Option A: Cloudflare Pages locally with Wrangler (recommended)

```bash
npm install                   # installs wrangler locally
npm run dev                   # → http://localhost:8788
# or directly: npx wrangler pages dev ./public
```

The `[day].js` function is loaded automatically. The flag is read from
`context.env.FLAG`. To set the flag locally, create a `.dev.vars` file
in the project root:

```
FLAG=divide{local_test_flag}
```

Wrangler reads `.dev.vars` automatically and exposes it as `context.env.FLAG`.

### Option B: Flask in Docker (legacy)

```bash
docker build -t divide-recipe .
docker run -p 8080:8080 -e FLAG=divide{test} divide-recipe
# → http://localhost:8080
```

## Deploy to Cloudflare Pages

1. Push this repo to GitHub.
2. In [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages):
   - **Create a project → Pages → Connect to Git** → pick the repo.
3. **Build settings**:
   - **Framework preset**: None
   - **Build command**: *(leave blank — `public/index.html` is pre-baked)*
   - **Build output directory**: `public`
4. **Environment variables** (Settings → Environment variables):
   - Add `FLAG` with your real CTF flag value.
5. Click **Save and Deploy**. Your site will be live at
   `https://<project-name>.pages.dev`.

### Option 2: Direct deploy via Wrangler (no GitHub)

```bash
npm install
npm run deploy
# or directly: npx wrangler pages deploy ./public --project-name=divide-recipe
```

You'll be prompted to log in to Cloudflare on first run. The flag must be
set separately with:

```bash
npx wrangler pages secret put FLAG --project-name=divide-recipe
```

## Updating the recipes

Edit the `RECIPES` dict in **both** `scripts/build_index.py` and
`functions/api/recipe/[day].js` (they intentionally don't share a module
for portability), then regenerate the static HTML:

```bash
python3 scripts/build_index.py
git add public/index.html
git commit -m "update recipes"
git push
```

Cloudflare Pages will redeploy automatically.

## License

MIT.

