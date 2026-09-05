# Compatibility and regression matrix

## Supported target

| Component | Status | Evidence |
| --- | --- | --- |
| Redmine `5.1.4.stable` | Targeted | Structure and core assets checked against tag `5.1.4`; static validator supports an exact Redmine-root check. |
| Other Redmine `5.1.x` releases | Not asserted | Maintenance releases may change markup or assets. Test before use. |
| Redmine 6.x and later | Unsupported | Theme location and asset handling changed upstream. |
| Modern Chromium, Firefox, Safari | Expected, not certified | The CSS uses modern layout, pseudo-elements, custom form controls, and webfonts. |

The historical screenshot predates this compatibility baseline and demonstrates
the intended visual language only.

## Automated checks

Run:

```sh
ruby scripts/validate_theme.rb
npx --yes csstree-validator@4.0.1 stylesheets
node --check javascripts/theme.js
node --test tests/*.js
```

To resolve core references against the real release:

```sh
docker run --rm \
  -v "$PWD:/theme:ro" \
  redmine:5.1.4 \
  ruby /theme/scripts/validate_theme.rb /usr/src/redmine
```

These checks validate structure, import order, CSS URL resolution, permitted
core assets, bundled Font Awesome glyphs, balanced CSS blocks, exact Redmine
version metadata, the sidebar, customer-autocomplete, history/activity,
lightbox, and local issue-timer runtime contracts, CSS grammar/values,
JavaScript syntax, and dependency-free behavior tests. They do not prove visual
correctness.

## Recorded baseline smoke test

The compatibility baseline was exercised with the official `redmine:5.1.4`
container. Redmine reported `5.1.4.stable`, discovered and selected
`bs-redmine-theme-dark`, returned HTTP 200 for the composed theme, bundled
fonts/images, and referenced core images, and rendered the dark login screen at
desktop and 800 px widths.

This is an installation and rendering smoke test, not certification of every
authenticated surface or optional plugin. Those checks remain in the manual
matrix below.

The modern-interface baseline additionally exercised an authenticated issue
detail, issue list with filters, issue-edit form and text toolbar, Gantt,
persistent sidebar collapse/restore, a page without sidebar content, and the
native mobile flyout at 1440 px and 800 px viewports. Optional plugin pages
remain unverified.

The customer-autocomplete baseline used an actual multi-value list custom field
with database ID `4` in the official container's issue-create form. The live DOM
produced the expected localized combobox and dark presentation; dependency-free
tests cover selection, `change` dispatch, keyboard removal, normalized search,
and dynamic insertion.

The history/activity/lightbox baseline used an actual issue with two journals,
Gravatar-style avatars, property changes, and an attached PNG in the official
container. History avatars remained clear of headers and centered on the
timeline; activity date headings and event separators stayed dark at 1280 px
and 800 px. Opening the attachment produced one localized modal, displayed the
full image, moved focus to its close button, and Escape returned focus to the
original attachment link. Dependency-free tests additionally cover exact
`/attachments/download/:id` resolution, backdrop and button close, modified
clicks, exclusions, keyboard opening, and dynamic insertion.

The local-timer baseline used two actual issues and the administrator's native
log-time permission in the official container. Both top and bottom actions
stayed synchronized, elapsed time survived reload and issue navigation, and
finishing one timer preserved the other. The native nested time-entry form
opened with `time_entry[hours]=0.02` for a sub-minute run, displayed `0:01`, and
kept activity and submission under user control. The running state wrapped
without horizontal overflow at 800 px and 600 px. Dependency-free tests cover
longer decimal conversion, storage failure, storage events, dynamic insertion,
and independent records.

## Manual core-page matrix

For any visual release, test both a desktop viewport and a viewport below
899 px.

