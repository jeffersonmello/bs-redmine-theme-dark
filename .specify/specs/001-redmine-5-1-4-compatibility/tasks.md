# Tasks — Redmine 5.1.4 compatibility baseline

## Discovery

- [x] Inventory files, cascade, assets, selectors, plugins, and history.
- [x] Verify installation paths and core assets against upstream Redmine 5.1.4.
- [x] Record architectural boundaries and known compatibility risks.

## Implementation

- [x] Correct project-switcher, core-image, mobile-header, and CSS value issues.
- [x] Add deterministic theme validation and CI.
- [x] Replace the obsolete README with Redmine 5.1.4 installation, usage,
  architecture, plugin, validation, and license guidance.
- [x] Add architecture, compatibility, contribution, and third-party docs.
- [x] Add repository instructions, two custom agents, two skills, and SpecDrive
  artifacts.

## Validation

- [x] Run the Ruby repository validator.
- [x] Run `csstree-validator@4.0.1` across all stylesheets.
- [x] Run the validator against the official `redmine:5.1.4` container root.
- [x] Boot the official container, select the theme, verify its HTTP assets,
  and smoke-test the login at desktop and 800 px widths.
- [ ] Complete and record the live browser matrix at desktop and below 899 px.
