# Tasks — Image lightbox zoom

## Discovery

- [x] Read the constitution, theme skill, Redmine 5.1.4 reference, and existing
  lightbox specification.
- [x] Define fitted-size zoom, panning, lifecycle resets, and preserved native
  behavior in this feature specification.

## Implementation

- [x] Add bounded zoom controls and a scrollable image viewport.
- [x] Add wheel/keyboard zoom, Fit reset, mouse dragging, and keyboard access.
- [x] Reset state during loading, fallback, errors, close/reopen, and resize.
- [x] Add responsive dark-theme presentation.
- [x] Extend dependency-free lightbox behavior tests.
- [x] Update README, architecture, and the compatibility contract.

## Validation

- [x] Run `ruby scripts/validate_theme.rb`.
- [x] Run `npx --yes csstree-validator@4.0.1 stylesheets`.
- [x] Run `node --check javascripts/theme.js` and `node --test tests/*.js`.
- [x] Run the exact-release validator using `redmine:5.1.4` when Docker is
  available.
- [x] Exercise zoom controls, fit, panning, focus, and close at desktop and
  below 899 px in a browser; verify zoom bounds in behavior tests.
- [x] Record which checks used a local fixture and which used live Redmine,
  including any untested matrix surfaces.

## Evidence and remaining release coverage

- All 25 Node behavior tests passed, including seven zoom regressions.
- Ruby, CSS Tree 4.0.1, JavaScript syntax, exact Redmine 5.1.4 Docker
  validation, and `git diff --check` passed.
- An actual Redmine issue attachment was exercised in the Codex in-app browser
  at 1440 × 1000 and 390 × 844; no standalone HTML fixture was used.
- Physical touch gestures, Firefox/Safari, optional plugins, and the remaining
  core-page matrix were not re-tested. See `docs/COMPATIBILITY.md`.