| Surface | Verify |
| --- | --- |
| Login | Form width, labels, focus, submit, error flash. |
| Home and projects | Cards, nested projects, top menu, project switcher. |
| Issue list | Filters, options, table, selection, pagination, context menu, progress. |
| Issue detail and edit | Attributes, status, priority, history, attachments, relations, forms, and toolbar clearance above the description/preview border. |
| Issue timer and time entry | Authorized start action, synchronized duplicated menus, reload persistence, finish navigation, prefilled hours, and retained native action. |
| Issue comments/history | Circular avatars, timeline clearance, headers, changes, notes, thumbnails, avatar-disabled mode. |
| Activity | Dark day headings and aligned icon/avatar/title/description/author event pairs. |
| Wiki | Headings, tables, preview, preformatted code, syntax highlighting. |
| Repository | Browser, file content, line numbers, diff additions/removals. |
| Calendar and Gantt | Grid contrast, today/non-working days, issue markers, zoom controls. |
| Administration | Tabs, side navigation, settings, workflows, custom fields, disabled controls. |
| Responsive flyout | Header, project switcher, menu, avatar, content/sidebar behavior. |

## Collapsible sidebar contract

| Condition | Expected behavior |
| --- | --- |
| Desktop page with sidebar | Chevron is keyboard-accessible and exposes `aria-controls="sidebar"`. |
| Sidebar hidden | Content expands, button reports `aria-expanded="false"`, and the choice persists locally. |
| Page with `#main.nosidebar` | No theme sidebar button is created. |
| Viewport below 900 px | Theme button is hidden and Redmine's native flyout contains sidebar links. |
| Local storage blocked | Toggle works for the current page; failure is caught without breaking navigation. |

## Customer autocomplete contract

| Condition | Expected behavior |
| --- | --- |
| `issue_custom_field_values_4` is present | Native select is progressively enhanced with search and removable chips. |
| Another custom field is present | No autocomplete is inserted for that field. |
| Search contains different case or omitted accents | Matching option labels remain discoverable. |
| Keyboard navigation | Arrows move through results, Enter selects, Escape/Tab close, and empty-query Backspace removes the last chip. |
| Selection changes | Native option state changes and a bubbling `change` event is dispatched. |
| Form is inserted dynamically | One wrapper and one dropdown are initialized without duplicates. |
| JavaScript is unavailable | Original Redmine select remains visible and submittable. |

The ID `4` is installation-specific and does not imply that other Redmine
instances use the same customer field. Map and smoke-test the target instance
before changing it.

## Image lightbox contract

| Condition | Expected behavior |
| --- | --- |
| Plain click on an eligible wiki/content image | One modal dialog opens without leaving the current page. |
| Instance CSS changes the normal document cascade | Native `showModal()` keeps the viewer in the browser top layer; fixed full-viewport CSS remains the fallback. |
| Pointer moves over an eligible image | The hand pointer indicates that the image is interactive. |
| Redmine attachment or thumbnail URL | Preview uses the same-origin `/attachments/download/:id` route. |
| Image finishes loading | Image fits the viewport without enlarging a small original; zoom starts at 100% of the fitted size. |
| Zoom buttons or unmodified `+`/`-` shortcuts | Zoom changes in 25-point steps between 100% and 400% of the fitted size; the displayed percentage and button availability stay synchronized. |
| Fit button or unmodified `0` shortcut | Fitted size and scroll position are restored. |
| Wheel over the image viewport | Plain wheel input zooms; Ctrl/Cmd/Alt/Shift wheel input retains native browser behavior. |
| Enlarged image | Mouse drag, native touch scrolling, and arrow keys in the focused viewport reach overflow content while the toolbar remains visible. |
| Keyboard Tab and Shift+Tab | Enabled toolbar controls and the image viewport are reachable inside the modal focus cycle. |
| Loading, fallback, error, close/reopen, or resize | Previous zoom and pan are cleared; unloaded or failed images cannot be zoomed. |
| Escape, close button, or backdrop | Dialog closes, body scrolling returns, and focus returns to the trigger. |
| Keyboard on a bare eligible image | Enter or Space opens the dialog. |
| Ctrl/Cmd/Shift/Alt click | Browser-native link behavior remains available. |
| Avatar, emoji, editor control, or user avatar link | Image is not enhanced or intercepted. |
| Content inserted dynamically | Eligible images are enhanced once; one modal element is reused. |
| JavaScript unavailable or image load fails | Native links remain available; the dialog falls back to the rendered source and reports a localized error if needed. |

