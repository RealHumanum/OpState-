# OpState — landing site

The public validation site for **OpState**: explains the app, captures a **waitlist**, and offers an
opt-in for **weekly build updates**. Static HTML/CSS/JS, deployed to **GitHub Pages** via GitHub
Actions. No build step, no framework, no trackers.

> This repo is intentionally separate from the OpState app repo. **Only the website lives on GitHub** —
> the app's source stays private and local.

## Layout

```
index.html         landing page
privacy.html       waitlist privacy notice
css/styles.css     brand tokens + layout (mirrors the app's design system)
js/waitlist.js     progressive-enhancement form handler (Kit)
fonts/             self-hosted Inter (subsetted woff2, OFL)
assets/            screenshots, og-image.png, favicon.svg, og-source.svg
.github/workflows/deploy.yml   Pages deploy
```

## Two placeholders to fill before going live

1. **`__KIT_FORM_ID__`** — in `index.html` (the `<form action>`). Your Kit (ConvertKit) form's
   numeric ID. Until set, the form shows a friendly "not connected yet" message locally.
2. **`__SITE_URL__`** — in `index.html`, `sitemap.xml`, `robots.txt`. Your live origin, **no trailing
   slash**, e.g. `https://YOURNAME.github.io/opstate-site`. Used for canonical + social-card URLs.

Quick fill once you know both (run from the repo root):

```bash
SITE_URL="https://YOURNAME.github.io/opstate-site"   # no trailing slash
KIT_ID="1234567"                                     # your Kit form id
LC_ALL=C find . -type f \( -name '*.html' -o -name '*.xml' -o -name '*.txt' \) \
  -not -path './.git/*' -exec sed -i '' "s#__SITE_URL__#${SITE_URL}#g; s#__KIT_FORM_ID__#${KIT_ID}#g" {} +
```

## Kit (ConvertKit) setup

1. Create a free account at kit.com.
2. **Custom field:** Subscribers → Fields → add `weekly_updates`.
3. **Form:** Grow → Landing Pages & Forms → create an **inline** form (e.g. "OpState waitlist").
   Keep double opt-in on (privacy-friendly). Note its numeric **form ID** (in the form's URL /
   embed snippet) → that's `__KIT_FORM_ID__`.
4. **Segment for weekly updates:** Subscribers → Segments → new segment where
   `weekly_updates` **is** `yes`. Send the weekly broadcasts to that segment; send the launch email
   to everyone.

The form posts `email_address` + `fields[weekly_updates]` straight to Kit. `js/waitlist.js` submits
via fetch for an inline "check your inbox" success and falls back to a native POST if that's blocked.

## Run locally

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## Deploy (GitHub Pages)

The workflow publishes the repo root on every push to `main`.

```bash
git init && git add -A && git commit -m "OpState landing site"
git branch -M main
# create an empty PUBLIC repo named opstate-site on github.com, then:
git remote add origin https://github.com/YOURNAME/opstate-site.git
git push -u origin main
```

Then in the repo on github.com: **Settings → Pages → Build and deployment → Source: GitHub Actions.**
The first push runs the deploy; the site goes live at
`https://YOURNAME.github.io/opstate-site/`.

(With the `gh` CLI installed and authed, steps collapse to:
`gh repo create opstate-site --public --source=. --remote=origin --push`.)

## Regenerating the social image

Edit `assets/og-source.svg`, then:

```bash
qlmanage -t -s 1200 -o /tmp/og assets/og-source.svg
sips -c 630 1200 /tmp/og/og-source.svg.png --out assets/og-image.png
```

## Notes

- Fonts are subsetted to Latin (~25 KB each). Re-subset from the app's `inter_*.ttf` if you add
  non-Latin copy.
- No analytics by default. Use **GitHub → Insights → Traffic** for views, and Kit for signups.
- `privacy.html` is a plain-language notice, not legal advice — review before launch.
