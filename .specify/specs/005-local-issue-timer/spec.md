# Feature 005 — Local issue timer

## Intent

As a Redmine user, I want to start a timer from an issue and finish it directly
into Redmine's native time-entry screen, so that elapsed work survives page
navigation without requiring a plugin, API, or background service.

## Evidence

Redmine 5.1.4 renders the authorized issue action as
`a.icon-time-add` pointing to `/issues/:id/time_entries/new`. Its
`TimelogController#new` applies safe attributes from `params[:time_entry]`, so a
theme enhancement can open the native form with `time_entry[hours]` prefilled
while leaving project, issue, date, activity, validation, and permissions under
Redmine's control.

## Scope

- Add an accessible start/finish timer beside the native log-time action.
- Store independent active timers by current Redmine user and issue in
  `localStorage`.
- Reconstruct elapsed time from the stored start timestamp after navigation,
  reload, browser-tab synchronization, or device sleep.
- Keep duplicated top/bottom issue action menus synchronized.
- On finish, remove that issue's timer and open the native Redmine 5.1.4
  time-entry form with decimal hours and `back_url` prefilled.
- Support action menus inserted dynamically without duplicate controls.
- Provide localized Portuguese and English labels and a responsive dark-theme
  presentation.

## Out of scope

- Creating a time entry without user review or bypassing `log_time` permission.
- Server-side timer persistence, cross-device synchronization, billing, idle
  detection, pause/resume, descriptions, or activity selection.
- Reconciling simultaneous edits to the same issue timer in separate tabs.
- Redmine versions other than 5.1.4.

## Acceptance criteria

- [x] A timer is offered only when Redmine renders its authorized
  `.icon-time-add` issue action.
- [x] Starting stores an issue-specific timestamp under a user-specific
  `localStorage` key and updates every duplicate issue action.
- [x] Independent timers for other issues are preserved.
- [x] Elapsed `HH:MM:SS` remains correct after reload and tab visibility changes.
- [x] Finishing removes only the current issue timer and opens the native
  `/issues/:id/time_entries/new` form.
- [x] The form receives rounded decimal hours with a one-minute minimum plus a
  return URL to the issue.
- [x] The control has button semantics, localized labels, visible running state,
  `aria-pressed`, and a non-chatty elapsed-time label.
- [x] Missing or blocked local storage leaves Redmine's native log-time action
  intact and does not break other theme modules.
- [x] Dynamic action menus are enhanced once and all automated and live
  Redmine 5.1.4 checks pass.
