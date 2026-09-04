---
applyTo: "javascripts/**/*.js,tests/**/*.js"
---

# JavaScript instructions

- Keep `javascripts/theme.js` dependency-free and directly runnable by Redmine
  5.1.4 without bundling or transpilation.
- Keep the sidebar, customer-autocomplete, image-lightbox, and issue-timer
  modules isolated so one missing DOM contract cannot prevent another from
  initializing.
- Enhance only `issue_custom_field_values_4`; keep its native select as the
  submitted source of truth and dispatch a bubbling `change` event after edits.
- Preserve combobox/listbox ARIA state and mouse plus Arrow, Enter, Escape, Tab,
  and Backspace behavior.
- Put visual styles in `stylesheets/modern.css`, not inline JavaScript.
- Guard dynamic initialization against duplicate wrappers and missing browser
  APIs.
- For the lightbox, intercept only unmodified primary clicks on eligible
  content images. Exclude gravatars, avatars, emoji, editor controls, and user
  links; keep Redmine attachment resolution same-origin and permission-bound.
- Preserve dialog semantics, Escape/backdrop close, scroll locking, keyboard
  activation for bare images, and focus restoration. Do not add a third-party
  modal dependency.
- Initialize the issue timer only from Redmine's same-origin
  `.icon-time-add` issue action. Keep timers independent by issue, namespace
  storage by the current user, derive elapsed time from an epoch timestamp, and
  synchronize duplicated menus.
- Finishing a timer must remove only that issue record and open the native
  time-entry form with `time_entry[hours]` for user review. Do not submit time,
  choose an activity, or infer permission in the theme.
- Run `node --check javascripts/theme.js` and `node --test tests/*.js` after
  edits.
