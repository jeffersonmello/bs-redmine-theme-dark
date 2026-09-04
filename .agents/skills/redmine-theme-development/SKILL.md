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

- Preserve the import order: Redmine core → legacy-compatible base → modern
  base → plugins → custom.
- Keep legacy selector coverage and icons in `style.css`, shared design tokens
  and refreshed presentation in `modern.css`, plugin selectors in
  `plugins.css`, and narrow late overrides in `custom.css`.
- Preserve the accessible desktop sidebar toggle in `javascripts/theme.js`.
  Preserve the isolated custom-field 4 customer autocomplete in that entrypoint.
  Preserve the isolated accessible image lightbox, same-origin Redmine
  attachment resolution, avatar exclusions, and native modified-click behavior.
  Preserve the isolated local issue timer, using Redmine's rendered log-time
  action as its permission gate and the native time-entry form as its submission
  boundary. Keep presentation in CSS and JavaScript dependency-free.
- Use core 5.1.4 evidence for core asset names and selectors. Do not infer from
  newer Redmine releases.
- Preserve third-party font provenance and avoid editing binary font files.
- Treat numeric workflow status and priority classes as instance-specific.
- For issue history and activity, verify the exact Redmine 5.1.4 journal and
  `dt`/`dd` activity markup. Keep avatars within a bounded column and keep the
  lightbox out of avatar, emoji, toolbar, and user-link images.
- For local timer work, preserve user/issue namespacing, epoch-based elapsed
  time, independent timers, same-origin routes, storage failure handling, and
  review in Redmine's native time-entry form.

## Verification

Run `ruby scripts/validate_theme.rb`, then
`npx --yes csstree-validator@4.0.1 stylesheets` and
`node --check javascripts/theme.js` and
`node --test tests/*.js`. For visual changes, exercise
the relevant matrix in `docs/COMPATIBILITY.md`; report untested cases plainly.
Update public docs and the active task list when compatibility or behavior
changes.
