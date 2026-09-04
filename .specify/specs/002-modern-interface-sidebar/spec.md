# Feature 002 — Modern interface and collapsible sidebar

## Intent

As a Redmine user, I want a polished, current dark interface with more usable
content space and a sidebar I can collapse, so that long issue pages and saved
query lists remain comfortable to read on `Redmine 5.1.4.stable`.

## Evidence

The supplied issue-detail screenshot shows a visually dominant right sidebar,
weak separation between shell and content surfaces, mixed green/cyan action
styles, small muted text, and a long saved-query list competing with the issue.
Repository inspection also found disabled keyboard focus, fragile simulated
checkboxes/radios, oversized table borders, rigid content widths, a white CRM
sidebar override, and an unused JavaScript theme entry point.

## Scope

- Introduce a coherent dark design system for color, typography, spacing,
  borders, radii, shadows, and interaction states.
- Modernize navigation, cards, issue details, tables, forms, tabs, flashes,
  dialogs, pagination, code, calendar, and Gantt surfaces.
- Keep the issue description toolbar visually separated from the editor and
  preview borders.
- Make desktop content/sidebar sizing flexible and avoid reserving sidebar space
  on pages that do not have one.
- Add an accessible desktop sidebar toggle that persists its state locally.
- Keep Redmine's native flyout/sidebar behavior below 900 px.
- Remove the remote font dependency in favor of a system font stack.
- Correct plugin and custom overrides that reintroduce the legacy palette.
- Update validation, architecture, compatibility, README, and tests.

## Out of scope

- Changes to Redmine views, controllers, database, or plugin business logic.
- A guarantee for unversioned third-party plugins.
- User-specific server-side storage of the sidebar preference.
- Redmine versions other than 5.1.4.

## Acceptance criteria

- [x] The cascade remains core → base → modern base → plugins → custom.
- [x] Desktop layout uses flexible content width and a bounded right sidebar.
- [x] Project titles, quick search, and project navigation remain vertically
  separated in the desktop header.
- [x] A keyboard-accessible toggle hides/restores the sidebar and updates
  `aria-expanded`, accessible text, and tooltip.
- [x] The preference survives page navigation through `localStorage`, while
  storage failures leave the feature usable.
- [x] The toggle does not appear on `nosidebar` pages or below 900 px.
- [x] Keyboard focus is visible and native form controls remain operable.
- [x] Description toolbar buttons do not overlap the focused editor or preview
  border.
- [x] Runtime no longer requests Google Fonts.
- [x] Static validation and JavaScript syntax checks pass.
- [x] The official `redmine:5.1.4` container discovers and serves the theme.
- [x] Desktop and narrow viewport smoke tests are recorded.

## Validation evidence

- Automated: Ruby theme validator, `csstree-validator@4.0.1`, Node syntax, and
  six dependency-free sidebar behavior tests.
- Live: official `redmine:5.1.4` container at 1440 × 1000 and 800 × 900.
- Surfaces: login, issue detail, issue list/filters, issue edit/text toolbar,
  Gantt, My Page without a sidebar, desktop project-title/navigation separation,
  collapsed/expanded persistence, keyboard focus, responsive header, and native
  flyout.
- Measured contrast: body text 11.50:1, muted text 6.21:1, primary action
  8.78:1, and link text 8.54:1 against their principal surfaces.
- Optional third-party plugin pages were not available and remain unverified.
