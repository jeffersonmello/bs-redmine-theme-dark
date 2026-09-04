# BS Redmine Theme Dark

[![Redmine 5.1.4](https://img.shields.io/badge/Redmine-5.1.4.stable-B32024?logo=redmine&logoColor=white)](https://www.redmine.org/news/146)
[![CSS3](https://img.shields.io/badge/CSS3-static_theme-1572B6?logo=css3&logoColor=white)](stylesheets/style.css)
[![Font Awesome 5.15.2](https://img.shields.io/badge/Font_Awesome-5.15.2-528DD7?logo=fontawesome&logoColor=white)](THIRD_PARTY_NOTICES.md)
[![Validate theme](https://github.com/jeffersonmello/bs-redmine-theme-dark/actions/workflows/validate.yml/badge.svg)](https://github.com/jeffersonmello/bs-redmine-theme-dark/actions/workflows/validate.yml)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)

A CSS-first dark theme for Redmine, inspired by Material Design and focused on
readable issue tracking, project navigation, forms, wiki pages, repositories,
calendars, and administration screens.

> **Compatibility target:** `Redmine 5.1.4.stable`. Other Redmine versions and
> plugin versions are not implied; see the [compatibility matrix](docs/COMPATIBILITY.md).

![BS Redmine Theme Dark showing an issue list, filters, navigation, and sidebar](screenshot.png)

## Highlights

- Dark surfaces with cyan accents and clear table, form, flash, and modal states.
- Responsive Redmine flyout behavior below 899 px.
- Local Font Awesome 5.15.2 solid webfont for interface icons.
- Styling for issues, workflows, progress, wiki/code, repository diffs, Gantt,
  calendars, Select2, context menus, and administration pages.
- Isolated plugin overrides and a final customization layer.
- No production build step or JavaScript dependency.

## Requirements

- `Redmine 5.1.4.stable`.
- Permission to copy or clone into the Redmine `public/themes` directory.
- A browser with modern CSS and webfont support.

Roboto is requested from Google Fonts. When it is unavailable, the theme falls
back to the browser's generic `sans-serif` font. Font Awesome is bundled locally.

## Installation

From the Redmine root:

```sh
cd public/themes
git clone https://github.com/jeffersonmello/bs-redmine-theme-dark.git bs-redmine-theme-dark
```

The resulting entrypoint must be:

```text
<redmine-root>/public/themes/bs-redmine-theme-dark/stylesheets/application.css
```

Restart Redmine if the theme does not appear immediately. Then sign in as an
administrator and open:

```text
Administration → Settings → Display → Theme
```

Select `bs-redmine-theme-dark` and save.

The official Redmine guide confirms that Redmine 5 themes belong under
[`public/themes`](https://www.redmine.org/projects/redmine/wiki/Themes).

## How it works

Redmine loads `stylesheets/application.css`, which composes the cascade in this
order:

```text
Redmine 5.1.4 core CSS
  → style.css       base dark theme and Redmine components
  → plugins.css     active optional-plugin overrides
  → custom.css      narrow, last-loaded fixes
```

`javascripts/theme.js` is retained as Redmine's theme extension point but is
intentionally behavior-free. See [Theme architecture](docs/ARCHITECTURE.md) for
the full file and dependency map.

## Customization

Put installation-specific overrides at the end of
`stylesheets/custom.css`. Keeping them there preserves the upstream theme and
makes future updates easier to review.

The built-in workflow colors use numeric classes such as `status-1` and
`priority-2`. Those numbers are database IDs and may mean something different
in your Redmine instance. Override the mappings in `custom.css` when needed.

## Plugin styling

Selector coverage is not the same as versioned plugin compatibility. Test each
installed plugin version before production use.

| Integration | State |
| --- | --- |
| Redmine Agile, CRM, CMS, timesheet, Favorite Project, and Mega Calendar-style views | Rules active in `stylesheets/plugins.css`; installed versions are unverified. |
| Smile sidebar toggle | Rule active; the toggle is hidden below 899 px. |
| Work Time controls | Start, active-clock, and pause assets are included. |
| Redmine WYSIWYG Editor / TinyMCE | Legacy stylesheet available but disabled by default. |

To evaluate the WYSIWYG stylesheet, uncomment this line in
`stylesheets/plugins.css` and visually test the installed plugin:

```css
@import url(plugins/redmine_wysiwyg_editor.css);
```

## Validation

The first command uses only the Ruby standard library. The second uses a pinned
CSS grammar and value validator:

```sh
ruby scripts/validate_theme.rb
npx --yes csstree-validator@4.0.1 stylesheets
```

When Docker is available, validate core paths against the exact Redmine image:

```sh
docker run --rm \
  -v "$PWD:/theme:ro" \
  redmine:5.1.4 \
  ruby /theme/scripts/validate_theme.rb /usr/src/redmine
```

Static checks cannot prove visual compatibility. Before a release, complete the
core-page and responsive checks in [Compatibility](docs/COMPATIBILITY.md).
The documented baseline includes a live login smoke test using the official
`redmine:5.1.4` image at desktop and 800 px widths.

## Repository guidance

- [Architecture](docs/ARCHITECTURE.md) — runtime flow, file ownership, assets,
  plugin boundary, and high-risk coupling.
- [Compatibility](docs/COMPATIBILITY.md) — support statement, automated checks,
  manual matrix, and plugin caveats.
- [Contributing](CONTRIBUTING.md) — spec-driven change and validation workflow.
- [AGENTS.md](AGENTS.md) — repository instructions for coding agents.
- [SpecDrive baseline](.specify/specs/001-redmine-5-1-4-compatibility/spec.md) —
  scope, acceptance criteria, plan, and tasks for the 5.1.4 baseline.

## License and credits

Theme code is distributed under the [GNU General Public License v3](LICENSE).
Bundled Font Awesome assets keep their own licenses; see
[Third-party notices](THIRD_PARTY_NOTICES.md).

The project originated from the BS Redmine theme by Bezva Studio and is
maintained in this repository by its contributors.
