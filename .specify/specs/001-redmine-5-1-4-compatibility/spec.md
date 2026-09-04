# Feature 001 — Redmine 5.1.4 compatibility baseline

## Intent

As a Redmine administrator, I want a documented and verifiable dark theme for
`Redmine 5.1.4.stable`, so that I can install, select, maintain, and evaluate it
without relying on obsolete Redmine 3 instructions.

## Scope

- Establish Redmine 5.1.4 as the explicit compatibility target.
- Correct installation and theme-selection instructions.
- Document the runtime cascade, files, assets, plugin boundaries, and known
  instance-specific behavior.
- Add deterministic static checks and a version-aware Redmine-root check.
- Add repository instructions, custom agents, reusable skills, and SpecDrive
  artifacts for future maintenance.
- Correct objective CSS or asset-path issues found while establishing the
  baseline.

## Out of scope

- A redesign of the visual language.
- Guaranteed compatibility with Redmine versions other than 5.1.4.
- Guaranteed compatibility with every version of every styled plugin.
- Renumbering workflow statuses or priorities for a particular installation.
- Rebuilding or upgrading Font Awesome.

## Acceptance criteria

- [x] The README names `Redmine 5.1.4.stable` and uses
  `public/themes/bs-redmine-theme-dark` in installation instructions.
- [x] The README tells administrators to select `bs-redmine-theme-dark`, not the
  light theme.
- [x] The CSS import order is core → base → plugins → custom.
- [x] Every theme-owned stylesheet, image, and font reference resolves locally;
  permitted core references resolve in a Redmine 5.1.4 root check.
- [x] CSS passes the pinned `csstree-validator` check.
- [x] The architecture and compatibility matrix are documented.
- [x] Agent instructions, two custom agent roles, theme-development and
  SpecDrive skills, a constitution, plan, and task list exist.
- [x] Bundled third-party font licensing is documented.
- [x] The official `redmine:5.1.4` image boots with the theme selected, serves
  theme and referenced core assets, and renders the login at desktop and
  800 px widths.
- [ ] A live Redmine 5.1.4 visual smoke test covers the core-page matrix at
  desktop and narrow widths.

## Known constraints

- Roboto is fetched from Google Fonts and falls back to `sans-serif` offline.
- Numeric status and priority classes depend on database IDs.
- The WYSIWYG stylesheet is opt-in and targets legacy TinyMCE markup.
