---
applyTo: "javascripts/**/*.js,tests/**/*.js"
---

# JavaScript instructions

- Keep `javascripts/theme.js` dependency-free and directly runnable by Redmine
  5.1.4 without bundling or transpilation.
- Keep the sidebar and customer-autocomplete modules isolated so one missing DOM
  contract cannot prevent the other from initializing.
- Enhance only `issue_custom_field_values_4`; keep its native select as the
  submitted source of truth and dispatch a bubbling `change` event after edits.
- Preserve combobox/listbox ARIA state and mouse plus Arrow, Enter, Escape, Tab,
  and Backspace behavior.
- Put visual styles in `stylesheets/modern.css`, not inline JavaScript.
- Guard dynamic initialization against duplicate wrappers and missing browser
  APIs.
- Run `node --check javascripts/theme.js` and `node --test tests/*.js` after
  edits.
