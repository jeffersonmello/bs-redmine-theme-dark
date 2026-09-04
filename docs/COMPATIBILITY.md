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
version metadata, the sidebar and customer-autocomplete runtime contracts, CSS
grammar/values, JavaScript syntax, and dependency-free behavior tests. They do
not prove visual correctness.

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

## Manual core-page matrix

For any visual release, test both a desktop viewport and a viewport below
899 px.

| Surface | Verify |
| --- | --- |
| Login | Form width, labels, focus, submit, error flash. |
| Home and projects | Cards, nested projects, top menu, project switcher. |
| Issue list | Filters, options, table, selection, pagination, context menu, progress. |
| Issue detail and edit | Attributes, status, priority, history, attachments, relations, forms. |
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