The viewer supports raster and SVG image content only. PDFs, video, audio,
gallery navigation, and conversion of raw Textile/Markdown snippets in activity
summaries are outside the theme's presentation-only scope.

On 2026-09-05, the zoom extension passed the Ruby validator, CSS Tree 4.0.1,
JavaScript syntax checks, all 25 behavior tests, and the exact-release validator
in the official `redmine:5.1.4` image. Seven zoom tests cover fitted dimensions,
bounds, keyboard focus, modified gestures, mouse dragging, resize, and source
fallback/error/reset behavior.

A disposable container reporting `Redmine 5.1.4.stable` served an actual issue
attachment (2400 × 1600 PNG) through the normal authorized download route.
The Codex in-app browser was checked at 1440 × 1000 and 390 × 844. The image
fitted the viewport, zoom buttons and wheel enlarged it, mouse dragging changed
scroll position, and the toolbar remained visible. Resize and `0` restored
100%; Tab reached the image viewport, arrow keys scrolled, and Escape restored
the attachment-link focus and body scrolling. No standalone HTML fixture was
used. The browser engine version was not captured.

Physical touch gestures, Firefox/Safari, plugin pages, and the remaining core
page matrix were not re-tested for this zoom extension.

## Local issue timer contract

| Condition | Expected behavior |
| --- | --- |
| Redmine renders `.icon-time-add` for the issue | An accessible timer control is inserted beside the unchanged native action. |
| User lacks `log_time` permission or page has no issue time-entry action | No timer control is created. |
| Timer starts | A timestamp is stored under the current user and issue; every duplicated menu reports the running state. |
| Page reload, tab visibility change, storage event, or device sleep | Elapsed `HH:MM:SS` is reconstructed from the stored epoch timestamp. |
| Another issue starts or finishes | Existing timers for other issue IDs remain unchanged. |
| Timer finishes | Only the current issue timer is removed and the native `/issues/:id/time_entries/new` form opens. |
| Elapsed duration is below one minute | The native form receives the one-minute minimum as decimal hours. |
| Local storage is missing or a write fails | No permission is bypassed; the original Redmine log-time action remains usable. |
| JavaScript is unavailable | Redmine's native issue actions and time-entry flow are unchanged. |

The timer is a browser-local convenience, not a timesheet database. It does not
sync across browsers or devices, choose an activity, write comments, submit a
time entry, detect idle time, or reconcile simultaneous edits to the same issue
from multiple tabs.

## Plugin coverage

| Styling present | Default state | Compatibility statement |
| --- | --- | --- |
| Redmine Agile / CRM / CMS / timesheet / Favorite Project / Mega Calendar selectors | Active in `plugins.css` | Version compatibility unverified; test the installed version. |
| Smile sidebar toggle | Legacy control suppressed after the theme control initializes | Version compatibility unverified. |
| Work Time icon states | Active in `style.css` | Asset references resolve; plugin behavior is unverified. |
| Redmine WYSIWYG Editor / TinyMCE | Disabled import | Legacy optional stylesheet; opt in and test before use. |

## Instance-specific mapping

The theme includes visual rules for `status-1` through `status-11` and
`priority-1` through `priority-5`. Redmine stores these as database IDs, so the
meaning can differ between installations. Confirm IDs in the target instance or
override the mappings in `stylesheets/custom.css`.

## Recording a release check

In the release or pull-request notes, record:

- exact Redmine version and commit/image tag;
- browser versions and viewport sizes;
- enabled plugins and versions;
- surfaces exercised from the matrix;
- known failures or intentionally deferred checks.
