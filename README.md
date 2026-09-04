# BS Redmine Theme Dark

[![Redmine 5.1.4](https://img.shields.io/badge/Redmine-5.1.4.stable-B32024?logo=redmine&logoColor=white)](https://www.redmine.org/news/146)
[![CSS3](https://img.shields.io/badge/CSS3-static_theme-1572B6?logo=css3&logoColor=white)](stylesheets/style.css)
[![Vanilla JavaScript](https://img.shields.io/badge/JavaScript-no_dependencies-F7DF1E?logo=javascript&logoColor=111827)](javascripts/theme.js)
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
- Issue editor tabs and formatting controls with clear spacing above the
  description and preview borders.
- Semantic design tokens for a consistent, modern palette, spacing, borders,
  radii, shadows, and interaction states.
- Collapsible desktop sidebar with an accessible toggle and a locally persisted
  preference.
- Per-issue local timers that survive navigation and finish in Redmine's native
  time-entry form with elapsed hours prefilled.
- Repaired issue history and activity cards with aligned circular avatars,
  dark date headings, and compact event timelines.
- Accessible in-page lightbox for wiki and attachment images, including original
  Redmine attachment resolution, Escape/backdrop close, and focus restoration.
- Searchable customer chips for the instance-specific custom field 4, with
  keyboard navigation and no server-side dependency.
- Responsive Redmine flyout behavior below 899 px.
- Local Font Awesome 5.15.2 solid webfont for interface icons.
- Styling for issues, workflows, progress, wiki/code, repository diffs, Gantt,
  calendars, Select2, context menus, and administration pages.
- Isolated plugin overrides and a final customization layer.
- No production build step or external JavaScript dependency.

## Requirements

- `Redmine 5.1.4.stable`.
- Permission to copy or clone into the Redmine `public/themes` directory.
- A browser with modern CSS, JavaScript, local-storage, and webfont support.

The interface uses the operating system's native sans-serif stack. Font Awesome
is bundled locally, so the theme makes no runtime font or icon CDN request.

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
  → style.css       legacy-compatible selector coverage
  → modern.css      design system, accessibility, and flexible layout
  → plugins.css     active optional-plugin overrides
  → custom.css      narrow, last-loaded fixes
```

`javascripts/theme.js` progressively adds the desktop sidebar control, local
issue timer, customer autocomplete, and content-image lightbox described below.
The theme remains usable when JavaScript or local storage is unavailable; in
that case native Redmine form controls, time-entry actions, attachment links,
and the visible sidebar remain available. See
[Theme architecture](docs/ARCHITECTURE.md) for the full file and dependency map.

## Sidebar control

On pages that contain a sidebar, use the chevron button on its left edge to
hide or restore it. The choice is stored only in the current browser and is
reapplied on later pages. The control is intentionally absent on pages without
a sidebar and below 900 px, where Redmine's native flyout menu owns navigation.

## Local issue timer

On an issue where Redmine shows the authorized **Log time** action, the theme
adds **Start timer** beside it. Starting stores the timestamp in this browser;
the same issue continues counting after navigation, reload, tab changes, or
device sleep. Separate issues can run at the same time, and duplicated action
menus on the issue page show the same state.

Choose **Finish timer** to remove only that issue's local timer and open
Redmine 5.1.4's native time-entry form. The elapsed duration is rounded to the
nearest minute (minimum one minute) and prefilled as decimal hours. Review the
date, activity, comment, and hours before submitting; Redmine remains
responsible for permissions and validation.

Timer data is local to the current browser origin and namespaced by the signed-in
Redmine user when the user ID is available. It is not sent to a theme service,
synchronized across devices, or submitted automatically. Clearing site data or
using another browser loses active timers. If local storage is unavailable, the
timer is omitted or reports an error while the native **Log time** link remains
usable.

## Customer autocomplete

When an issue form contains the select `issue_custom_field_values_4`, the theme
enhances it with an accent-insensitive customer search and removable chips. The
original select remains the submitted form control, so Redmine receives the
same option values and `change` events as it would without the enhancement.

The control supports mouse input plus Arrow Up/Down, Enter, Escape, Tab, and
Backspace. It is initialized only after the target field exists and can also
handle forms inserted dynamically. This field ID is installation-specific: if
the customer field has another ID, update `SELECT_ID` in
`javascripts/theme.js` and test the issue create/edit forms before deployment.

## Image lightbox

A plain click on an eligible image inside issue descriptions, comments, wikis,
attachment thumbnails, or the activity feed opens a full-viewport preview.
Redmine 5.1.4 thumbnail and attachment-page URLs are resolved to the authorized
`/attachments/download/:id` image; no permission checks are bypassed and no
third-party viewer is loaded. Eligible images show the hand pointer, and the
preview uses the browser's native modal layer with a fixed-position fallback so
it cannot be rendered after the page footer.

Use the close button, Escape, or the backdrop to dismiss the preview. Keyboard
focus moves into the dialog and returns to the triggering image or link after
close. Ctrl/Cmd/Shift/Alt clicks keep the browser's native link behavior.
Avatars, emoji, toolbar icons, PDFs, video, audio, and other non-image files are
not intercepted. If JavaScript is disabled, the original attachment link works
normally.

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
| Smile sidebar toggle | Legacy control is suppressed when the theme-owned sidebar control initializes; plugin behavior remains unverified. |
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
node --check javascripts/theme.js
node --test tests/*.js
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
- [History, activity, and lightbox spec](.specify/specs/004-history-activity-lightbox/spec.md)
  — current behavior and acceptance criteria for comments, activity, avatars,
  and image preview.
- [Local issue timer spec](.specify/specs/005-local-issue-timer/spec.md) — local
  persistence, permission boundary, native time-entry handoff, and acceptance
  criteria.

## License and credits

Theme code is distributed under the [GNU General Public License v3](LICENSE).
Bundled Font Awesome assets keep their own licenses; see
[Third-party notices](THIRD_PARTY_NOTICES.md).

The project originated from the BS Redmine theme by Bezva Studio and is
maintained in this repository by its contributors.
