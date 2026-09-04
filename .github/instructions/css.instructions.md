---
applyTo: "stylesheets/**/*.css"
---

# CSS instructions

- Preserve the import order in `stylesheets/application.css`: Redmine core,
  legacy-compatible base, modern base, active plugin overrides, late custom
  overrides.
- Verify every changed selector against Redmine `5.1.4` markup or an installed
  `5.1.4.stable` instance.
- Use `../images/` for theme-owned images and `../../../images/` for assets from
  the Redmine 5.1.4 core.
- Keep rules grouped by responsibility. Do not move plugin-specific selectors
  into the base theme.
- Add refreshed shared presentation to `modern.css`; do not duplicate its
  design tokens with new hard-coded palette values.
- Avoid adding `!important` unless overriding Redmine or plugin specificity
  requires it. Do not mechanically remove existing uses without visual tests.
- Check foreground/background contrast, focus visibility, hover states, table
  readability, and the layout below 899 px.
- Run `ruby scripts/validate_theme.rb` and
  `npx --yes csstree-validator@4.0.1 stylesheets` after edits.
