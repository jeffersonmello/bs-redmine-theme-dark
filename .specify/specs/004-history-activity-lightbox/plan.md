# Plan — History, activity, and image lightbox

## Technical approach

1. Override the exact Redmine 5.1.4 journal and activity selectors in
   `modern.css`, after the legacy theme, without changing core markup.
2. Replace the conflicting journal padding/negative-avatar-margin layout with a
   positioned avatar and theme-owned timeline pseudo-element.
3. Treat each activity `dt`/`dd` pair as one visual event while preserving the
   upstream definition-list structure and event-type icon classes.
4. Add an isolated lightbox module after the existing sidebar and customer
   modules in `theme.js`.
5. Use delegated click handling for dynamic content; enhance bare images for
   keyboard access and retain anchor focus when one already exists.
6. Derive full attachment sources from Redmine's stable 5.1.4
   `/attachments/:id` and `/attachments/thumbnail/:id` paths.
7. Add dependency-free DOM tests, validator contracts, documentation, and live
   smoke checks against the official `redmine:5.1.4` container.
8. Open a native `<dialog>` with `showModal()` when supported so the viewer uses
   the browser top layer; retain the strongly scoped fixed-position CSS as the
   fallback for older engines.

## Files and ownership

- `stylesheets/modern.css`: history/activity repair and lightbox presentation.
- `javascripts/theme.js`: isolated modal lifecycle and image-source resolution.
- `tests/theme_lightbox_test.js`: image eligibility, source, open, and close
  behavior.
- `scripts/validate_theme.rb`: static history/activity/lightbox contracts.
- `README.md`, `docs/`: behavior, scope, and compatibility evidence.

## Risks and controls

- **Avatar interception:** explicitly exclude gravatars and avatar containers.
- **Lost attachment navigation:** intercept only plain primary clicks on an
  eligible image; modified clicks retain native behavior.
- **Low-resolution preview:** translate Redmine attachment and thumbnail paths
  to the original authorized download route.
- **Focus loss:** focus the close button on open and restore the triggering image
  or link on close.
- **Dynamic duplication:** create one modal by stable ID and mark enhanced
  images/links idempotently.
- **Mobile overflow:** constrain the dialog and image to the visual viewport.
- **Instance cascade or stale presentation:** use the browser top layer plus a
  high-specificity fixed fallback, and expose the hand pointer on triggers.
