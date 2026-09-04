# Contributing

Contributions should preserve the theme's static deployment model and explicit
`Redmine 5.1.4.stable` target.

## Workflow

1. Read `AGENTS.md` and `.specify/memory/constitution.md`.
2. For non-trivial work, add or update a numbered feature under
   `.specify/specs/` before implementation.
3. Keep base, plugin, and narrow custom CSS in their owning files.
4. Add theme-owned assets under `images/` or `webfonts/`; use documented core
   paths for Redmine-owned assets.
5. Update README and durable docs when installation, behavior, compatibility,
   plugin coverage, or validation changes.
6. Run the automated checks and the relevant manual matrix.

## Required checks

```sh
ruby scripts/validate_theme.rb
npx --yes csstree-validator@4.0.1 stylesheets
```

Docker can bind the checkout read-only to validate exact core references:

```sh
docker run --rm \
  -v "$PWD:/theme:ro" \
  redmine:5.1.4 \
  ruby /theme/scripts/validate_theme.rb /usr/src/redmine
```

Describe visual checks in the pull request. If a plugin or browser was not
available, say so rather than generalizing from static validation.

