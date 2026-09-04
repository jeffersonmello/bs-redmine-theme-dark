# Plan — Local issue timer

## Technical approach

1. Detect the exact Redmine 5.1.4 issue action
   `#content > .contextual > a.icon-time-add`; its presence is the permission
   gate.
2. Derive the issue ID and native time-entry URL from that same-origin link
   instead of parsing translated text or inventing routes.
3. Add a fourth isolated dependency-free module to `theme.js` with a
   user-specific, versioned `localStorage` object keyed by issue ID.
4. Calculate display time from `Date.now() - startedAt`, using a one-second
   rendering interval only while the page is open.
5. On finish, round to the nearest minute with a one-minute minimum, convert to
   decimal hours, remove only the finished timer, and navigate to the native
   form with `time_entry[hours]` and `back_url` query parameters.
6. Style the generated button/output in `modern.css` and add responsive rules.
7. Add dependency-free DOM tests, validator contracts, documentation, and a
   live smoke test against the official `redmine:5.1.4` image.

## Files and ownership

- `javascripts/theme.js`: isolated timer state, rendering, and native-form
  navigation.
- `stylesheets/modern.css`: start/running/error presentation and narrow layout.
- `tests/theme_issue_timer_test.js`: persistence, multiple issues, elapsed time,
  navigation, storage failure, and dynamic initialization.
- `scripts/validate_theme.rb`: static timer contracts.
- `README.md`, `docs/`, agent guidance: behavior, privacy boundary, and Redmine
  5.1.4 evidence.

## Risks and controls

- **Permission bypass:** initialize only from Redmine's rendered log-time link.
- **Cross-user data exposure:** namespace local storage by the current Redmine
  user ID and current origin.
- **Clock drift/sleep:** store epoch milliseconds and recompute instead of
  incrementing a counter.
- **Lost unrelated timers:** update only the selected issue key.
- **Invalid zero-hour entry:** round with a one-minute minimum before opening
  the form.
- **Storage restrictions:** catch all reads/writes and retain the native action.
- **Duplicate action menus:** mark links once and render all controls from one
  stored state.
