---
name: redmine-theme-development
description: Implement, review, or document CSS, assets, responsive behavior, plugin overrides, and release checks for this BS Redmine dark theme targeting Redmine 5.1.4. Do not use for Redmine application or plugin business logic.
---

# Redmine theme development

Maintain a static, CSS-first theme that remains installable as
`public/themes/bs-redmine-theme-dark` on `Redmine 5.1.4.stable`.

## Before changing the theme

- Read the active SpecDrive feature under `.specify/specs/` and honor its scope.
- Read `docs/ARCHITECTURE.md` when ownership or cascade order is relevant.
- Read [references/redmine-5.1.4.md](references/redmine-5.1.4.md) for selector,
  asset, compatibility, or release work.

## Decisions that matter

- Preserve the import order: Redmine core → base theme → plugins → custom.
- Put shared Redmine presentation in `style.css`; keep plugin selectors in
  `plugins.css`; reserve `custom.css` for narrow late overrides.
- Treat `javascripts/theme.js` as an extension point, not a requirement to add
  behavior. Prefer CSS when it is sufficient.
- Use core 5.1.4 evidence for core asset names and selectors. Do not infer from
  newer Redmine releases.
- Preserve third-party font provenance and avoid editing binary font files.
- Treat numeric workflow status and priority classes as instance-specific.

## Verification

Run `ruby scripts/validate_theme.rb`, then
`npx --yes csstree-validator@4.0.1 stylesheets`. For visual changes, exercise
the relevant matrix in `docs/COMPATIBILITY.md`; report untested cases plainly.
Update public docs and the active task list when compatibility or behavior
changes.

