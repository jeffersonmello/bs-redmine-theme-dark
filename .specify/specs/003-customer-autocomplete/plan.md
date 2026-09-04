# Plan — Customer custom-field autocomplete

## Technical approach

1. Add a self-contained progressive-enhancement module to `theme.js` after the
   sidebar module, keeping their state and failure paths independent.
2. Detect `issue_custom_field_values_4`; leave all other fields unchanged.
3. Preserve the native select as the submitted form control and hide it only
   after successful initialization.
4. Read options live from the select, filter normalized labels locally, and
   synchronize selection through native option state plus a `change` event.
5. Render the combobox, listbox, and chip presentation from semantic rules in
   `modern.css`, without inline colors or external dependencies.
6. Cover initialization, normalized search, selection, chips, Backspace, and
   dynamic insertion with Node tests and a live Redmine 5.1.4 smoke test.

## Files and ownership

- `javascripts/theme.js`: customer-field behavior and DOM integration.
- `stylesheets/modern.css`: autocomplete, dropdown, active option, and chip
  presentation.
- `tests/theme_customer_autocomplete_test.js`: dependency-free behavior tests.
- `scripts/validate_theme.rb`: static runtime-contract checks.
- `README.md`, `docs/`: instance-specific setup and compatibility boundaries.

## Risks and controls

- **Wrong instance field:** target the exact supplied ID and document it as
  instance-specific.
- **Lost form values:** mutate native `<option>.selected` state instead of
  maintaining a separate data model.
- **Duplicate controls:** mark an enhanced select and guard observer reruns.
- **Unusable keyboard flow:** expose combobox state and implement standard
  navigation keys.
- **JavaScript failure:** hide the native select only after the replacement DOM
  is ready; no build step or runtime dependency is introduced.

