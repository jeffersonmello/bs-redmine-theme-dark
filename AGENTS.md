# Repository guide for coding agents

This repository is a static dark theme whose compatibility target is exactly
`Redmine 5.1.4.stable`. There is no application build, database, or package
manager required by the theme at runtime.

## Read before changing files

1. Read `.specify/memory/constitution.md` for non-negotiable project rules.
2. Read the active feature's `spec.md`, `plan.md`, and `tasks.md` under
   `.specify/specs/`.
3. For theme work, read
   `.agents/skills/redmine-theme-development/SKILL.md` and its Redmine 5.1.4
   reference.
4. Use `docs/ARCHITECTURE.md` for ownership and load-order questions and
   `docs/COMPATIBILITY.md` for the regression matrix.

## Architecture invariants

- `stylesheets/application.css` must import, in order, the Redmine core CSS,
  `style.css`, `plugins.css`, and `custom.css`.
- Keep the core import as `../../../stylesheets/application.css`; the theme is
  installed at `public/themes/bs-redmine-theme-dark` on Redmine 5.1.4.
- Put broad theme rules in `style.css`, active plugin overrides in
  `plugins.css`, and narrow late overrides in `custom.css`.
- `stylesheets/plugins/redmine_wysiwyg_editor.css` is optional and is not
  imported by default.
- Keep `javascripts/theme.js` present. Prefer CSS; add JavaScript only when CSS
  cannot express the required behavior.
- Preserve bundled Font Awesome files and their notice. Do not change or
  regenerate third-party binaries without updating `THIRD_PARTY_NOTICES.md`.

## Redmine-specific constraints

- Check selectors and core asset names against the upstream `5.1.4` tag, not
  against `master`, Redmine 6, or Redmine 7.
- References to Redmine core assets from `stylesheets/style.css` use
  `../../../images/<asset>`; theme-owned assets use `../images/<asset>`.
- Classes such as `status-1` through `status-11` and `priority-1` through
  `priority-5` depend on database IDs. Treat those colors as optional,
  instance-specific enhancements.
- Do not claim a plugin is compatible merely because a selector exists. Plugin
  compatibility needs a versioned visual smoke test.
- Do not silently remove the Roboto fallback or Font Awesome icon font.

## Validation

Run before handing off any change:

```sh
ruby scripts/validate_theme.rb
npx --yes csstree-validator@4.0.1 stylesheets
```

When Docker is available, also validate against the actual Redmine release:

```sh
docker run --rm \
  -v "$PWD:/theme:ro" \
  redmine:5.1.4 \
  ruby /theme/scripts/validate_theme.rb /usr/src/redmine
```

For visual changes, exercise the pages listed in `docs/COMPATIBILITY.md` at
desktop width and below 899 px. Record anything not tested instead of inferring
support.

## Documentation and specs

- Keep `README.md`, `docs/`, and the active SpecDrive task list synchronized
  with behavioral or compatibility changes.
- New non-trivial work gets a numbered directory under `.specify/specs/` with
  `spec.md`, `plan.md`, and `tasks.md`.
- Mark a task complete only after its acceptance criterion is demonstrably met.
- Write public documentation in English; keep identifiers, commands, paths,
  product names, and exact version strings unchanged.

