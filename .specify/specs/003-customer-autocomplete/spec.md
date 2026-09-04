# Feature 003 — Customer custom-field autocomplete

## Intent

As a Redmine issue editor, I want the customer multi-select custom field to
support quick text search and removable chips, so that choosing from a long
customer list remains efficient without changing Redmine's submitted values.

## Source behavior

The supplied browser script targets `issue_custom_field_values_4`, filters
accent-insensitively, presents selected values as chips, limits the dropdown to
80 results, and initializes after dynamic DOM updates. The theme integration
keeps those behaviors while moving presentation out of inline styles and into
the dark design system.

## Scope

- Progressively enhance only the select with ID
  `issue_custom_field_values_4` when it contains non-empty options.
- Keep the original select in the form so Redmine receives its normal values.
- Provide accent-insensitive search, selected chips, and an 80-result limit.
- Support mouse and keyboard selection/removal with combobox/listbox semantics.
- Match the theme palette at desktop and narrow widths.
- Reinitialize safely when Redmine inserts the field dynamically.

## Out of scope

- Changing the custom-field ID or values in the Redmine database.
- Loading customer data from an API or adding server-side search.
- Applying autocomplete automatically to other custom fields.
- Replacing Redmine validation or issue-save behavior.

## Acceptance criteria

- [x] The enhancement activates only when custom field 4 is present.
- [x] Searching ignores letter case and diacritics.
- [x] Selected labels render as removable, keyboard-focusable chips.
- [x] Arrow keys and Enter select a result; Escape and Tab close the list;
  Backspace removes the last chip when the query is empty.
- [x] Selection updates the original option and dispatches a bubbling `change`
  event.
- [x] The input exposes combobox/listbox ARIA state and localized labels.
- [x] Dynamic insertion does not create duplicate wrappers or dropdowns.
- [x] The original select remains untouched when JavaScript is unavailable.
- [x] Automated theme and behavior checks pass on Redmine 5.1.4.stable.

## Validation evidence

- Automated: three customer-autocomplete behavior tests cover normalized
  search, native selection and `change`, label chips, Backspace removal,
  combobox/listbox state, and duplicate-free dynamic insertion. Six existing
  sidebar tests remain green.
- Live: the official `redmine:5.1.4` container rendered an issue create form
  with a multi-value list custom field whose database ID was exactly `4`.
- Runtime: the native DOM ID was `issue_custom_field_values_4`; the theme
  created `issue_custom_field_values_4_search`, exposed it as the localized
  “Buscar clientes” combobox, and rendered the control with the dark design
  system.
- Degradation: hiding is applied only through the enhancement CSS class, so a
  page on which JavaScript does not initialize retains the original select.
