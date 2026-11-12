# Orbit · GitHub Navigation

[![GitHub stars](https://img.shields.io/github/stars/DaiYiqq/orbit-github-nav?style=flat&logo=github&label=stars)](https://github.com/DaiYiqq/orbit-github-nav/stargazers)

[简体中文](README.md) · English

> **One-liner**: Orbit is a Chinese-language GitHub navigation site for beginners and developers — it automatically collects, categorizes and star-tiers open-source repositories so you can find, understand and jump to the right project without signing up, without coding, and without a build step.

| Item | Value |
| --- | --- |
| Repository | https://github.com/DaiYiqq/orbit-github-nav |
| Stack | Vanilla HTML / CSS / JavaScript (no build, no framework) · GitHub Search API · PWA + Service Worker · Tauri 2 · GitHub Pages / Actions |

## Live demo

| URL | Notes |
| --- | --- |
| https://DaiYiqq.github.io/orbit-github-nav/ | GitHub Pages — all browsing features work without an account |
| https://orbit-github-nav.app.workbuddy.host/ | Published app mirror — email / SMS code sign-in works on this origin |

See [the Chinese README](README.md) for the full feature boundary and cloud/domain notes.

## Screenshots

![Desktop preview](preview/desktop.png)

<details>
<summary>Mobile preview</summary>
<img src="preview/mobile.png" width="320" alt="Mobile preview">
</details>

<details>
<summary>Project detail / install center / motion</summary>
<img src="preview/detail.png" width="420" alt="Project detail page">
<img src="preview/install.png" width="420" alt="Install center">
<img src="preview/motion.png" width="420" alt="Motion effects">
</details>

## Core features

| Feature | Details |
| --- | --- |
| Curated index | **3265 real repositories** across 16 topics; filter by category, language, star range, last update, license, 6 sort orders |
| Star tiers & trends | 100k / 50k / 10k / 5k / 1k tiers; projects active in the last 7 / 30 / 90 days |
| Full project page | Rendered README, star / fork / issue counts, license, ZIP download, clone command, 8 deep links into GitHub, contribution steps, related projects |
| Source browser | Branch switch, file tree, syntax highlighting with line numbers, per-file copy / download, commits / issues / releases |
| AI & ecosystem | Chat assistants, coding tools, image / video / audio, open models, AI communities, MCP / Skills / Agent / open-source picks |
| Blogs & papers | 18 engineering blogs, 20 classic papers (with arXiv source) |
| Search | ⌘K command palette (repos / categories / tools / papers) + live GitHub-wide search for long-tail repositories |
| Favorites & sync | Heart favorites, share, JSON import / export; optional cloud sync after email / SMS code sign-in |
| Multi-platform | Web / PWA / Tauri 2 desktop / mobile share the same `site/` code; Apple-style light / dark / system theme |
| No account needed | Search, filters, favorites, sharing and source browsing all work anonymously; guest data stays in the local browser |

## Who it's for

- **GitHub beginners** — a plain-language glossary, a 5-minute guide, and a feature-by-feature comparison with github.com.
- **Developers evaluating options** — narrow candidates by language, stars, activity and license, then read the README and check maintenance status.
- **People hunting AI tooling** — chat assistants, coding tools, open models, AI communities, MCP / Skills / Agent and classic papers in one place.
- **Offline / app users** — install as a PWA or build a Tauri 2 desktop package; works offline.
- **Privacy-minded visitors** — no sign-up for any core feature; favorites and settings stay in your own browser.
- **Self-hosters** — one-click startup scripts, a GitHub Pages deployment guide and an editable `site/config.js`.

## What makes it different

Only capabilities actually implemented in this repository are listed:

| Common pattern | Orbit |
| --- | --- |
| A link list that sends you away | A **full page** per project: README, stats, topics, license, 8 GitHub deep links, contribution steps, related projects |
| Reading code means leaving the site | Built-in **source browser**: branches, file tree, highlighting, per-file copy / download |
| Links without explanation | An 11-chapter in-site docs center + 6 built-in scripts, glossary, 5-minute guide, FAQ, explicit limitations |
| Manually maintained lists | `scripts/fetch-repos.mjs` runs 49 GitHub Search API queries; a weekly workflow refreshes the index; live GitHub-wide search covers the long tail |
| Web only | One `site/` codebase for web, PWA, Tauri 2 desktop and mobile |
| Sign-up wall | Search / filters / favorites / sharing / source browsing need no account; cloud sync and GitHub connection are optional |
| Acting on your GitHub account | Only links out to github.com; Star / Fork / Issue / PR always happen on GitHub itself; source browsing is read-only |
| Claiming to index everything | Explicitly states full indexing is impossible and documents every other limitation |

## Usage

Install Node.js 18 or newer ([nodejs.org](https://nodejs.org)), then:

| OS | Command |
| --- | --- |
| Windows | double-click `install.bat` |
| macOS / Linux | `./install.sh` |
| Start without opening a browser | `node scripts/install.mjs --no-open` |
| Just look around | open `site/index.html` directly |

The site starts at `http://127.0.0.1:4173/`; press `Ctrl + C` to stop. Or simply use the live demo above — no installation required.

```bash
node scripts/smoke-test.mjs      # full self-check
node scripts/fetch-repos.mjs     # refresh the repository index
node scripts/perf-audit.mjs      # performance / accessibility audit
```

## Contributing

See the [contributing section in the Chinese README](README.md#贡献指南). In short: use the Issue templates (bug / feature / repository nomination), edit `site/data/catalog.js` for curated content, run `node scripts/smoke-test.mjs` before a PR, and never commit secrets — `site/cloud-config.js` holds public config only.

## License

No open-source license has been declared yet (there is no `LICENSE` file in this repository). Feel free to read, try and fork for learning; **please contact the author via [Issues](https://github.com/DaiYiqq/orbit-github-nav/issues) before any commercial use**. Third-party projects, blogs and papers remain the property of their respective authors — Orbit only indexes them.

## Developer

**DaiYi (戴亿)** · GitHub [@DaiYiqq](https://github.com/DaiYiqq) · [Issues](https://github.com/DaiYiqq/orbit-github-nav/issues) · Telegram [@daiyi520](https://t.me/daiyi520) · [Telegram channel](https://t.me/rootlover52) · QQ 1703205607

---

Turning "where do I even start?" into a short list of projects filtered by topic, language, stars and activity — with README, source and maintenance status one click away — is what Orbit is for. It collects no visitor data and asks for no registration.

如果这个项目对你有帮助，欢迎点一个 ⭐ Star。
